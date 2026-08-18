import { useEffect, useState } from "react";
import { Alert, Button, Card, Grid, Stack, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { environmentApi, scheduleApi } from "../../../api/resources";
import { getApiErrorMessage } from "../../../api/client";
import { EnvironmentChip } from "../../../components/common/EnvironmentChip";
import { LoadingState } from "../../../components/common/States";
import { ApiGapNotice } from "../../../components/common/ApiGapNotice";
import type { EnvironmentResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function ScheduleTab({ flagId }: { flagId: number }) {
  const { isAdmin } = useAuth();
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [start, setStart] = useState<Record<number, Date | null>>({});
  const [end, setEnd] = useState<Record<number, Date | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Record<number, string | null>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    environmentApi
      .listActive()
      .then(setEnvironments)
      .catch((err) => setError({ 0: getApiErrorMessage(err) }))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <LoadingState label="Loading environments…" />;

  if (!isAdmin) {
    return (
      <Alert severity="info" variant="outlined">
        Only admins can schedule feature activation.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <ApiGapNotice
        endpoint="GET /feature-flags/{id}/environments/{env_id}/schedule"
        note="The API only exposes a PUT to set the schedule, so an existing schedule can't be read back here — this form always starts blank. Enable the environment for this flag first, or saving will fail with 'schedule not found'."
      />
      <Typography variant="body2" color="text.secondary">
        Set a window during which this flag should turn on automatically. Leave a field empty to clear it.
      </Typography>
      <Grid container spacing={2}>
        {environments.map((env) => (
          <Grid size={{ xs: 12, md: 6 }} key={env.id}>
            <Card sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <EnvironmentChip name={env.name} />
                {error[env.id] && <Alert severity="error">{error[env.id]}</Alert>}
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
                  <Button variant="contained" size="small" disabled={savingId === env.id} onClick={() => save(env.id)}>
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
