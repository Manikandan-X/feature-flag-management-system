import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Grid,
  Slider,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { environmentApi, rolloutApi, dashboardApi } from "../../../api/resources";
import { getApiErrorMessage } from "../../../api/client";
import { EnvironmentChip } from "../../../components/common/EnvironmentChip";
import { LoadingState } from "../../../components/common/States";
import { environmentColor } from "../../../theme";
import type { EnvironmentResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function RolloutTab({ flagId, flagKey }: { flagId: number; flagKey: string }) {
  const { isAdmin } = useAuth();
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [values, setValues] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([environmentApi.listActive(), dashboardApi.rollouts()])
      .then(([envs, rollouts]) => {
        setEnvironments(envs);
        const current: Record<number, number> = {};
        rollouts
          .filter((r) => r.feature_flag_id === flagId)
          .forEach((r) => {
            current[r.environment_id] = r.percentage;
          });
        setValues(current);
        setSaved(current);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [flagId]);

  async function save(environmentId: number) {
    setError(null);
    setSavingId(environmentId);
    try {
      const result = await rolloutApi.configure(flagId, environmentId, {
        percentage: values[environmentId] ?? 0,
      });
      setSaved((prev) => ({ ...prev, [environmentId]: result.percentage }));
      setSuccessId(environmentId);
      setTimeout(() => setSuccessId(null), 1600);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <LoadingState label="Loading rollout configuration…" />;

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="body2" color="text.secondary">
        Gradually roll <code>{flagKey}</code> out to a percentage of traffic in each environment.
      </Typography>
      {!isAdmin && (
        <Alert severity="info" variant="outlined">
          Only admins can change rollout percentages.
        </Alert>
      )}
      <Grid container spacing={2}>
        {environments.map((env) => {
          const color = environmentColor(env.name);
          const value = values[env.id] ?? 0;
          const isDirty = value !== (saved[env.id] ?? 0);
          return (
            <Grid size={{ xs: 12, md: 6 }} key={env.id}>
              <Card sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <EnvironmentChip name={env.name} />
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: '"JetBrains Mono", monospace', color }}
                    >
                      {value}%
                    </Typography>
                  </Stack>
                  <Slider
                    value={value}
                    onChange={(_, v) => setValues((prev) => ({ ...prev, [env.id]: v as number }))}
                    disabled={!isAdmin}
                    sx={{
                      color,
                      "& .MuiSlider-rail": { backgroundColor: alpha(color, 0.2) },
                    }}
                  />
                  {isAdmin && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!isDirty || savingId === env.id}
                        onClick={() => save(env.id)}
                        sx={{ backgroundColor: color, "&:hover": { backgroundColor: color } }}
                      >
                        {savingId === env.id ? "Saving…" : "Apply rollout"}
                      </Button>
                      {successId === env.id && (
                        <Typography variant="caption" color="success.main">
                          Saved
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
