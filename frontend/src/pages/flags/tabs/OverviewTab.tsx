import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { featureFlagApi } from "../../../api/resources";
import { getApiErrorMessage } from "../../../api/client";
import type { FeatureFlagResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function OverviewTab({
  flag,
  onUpdated,
}: {
  flag: FeatureFlagResponse;
  onUpdated: (flag: FeatureFlagResponse) => void;
}) {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(flag.name);
  const [description, setDescription] = useState(flag.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const updated = await featureFlagApi.update(flag.id, {
        name,
        description: description || null,
      });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Details
            </Typography>
            {isAdmin && !editing && (
              <Button size="small" startIcon={<EditRoundedIcon fontSize="small" />} onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {editing ? (
            <Stack spacing={2.5}>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => {
                    setName(flag.name);
                    setDescription(flag.description ?? "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Key
                </Typography>
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', color: "primary.main" }}>
                  {flag.key}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">
                  {flag.description || "No description provided."}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created by user
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  #{flag.created_by}
                </Typography>
              </Box>
            </Stack>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
