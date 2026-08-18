import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { EmptyState } from "../../components/common/States";
import { analyticsApi, environmentApi, featureFlagApi } from "../../api/resources";
import { getApiErrorMessage } from "../../api/client";
import { environmentColor, tokens } from "../../theme";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import type { EnvironmentResponse, FeatureFlagResponse, FeatureUsageAnalyticsResponse } from "../../types";

ChartJS.register(ArcElement, Tooltip, Legend);

export function AnalyticsPage() {
  const [flags, setFlags] = useState<FeatureFlagResponse[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [environment, setEnvironment] = useState("");
  const [result, setResult] = useState<FeatureUsageAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([featureFlagApi.listAll(), environmentApi.listActive()])
      .then(([f, e]) => {
        setFlags(f);
        setEnvironments(e);
      })
      .catch(() => undefined);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!featureKey || !environment) return;
    setError(null);
    setSubmitting(true);
    try {
      const data = await analyticsApi.featureUsage(featureKey, environment);
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  }

  const color = environment ? environmentColor(environment) : tokens.signal;

  return (
    <Box>
      <PageHeader
        eyebrow="Analytics"
        title="Feature usage"
        description="Look up evaluation counts for a flag in a specific environment."
      />

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Stack component="form" onSubmit={handleSubmit} direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-end" }}>
          <Autocomplete
            options={flags.map((f) => f.key)}
            value={featureKey || null}
            onChange={(_, v) => setFeatureKey(v ?? "")}
            freeSolo
            sx={{ flex: 1, minWidth: 220 }}
            renderInput={(params) => (
              <TextField {...params} label="Feature key" required onChange={(e) => setFeatureKey(e.target.value)} />
            )}
          />
          <TextField
            select
            label="Environment"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            required
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            {environments.map((env) => (
              <MenuItem key={env.id} value={env.name}>
                {env.name}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" startIcon={<QueryStatsRoundedIcon />} disabled={submitting} sx={{ height: 40 }}>
            {submitting ? "Looking up…" : "Look up usage"}
          </Button>
        </Stack>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result ? (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <StatCard label="Total evaluations" value={result.total_evaluations} icon={QueryStatsRoundedIcon} color={color} />
              <StatCard label="Evaluated enabled" value={result.enabled_count} icon={ToggleOnRoundedIcon} color={tokens.signal} />
              <StatCard label="Evaluated disabled" value={result.disabled_count} icon={ToggleOffRoundedIcon} color={tokens.envProduction} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                {result.feature_key} · {result.environment}
              </Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", maxHeight: 320 }}>
                {result.total_evaluations === 0 ? (
                  <EmptyState title="No evaluations recorded yet" description="This flag hasn't been evaluated in this environment." />
                ) : (
                  <Doughnut
                    data={{
                      labels: ["Enabled", "Disabled"],
                      datasets: [
                        {
                          data: [result.enabled_count, result.disabled_count],
                          backgroundColor: [tokens.signal, tokens.envProduction],
                          borderColor: tokens.surface,
                          borderWidth: 3,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: tokens.textSecondary, usePointStyle: true },
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : (
        !error && (
          <EmptyState
            icon={<InsightsRoundedIcon fontSize="large" />}
            title="Look up a flag to see analytics"
            description="Choose a feature key and an environment above."
          />
        )
      )}
    </Box>
  );
}
