import { Box, Paper, Stack, Typography, alpha } from "@mui/material";
import type { ReactNode } from "react";
import { tokens } from "../../theme";
import { SignalLamp } from "../../components/common/SignalLamp";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {/* Hero panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "44%",
          p: 6,
          position: "relative",
          overflow: "hidden",
          borderRight: `1px solid ${tokens.hairline}`,
          background:
            `radial-gradient(circle at 20% 15%, ${alpha(tokens.signal, 0.14)}, transparent 45%), ` +
            `radial-gradient(circle at 85% 80%, ${alpha(tokens.envDevelopment, 0.12)}, transparent 45%), ` +
            tokens.ink,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: alpha(tokens.signal, 0.14),
              border: `1px solid ${alpha(tokens.signal, 0.45)}`,
              boxShadow: `0 0 10px ${alpha(tokens.signal, 0.35)}`,
            }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: tokens.signal,
                boxShadow: `0 0 6px 2px ${alpha(tokens.signal, 0.7)}`,
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
            signal
          </Typography>
        </Stack>

        <Box>
          <Typography variant="h3" sx={{ maxWidth: 420, mb: 2 }}>
            Ship changes. Not deploys.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 380, mb: 4 }}>
            Toggle features per environment, roll out gradually, target
            specific users, and keep a full audit trail — without touching
            the codebase.
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              backgroundColor: alpha(tokens.surface, 0.6),
              maxWidth: 360,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontFamily: '"JetBrains Mono", monospace', color: "text.secondary" }}
            >
              checkout-redesign
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1.5 }}>
              <SignalLamp on label="development" color={tokens.envDevelopment} size="small" />
              <SignalLamp on label="testing" color={tokens.envTesting} size="small" />
              <SignalLamp on={false} label="production" color={tokens.envProduction} size="small" />
            </Stack>
          </Paper>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Feature Flag &amp; Environment Management System
        </Typography>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
