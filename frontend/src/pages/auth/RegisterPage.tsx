import { useState, type FormEvent } from "react";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { useAuth, getApiErrorMessage } from "../../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ username, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="New accounts start with employee access — read-only across flags and environments."
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Account created. Redirecting to sign in…</Alert>}
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          fullWidth
          required
          helperText="3–100 characters"
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          helperText="8–72 characters"
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Already have an account?{" "}
          <Typography
            component={RouterLink}
            to="/login"
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none" }}
          >
            Sign in
          </Typography>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
