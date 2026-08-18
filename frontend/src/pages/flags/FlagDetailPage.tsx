import { useEffect, useState, useCallback } from "react";
import { Box, Breadcrumbs, Tab, Tabs, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState, ErrorState } from "../../components/common/States";
import { featureFlagApi, dashboardApi } from "../../api/resources";
import { getApiErrorMessage } from "../../api/client";
import type { DashboardFeatureResponse, FeatureFlagResponse } from "../../types";
import { OverviewTab } from "./tabs/OverviewTab";
import { EnvironmentsTab } from "./tabs/EnvironmentsTab";
import { RolloutTab } from "./tabs/RolloutTab";
import { ScheduleTab } from "./tabs/ScheduleTab";
import { TargetingTab } from "./tabs/TargetingTab";
import { HistoryTab } from "./tabs/HistoryTab";

const TABS = ["overview", "environments", "rollout", "schedule", "targeting", "history"] as const;
type TabKey = (typeof TABS)[number];

export function FlagDetailPage() {
  const { id } = useParams();
  const flagId = Number(id);

  const [flag, setFlag] = useState<FeatureFlagResponse | null>(null);
  const [statuses, setStatuses] = useState<DashboardFeatureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const loadStatuses = useCallback(() => {
    dashboardApi
      .features()
      .then((all) => setStatuses(all.filter((s) => s.feature_flag_id === flagId)))
      .catch(() => undefined);
  }, [flagId]);

  useEffect(() => {
    if (!Number.isFinite(flagId)) return;
    setLoading(true);
    Promise.all([featureFlagApi.get(flagId), dashboardApi.features()])
      .then(([f, all]) => {
        setFlag(f);
        setStatuses(all.filter((s) => s.feature_flag_id === flagId));
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [flagId]);

  if (loading) return <LoadingState label="Loading feature flag…" />;
  if (error) return <ErrorState message={error} />;
  if (!flag) return null;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5 }}>
        <Typography
          component={RouterLink}
          to="/flags"
          variant="body2"
          color="text.secondary"
          sx={{ textDecoration: "none", "&:hover": { color: "text.primary" } }}
        >
          Feature flags
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
          {flag.key}
        </Typography>
      </Breadcrumbs>

      <PageHeader eyebrow="Feature flag" title={flag.name} description={flag.description ?? undefined} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab value="overview" label="Overview" />
        <Tab value="environments" label="Environments" />
        <Tab value="rollout" label="Rollout" />
        <Tab value="schedule" label="Schedule" />
        <Tab value="targeting" label="Targeting" />
        <Tab value="history" label="History" />
      </Tabs>

      {tab === "overview" && (
        <OverviewTab flag={flag} onUpdated={setFlag} />
      )}
      {tab === "environments" && (
        <EnvironmentsTab flagId={flag.id} statuses={statuses} onStatusChange={loadStatuses} />
      )}
      {tab === "rollout" && <RolloutTab flagId={flag.id} flagKey={flag.key} />}
      {tab === "schedule" && <ScheduleTab flagId={flag.id} />}
      {tab === "targeting" && <TargetingTab flagId={flag.id} />}
      {tab === "history" && <HistoryTab flagId={flag.id} />}
    </Box>
  );
}
