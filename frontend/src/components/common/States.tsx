import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 8 }}>
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
      {message}
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 7,
        px: 3,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      {icon && <Box sx={{ mb: 1.5, color: "text.secondary" }}>{icon}</Box>}
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 420, mx: "auto" }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
  );
}
