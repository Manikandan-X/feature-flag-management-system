import { useEffect, useState } from "react";
import { Alert, Card, Grid, Stack, Typography, alpha } from "@mui/material";
import { environmentApi, featureFlagApi } from "../../../api/resources";
import { getApiErrorMessage } from "../../../api/client";
import { EnvironmentChip } from "../../../components/common/EnvironmentChip";
import { SignalLamp } from "../../../components/common/SignalLamp";
import { LoadingState } from "../../../components/common/States";
import { environmentColor } from "../../../theme";
import type { DashboardFeatureResponse, EnvironmentResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function EnvironmentsTab({
  flagId,
  statuses,
  onStatusChange,
}: {
  flagId: number;
  statuses: DashboardFeatureResponse[];
  onStatusChange: () => void;
}) {
  const { isAdmin } = useAuth();
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    const call = isAdmin ? environmentApi.listAll() : environmentApi.listActive();
    call
      .then(setEnvironments)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  async function toggle(environmentId: number, nextEnabled: boolean) {
    setError(null);
    setTogglingId(environmentId);
    try {
      await featureFlagApi.configureEnvironment(flagId, environmentId, { enabled: nextEnabled });
      onStatusChange();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) return <LoadingState label="Loading environments…" />;

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {!isAdmin && (
        <Alert severity="info" variant="outlined">
          Only admins can enable or disable a flag per environment.
        </Alert>
      )}
      <Grid container spacing={2}>
        {environments.map((env) => {
          const status = statuses.find((s) => s.environment_id === env.id);
          const enabled = status?.enabled ?? false;
          const color = environmentColor(env.name);
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={env.id}>
              <Card
                sx={{
                  p: 2.5,
                  height: "100%",
                  borderColor: enabled ? alpha(color, 0.4) : undefined,
                  backgroundColor: enabled ? alpha(color, 0.04) : undefined,
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <EnvironmentChip name={env.name} />
                    {!env.is_active && (
                      <Typography variant="caption" color="text.secondary">
                        inactive
                      </Typography>
                    )}
                  </Stack>
                  <SignalLamp
                    on={enabled}
                    label={enabled ? "Enabled" : "Disabled"}
                    color={color}
                    loading={togglingId === env.id}
                    onClick={isAdmin ? () => toggle(env.id, !enabled) : undefined}
                  />
                  {status === undefined && (
                    <Typography variant="caption" color="text.secondary">
                      No configuration yet — {isAdmin ? "click to enable" : "not configured"}.
                    </Typography>
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
