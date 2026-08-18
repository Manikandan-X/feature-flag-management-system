import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { EnvironmentChip } from "../../components/common/EnvironmentChip";
import { CreateEnvironmentDialog } from "../../components/flags/CreateEnvironmentDialog";
import { environmentApi } from "../../api/resources";
import { getApiErrorMessage } from "../../api/client";
import { environmentColor } from "../../theme";
import type { EnvironmentResponse } from "../../types";
import { useAuth } from "../../context/AuthContext";

export function EnvironmentsPage() {
  const { isAdmin } = useAuth();
  const [environments, setEnvironments] = useState<EnvironmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<number, { name: string; description: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    const call = isAdmin ? environmentApi.listAll() : environmentApi.listActive();
    call
      .then(setEnvironments)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [isAdmin]);

  function startEdit(env: EnvironmentResponse) {
    setEditing((prev) => ({ ...prev, [env.id]: { name: env.name, description: env.description ?? "" } }));
  }

  async function saveEdit(env: EnvironmentResponse) {
    const draft = editing[env.id];
    if (!draft) return;
    setSavingId(env.id);
    try {
      const updated = await environmentApi.update(env.id, { name: draft.name, description: draft.description || null });
      setEnvironments((prev) => prev.map((e) => (e.id === env.id ? updated : e)));
      setEditing((prev) => {
        const next = { ...prev };
        delete next[env.id];
        return next;
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(env: EnvironmentResponse) {
    setSavingId(env.id);
    try {
      const updated = await environmentApi.update(env.id, { is_active: !env.is_active });
      setEnvironments((prev) => prev.map((e) => (e.id === env.id ? updated : e)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <LoadingState label="Loading environments…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <Box>
      <PageHeader
        eyebrow="Environments"
        title="Environments"
        description="Development, testing, production — or any custom stage your team deploys to."
        actions={
          isAdmin && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
              New environment
            </Button>
          )
        }
      />

      {environments.length === 0 ? (
        <EmptyState
          icon={<DnsRoundedIcon fontSize="large" />}
          title="No environments yet"
          description="Create development, testing, and production to start configuring flags."
          action={
            isAdmin && (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
                New environment
              </Button>
            )
          }
        />
      ) : (
        <Grid container spacing={2}>
          {environments.map((env) => {
            const color = environmentColor(env.name);
            const draft = editing[env.id];
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={env.id}>
                <Card
                  sx={{
                    p: 2.5,
                    height: "100%",
                    borderTop: `2px solid ${color}`,
                    opacity: env.is_active ? 1 : 0.6,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <EnvironmentChip name={env.name} />
                      {isAdmin && (
                        <Switch
                          checked={env.is_active}
                          onChange={() => toggleActive(env)}
                          disabled={savingId === env.id}
                          size="small"
                          sx={{ "& .MuiSwitch-thumb": { backgroundColor: env.is_active ? color : undefined } }}
                        />
                      )}
                    </Stack>

                    {draft ? (
                      <Stack spacing={1.5}>
                        <TextField
                          label="Name"
                          value={draft.name}
                          onChange={(e) =>
                            setEditing((prev) => ({ ...prev, [env.id]: { ...draft, name: e.target.value } }))
                          }
                          size="small"
                          fullWidth
                        />
                        <TextField
                          label="Description"
                          value={draft.description}
                          onChange={(e) =>
                            setEditing((prev) => ({ ...prev, [env.id]: { ...draft, description: e.target.value } }))
                          }
                          size="small"
                          fullWidth
                          multiline
                        />
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="contained" onClick={() => saveEdit(env)} disabled={savingId === env.id}>
                            Save
                          </Button>
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() =>
                              setEditing((prev) => {
                                const next = { ...prev };
                                delete next[env.id];
                                return next;
                              })
                            }
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {env.description || "No description."}
                        </Typography>
                        {isAdmin && (
                          <Button
                            size="small"
                            onClick={() => startEdit(env)}
                            sx={{ alignSelf: "flex-start", color: alpha(color, 0.9) }}
                          >
                            Edit
                          </Button>
                        )}
                      </>
                    )}
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CreateEnvironmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(env) => setEnvironments((prev) => [...prev, env])}
      />
    </Box>
  );
}
