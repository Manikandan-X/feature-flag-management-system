import { useState, type FormEvent } from "react";
import { Alert, Avatar, Box, Button, Card, Chip, Grid, Stack, TextField, Typography, alpha } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import { getApiErrorMessage } from "../../api/client";
import { tokens } from "../../theme";

export function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await authApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <PageHeader eyebrow="Account" title="Profile" description="Your account details and security settings." />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: alpha(tokens.envDevelopment, 0.2),
                  color: tokens.envDevelopment,
                  border: `1px solid ${alpha(tokens.envDevelopment, 0.5)}`,
                  fontWeight: 700,
                }}
              >
                {user?.username?.slice(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={user?.role}
              size="small"
              sx={{
                color: tokens.signal,
                backgroundColor: alpha(tokens.signal, 0.14),
                border: `1px solid ${alpha(tokens.signal, 0.4)}`,
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Change password
            </Typography>
            <Stack component="form" onSubmit={handleSubmit} spacing={2.5} sx={{ maxWidth: 360 }}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">Password changed successfully.</Alert>}
              <TextField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
                helperText="8–72 characters"
              />
              <Button type="submit" variant="contained" disabled={submitting} sx={{ alignSelf: "flex-start" }}>
                {submitting ? "Updating…" : "Update password"}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
