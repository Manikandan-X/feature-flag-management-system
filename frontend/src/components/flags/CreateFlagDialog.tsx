import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { featureFlagApi } from "../../api/resources";
import { getApiErrorMessage } from "../../api/client";
import type { FeatureFlagResponse } from "../../types";

export function CreateFlagDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (flag: FeatureFlagResponse) => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName("");
    setKey("");
    setDescription("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const flag = await featureFlagApi.create({
        name,
        key,
        description: description || null,
      });
      onCreated(flag);
      reset();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>New feature flag</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              autoFocus
              helperText="A human-readable name, e.g. Checkout Redesign"
            />
            <TextField
              label="Key"
              value={key}
              onChange={(e) => setKey(e.target.value.trim())}
              fullWidth
              required
              helperText="Unique identifier used in code, e.g. checkout-redesign"
              slotProps={{ htmlInput: { style: { fontFamily: '"JetBrains Mono", monospace' } } }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => { reset(); onClose(); }} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Creating…" : "Create flag"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
