import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Autocomplete,
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
import { userApi } from "../../../api/users";
import { getApiErrorMessage } from "../../../api/client";
import { EnvironmentChip } from "../../../components/common/EnvironmentChip";
import { SignalLamp } from "../../../components/common/SignalLamp";
import { LoadingState, EmptyState } from "../../../components/common/States";
import { environmentColor } from "../../../theme";
import type { EnvironmentResponse, UserAssignmentResponse, UserResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function TargetingTab({ flagId }: { flagId: number }) {
  const { isAdmin } = useAuth();
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignments, setAssignments] = useState<UserAssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [environmentId, setEnvironmentId] = useState<number | "">("");
  const [enabled, setEnabled] = useState(true);

  function loadAssignments(envs: EnvironmentResponse[]) {
    return Promise.all(
      envs.map((env) => userAssignmentApi.list(flagId, env.id)),
    ).then((lists) => setAssignments(lists.flat()));
  }

  useEffect(() => {
    let active = true;
    Promise.all([environmentApi.listActive(), userApi.list()])
      .then(async ([envs, allUsers]) => {
        if (!active) return;
        setEnvironments(envs);
        setUsers(allUsers);
        await loadAssignments(envs);
      })
      .catch((err) => active && setError(getApiErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flagId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (environmentId === "" || !selectedUser) return;
    setError(null);
    setSubmitting(true);
    try {
      await userAssignmentApi.configure(flagId, environmentId, {
        user_id: selectedUser.id,
        enabled,
      });
      await loadAssignments(environments);
      setSelectedUser(null);
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
      setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (loading) return <LoadingState label="Loading targeting…" />;

  if (!isAdmin) {
    return (
      <Alert severity="info" variant="outlined">
        Only admins can manage user-specific access.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Assign a user
        </Typography>
        <Stack component="form" onSubmit={handleSubmit} direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-end" }}>
          <Autocomplete
            options={users}
            value={selectedUser}
            onChange={(_, v) => setSelectedUser(v)}
            getOptionLabel={(u) => `${u.username} (#${u.id})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            sx={{ flex: 1, minWidth: 220 }}
            renderInput={(params) => <TextField {...params} label="User" required />}
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
          Targeted users
        </Typography>
        {assignments.length === 0 ? (
          <EmptyState title="No users targeted yet" description="Assignments you save above will appear here." />
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
              {assignments.map((a) => {
                const env = environments.find((e) => e.id === a.environment_id);
                const user = users.find((u) => u.id === a.user_id);
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      {user ? user.username : <span style={{ fontFamily: "monospace" }}>#{a.user_id}</span>}
                    </TableCell>
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
