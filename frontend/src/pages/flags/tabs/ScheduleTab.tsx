import { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Button, Card, Grid, Stack, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { environmentApi, scheduleApi } from "../../../api/resources";
import { getApiErrorMessage } from "../../../api/client";
import { EnvironmentChip } from "../../../components/common/EnvironmentChip";
import { LoadingState } from "../../../components/common/States";
import type { EnvironmentResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function ScheduleTab({ flagId }: { flagId: number }) {
  const { isAdmin } = useAuth();
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [start, setStart] = useState<Record<number, Date | null>>({});
  const [end, setEnd] = useState<Record<number, Date | null>>({});
  const [configured, setConfigured] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Record<number, string | null>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    environmentApi
      .listActive()
      .then(async (envs) => {
        if (!active) return;
        setEnvironments(envs);

        const startMap: Record<number, Date | null> = {};
        const endMap: Record<number, Date | null> = {};
        const configuredMap: Record<number, boolean> = {};

        await Promise.all(
          envs.map(async (env) => {
            try {
              const schedule = await scheduleApi.get(flagId, env.id);
              startMap[env.id] = schedule.scheduled_start_at ? new Date(schedule.scheduled_start_at) : null;
              endMap[env.id] = schedule.scheduled_end_at ? new Date(schedule.scheduled_end_at) : null;
              configuredMap[env.id] = true;
            } catch (err) {
              // 404 just means this environment hasn't been enabled for the
              // flag yet, so there's nothing to schedule until it is.
              if (axios.isAxiosError(err) && err.response?.status === 404) {
                configuredMap[env.id] = false;
              } else {
                configuredMap[env.id] = true;
              }
            }
          }),
        );

        if (!active) return;
        setStart(startMap);
        setEnd(endMap);
        setConfigured(configuredMap);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [flagId]);

  async function save(environmentId: number) {
    setError((prev) => ({ ...prev, [environmentId]: null }));
    setSavingId(environmentId);
    try {
      await scheduleApi.update(flagId, environmentId, {
        scheduled_start_at: start[environmentId]?.toISOString() ?? null,
        scheduled_end_at: end[environmentId]?.toISOString() ?? null,
      });
      setSuccessId(environmentId);
      setTimeout(() => setSuccessId(null), 1600);
    } catch (err) {
      setError((prev) => ({ ...prev, [environmentId]: getApiErrorMessage(err) }));
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <LoadingState label="Loading schedules…" />;

  if (!isAdmin) {
    return (
      <Alert severity="info" variant="outlined">
        Only admins can schedule feature activation.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Set a window during which this flag should turn on automatically. Leave a field empty to clear it.
      </Typography>
      <Grid container spacing={2}>
        {environments.map((env) => (
          <Grid size={{ xs: 12, md: 6 }} key={env.id}>
            <Card sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <EnvironmentChip name={env.name} />
                  {!configured[env.id] && (
                    <Typography variant="caption" color="text.secondary">
                      Not enabled for this flag yet
                    </Typography>
                  )}
                </Stack>
                {error[env.id] && <Alert severity="error">{error[env.id]}</Alert>}
                {!configured[env.id] && (
                  <Alert severity="info" variant="outlined" sx={{ fontSize: "0.8rem" }}>
                    Enable this flag for {env.name} on the Environments tab before setting a schedule.
                  </Alert>
                )}
                <DateTimePicker
                  label="Starts at"
                  value={start[env.id] ?? null}
                  onChange={(v) => setStart((prev) => ({ ...prev, [env.id]: v }))}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
                <DateTimePicker
                  label="Ends at"
                  value={end[env.id] ?? null}
                  onChange={(v) => setEnd((prev) => ({ ...prev, [env.id]: v }))}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Button
                    variant="contained"
                    size="small"
                    disabled={savingId === env.id || !configured[env.id]}
                    onClick={() => save(env.id)}
                  >
                    {savingId === env.id ? "Saving…" : "Save schedule"}
                  </Button>
                  {successId === env.id && (
                    <Typography variant="caption" color="success.main">
                      Saved
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
