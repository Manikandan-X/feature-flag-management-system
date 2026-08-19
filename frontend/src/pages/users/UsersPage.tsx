import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { SignalLamp } from "../../components/common/SignalLamp";
import { RoleChip } from "../../components/users/RoleChip";
import { CreateUserDialog } from "../../components/users/CreateUserDialog";
import { userApi } from "../../api/users";
import { getApiErrorMessage } from "../../api/client";
import { tokens } from "../../theme";
import type { UserResponse, UserRole } from "../../types";
import { useAuth } from "../../context/AuthContext";

export function UsersPage() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftRole, setDraftRole] = useState<UserRole>("EMPLOYEE");
  const [draftActive, setDraftActive] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    userApi
      .list()
      .then(setUsers)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(user: UserResponse) {
    setEditingId(user.id);
    setDraftRole(user.role as UserRole);
    setDraftActive(user.is_active);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(user: UserResponse) {
    setError(null);
    setSavingId(user.id);
    try {
      const updated = await userApi.update(user.id, {
        role: draftRole,
        is_active: draftActive,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setEditingId(null);
      // If the admin somehow changed their own record via another tab/session,
      // keep the auth context in sync.
      if (user.id === currentUser?.id) refreshUser();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <LoadingState label="Loading users…" />;
  if (error && users.length === 0) return <ErrorState message={error} />;

  return (
    <Box>
      <PageHeader
        eyebrow="Access control"
        title="Users"
        description="Everyone with an account, their role, and whether they can sign in."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
            New user
          </Button>
        }
      />

      <TextField
        placeholder="Search by username or email…"
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

      {error && users.length > 0 && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ManageAccountsRoundedIcon fontSize="large" />}
          title={users.length === 0 ? "No users yet" : "No users match your search"}
          description={
            users.length === 0
              ? "Create the first account, or wait for people to self-register as employees."
              : "Try a different search term."
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isEditing = editingId === u.id;
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {u.username}
                        {isSelf && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (you)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {u.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <TextField
                          select
                          size="small"
                          value={draftRole}
                          onChange={(e) => setDraftRole(e.target.value as UserRole)}
                          disabled={isSelf}
                          sx={{ width: 150 }}
                        >
                          <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                          <MenuItem value="ADMIN">ADMIN</MenuItem>
                        </TextField>
                      ) : (
                        <RoleChip role={u.role} />
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Tooltip title={isSelf ? "You can't deactivate your own account" : ""}>
                          <span>
                            <Switch
                              checked={draftActive}
                              onChange={(e) => setDraftActive(e.target.checked)}
                              disabled={isSelf}
                              size="small"
                              sx={{ "& .MuiSwitch-thumb": { backgroundColor: draftActive ? tokens.signal : undefined } }}
                            />
                          </span>
                        </Tooltip>
                      ) : (
                        <SignalLamp on={u.is_active} label={u.is_active ? "Active" : "Inactive"} size="small" />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {isEditing ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="contained" onClick={() => saveEdit(u)} disabled={savingId === u.id}>
                            {savingId === u.id ? "Saving…" : "Save"}
                          </Button>
                          <Button size="small" color="inherit" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </Stack>
                      ) : (
                        <Tooltip title={isSelf ? "You can't change your own role or status" : "Edit role & status"}>
                          <span>
                            <Button
                              size="small"
                              startIcon={<EditRoundedIcon fontSize="small" />}
                              onClick={() => startEdit(u)}
                              disabled={isSelf}
                            >
                              Edit
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(user) => setUsers((prev) => [...prev, user])}
      />
    </Box>
  );
}
