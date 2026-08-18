import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { SignalLamp } from "../../components/common/SignalLamp";
import { EnvironmentChip } from "../../components/common/EnvironmentChip";
import { CreateFlagDialog } from "../../components/flags/CreateFlagDialog";
import { featureFlagApi, dashboardApi } from "../../api/resources";
import { getApiErrorMessage } from "../../api/client";
import { environmentColor } from "../../theme";
import type { DashboardFeatureResponse, FeatureFlagResponse } from "../../types";
import { useAuth } from "../../context/AuthContext";

export function FlagsListPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [flags, setFlags] = useState<FeatureFlagResponse[]>([]);
  const [statuses, setStatuses] = useState<DashboardFeatureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([featureFlagApi.listAll(), dashboardApi.features()])
      .then(([f, s]) => {
        setFlags(f);
        setStatuses(s);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const statusByFlag = useMemo(() => {
    const map = new Map<number, DashboardFeatureResponse[]>();
    for (const s of statuses) {
      const list = map.get(s.feature_flag_id) ?? [];
      list.push(s);
      map.set(s.feature_flag_id, list);
    }
    return map;
  }, [statuses]);

  const filtered = flags.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <LoadingState label="Loading feature flags…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <Box>
      <PageHeader
        eyebrow="Flags"
        title="Feature flags"
        description="Every flag in the system, with its current status per environment."
        actions={
          isAdmin && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
              New flag
            </Button>
          )
        }
      />

      <TextField
        placeholder="Search by name or key…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2.5, maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ToggleOnRoundedIcon fontSize="large" />}
          title={flags.length === 0 ? "No feature flags yet" : "No flags match your search"}
          description={
            flags.length === 0
              ? "Create your first flag to start controlling features without redeploying."
              : "Try a different search term."
          }
          action={
            isAdmin &&
            flags.length === 0 && (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
                New flag
              </Button>
            )
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flag</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Status by environment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((flag) => {
                const envStatuses = statusByFlag.get(flag.id) ?? [];
                return (
                  <TableRow
                    key={flag.id}
                    hover
                    onClick={() => navigate(`/flags/${flag.id}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {flag.name}
                      </Typography>
                      {flag.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {flag.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: '"JetBrains Mono", monospace', color: "primary.main" }}
                      >
                        {flag.key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {envStatuses.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          Not configured yet
                        </Typography>
                      ) : (
                        <Stack direction="row" spacing={2.5}>
                          {envStatuses.map((s) => (
                            <Stack key={s.environment_id} direction="row" spacing={0.75} alignItems="center">
                              <SignalLamp on={s.enabled} color={environmentColor(s.environment)} size="small" />
                              <EnvironmentChip name={s.environment} />
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateFlagDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(flag) => {
          setFlags((prev) => [flag, ...prev]);
        }}
      />
    </Box>
  );
}
