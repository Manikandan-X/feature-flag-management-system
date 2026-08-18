import { Box, Button, Stack, Typography, alpha } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { tokens } from "../theme";

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 50% 30%, ${alpha(tokens.signal, 0.08)}, transparent 45%), ${tokens.ink}`,
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ textAlign: "center", px: 3 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "5rem",
            color: alpha(tokens.signal, 0.3),
          }}
        >
          404
        </Typography>
        <Typography variant="h5">This signal doesn't reach anywhere</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          The page you're looking for doesn't exist or was moved.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained" sx={{ mt: 1 }}>
          Back to dashboard
        </Button>
      </Stack>
    </Box>
  );
}
