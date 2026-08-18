import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
  alpha,
} from "@mui/material";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { EnvironmentChip } from "../../components/common/EnvironmentChip";
import { SignalLamp } from "../../components/common/SignalLamp";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { dashboardApi } from "../../api/resources";
import { getApiErrorMessage } from "../../api/client";
import { environmentColor, tokens } from "../../theme";
import type {
  DashboardEnvironmentResponse,
  DashboardFeatureResponse,
  DashboardRolloutResponse,
  DashboardSummaryResponse,
} from "../../types";
import { useAuth } from "../../context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [features, setFeatures] = useState<DashboardFeatureResponse[]>([]);
  const [rollouts, setRollouts] = useState<DashboardRolloutResponse[]>([]);
  const [environments, setEnvironments] = useState<DashboardEnvironmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.features(),
      dashboardApi.rollouts(),
      dashboardApi.environments(),
    ])
      .then(([s, f, r, e]) => {
        if (!active) return;
        setSummary(s);
        setFeatures(f);
        setRollouts(r);
        setEnvironments(e);
      })
      .catch((err) => active && setError(getApiErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState label="Reading the panel…" />;
  if (error) return <ErrorState message={error} />;
  if (!summary) return null;

  return (
    <Box>
      <PageHeader
        eyebrow="Control room"
        title={`Welcome back, ${user?.username}`}
        description="A live read of every flag, environment, and rollout across the system."
      />

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active features" value={summary.active_features} icon={ToggleOnRoundedIcon} color={tokens.signal} suffix={`/ ${summary.total_features}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Disabled features" value={summary.disabled_features} icon={ToggleOffRoundedIcon} color={tokens.envProduction} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active environments" value={summary.active_environments} icon={DnsRoundedIcon} color={tokens.envDevelopment} suffix={`/ ${summary.total_environments}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Rollouts configured" value={summary.total_rollouts} icon={TuneRoundedIcon} color={tokens.envTesting} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Environment summary
            </Typography>
            {environments.length === 0 ? (
              <EmptyState title="No environments yet" description="Create one to start configuring flags." />
            ) : (
              <Stack spacing={2}>
                {environments.map((env) => {
                  const color = environmentColor(env.environment);
                  const pct = env.total_features
                    ? Math.round((env.active_features / env.total_features) * 100)
                    : 0;
                  return (
                    <Box key={env.environment_id}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EnvironmentChip name={env.environment} />
                          {!env.is_active && (
                            <Typography variant="caption" color="text.secondary">
                              inactive
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace' }} color="text.secondary">
                          {env.active_features}/{env.total_features} on · {env.total_rollouts} rollouts
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(color, 0.12),
                          "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: 3 },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Rollout statistics
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {rollouts.length} configured
              </Typography>
            </Stack>
            {rollouts.length === 0 ? (
              <EmptyState title="No rollouts configured" description="Percentage-based rollouts will show up here once set." />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Feature</TableCell>
                    <TableCell>Environment</TableCell>
                    <TableCell align="right">Rollout</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rollouts.map((r) => {
                    const color = environmentColor(r.environment);
                    return (
                      <TableRow key={`${r.feature_flag_id}-${r.environment_id}`}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {r.feature_key}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <EnvironmentChip name={r.environment} />
                        </TableCell>
                        <TableCell align="right" sx={{ width: 160 }}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                            <Box sx={{ width: 70 }}>
                              <LinearProgress
                                variant="determinate"
                                value={r.percentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: alpha(color, 0.12),
                                  "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: 3 },
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', width: 36 }}>
                              {r.percentage}%
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </Grid>

        <Grid size={12}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Feature status by environment
            </Typography>
            {features.length === 0 ? (
              <EmptyState title="No feature flags yet" description="Once flags are configured per environment, their status shows here." />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Environment</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {features.map((f) => (
                    <TableRow key={`${f.feature_flag_id}-${f.environment_id}`}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                          {f.feature_key}
                        </Typography>
                      </TableCell>
                      <TableCell>{f.feature_name}</TableCell>
                      <TableCell>
                        <EnvironmentChip name={f.environment} />
                      </TableCell>
                      <TableCell>
                        <SignalLamp on={f.enabled} label={f.enabled ? "Enabled" : "Disabled"} color={environmentColor(f.environment)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
