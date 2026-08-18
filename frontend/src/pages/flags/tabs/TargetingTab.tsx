import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Card,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { environmentApi, userAssignmentApi } from "../../../api/resources";
import { getApiErrorMessage } from "../../../api/client";
import { ApiGapNotice } from "../../../components/common/ApiGapNotice";
import { EnvironmentChip } from "../../../components/common/EnvironmentChip";
import { SignalLamp } from "../../../components/common/SignalLamp";
import { LoadingState, EmptyState } from "../../../components/common/States";
import { environmentColor } from "../../../theme";
import type { EnvironmentResponse, UserAssignmentResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function TargetingTab({ flagId }: { flagId: number }) {
  const { isAdmin } = useAuth();
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [userId, setUserId] = useState("");
  const [environmentId, setEnvironmentId] = useState<number | "">("");
  const [enabled, setEnabled] = useState(true);

  // Session-local record of assignments set here — the API has no GET to
  // list existing assignments, so this only reflects what THIS session set.
  const [sessionAssignments, setSessionAssignments] = useState<UserAssignmentResponse[]>([]);

  useEffect(() => {
    environmentApi
      .listActive()
      .then(setEnvironments)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (environmentId === "") return;
    setError(null);
    setSubmitting(true);
    try {
      const assignment = await userAssignmentApi.configure(flagId, environmentId, {
        user_id: Number(userId),
        enabled,
      });
      setSessionAssignments((prev) => [
        assignment,
        ...prev.filter((a) => !(a.user_id === assignment.user_id && a.environment_id === assignment.environment_id)),
      ]);
      setUserId("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(assignment: UserAssignmentResponse) {
    setError(null);
    try {
      await userAssignmentApi.remove(assignment.id);
      setSessionAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (loading) return <LoadingState label="Loading environments…" />;

  if (!isAdmin) {
    return (
      <Alert severity="info" variant="outlined">
        Only admins can manage user-specific access.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <ApiGapNotice
        endpoint="GET /feature-flags/{id}/environments/{env_id}/users"
        note="The repository already supports listing assignments per flag+environment, but no route exposes it yet, and there's no /users list either. The table below only shows assignments set in this browser session — refreshing the page loses it. Enter a user ID directly for now."
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Assign a user
        </Typography>
        <Stack component="form" onSubmit={handleSubmit} direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-end" }}>
          <TextField
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            type="number"
            required
            sx={{ width: { xs: "100%", sm: 140 } }}
          />
          <TextField
            select
            label="Environment"
            value={environmentId}
            onChange={(e) => setEnvironmentId(Number(e.target.value))}
            required
            sx={{ width: { xs: "100%", sm: 180 } }}
          >
            {environments.map((env) => (
              <MenuItem key={env.id} value={env.id}>
                {env.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Access"
            value={enabled ? "enabled" : "disabled"}
            onChange={(e) => setEnabled(e.target.value === "enabled")}
            sx={{ width: { xs: "100%", sm: 150 } }}
          >
            <MenuItem value="enabled">Enabled</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ height: 40 }}>
            {submitting ? "Saving…" : "Save assignment"}
          </Button>
        </Stack>
      </Card>

      <Card sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Assignments set this session
        </Typography>
        {sessionAssignments.length === 0 ? (
          <EmptyState title="No assignments yet" description="Assignments you save above will appear here." />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Environment</TableCell>
                <TableCell>Access</TableCell>
                <TableCell align="right">Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessionAssignments.map((a) => {
                const env = environments.find((e) => e.id === a.environment_id);
                return (
                  <TableRow key={a.id}>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>#{a.user_id}</TableCell>
                    <TableCell>{env && <EnvironmentChip name={env.name} />}</TableCell>
                    <TableCell>
                      <SignalLamp on={a.enabled} label={a.enabled ? "Enabled" : "Disabled"} color={env ? environmentColor(env.name) : undefined} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon fontSize="small" />} onClick={() => remove(a)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}
