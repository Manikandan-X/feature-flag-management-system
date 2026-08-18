import { Box, Stack, Typography, alpha, CircularProgress } from "@mui/material";
import { tokens } from "../../theme";

interface SignalLampProps {
  on: boolean;
  label?: string;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "medium";
}

/**
 * Signature element: a patch-panel indicator lamp.
 * Feature flags are literally on/off signals, so state is shown as a lamp
 * (lit + glowing when on, hollow + dim when off) rather than a generic switch.
 */
export function SignalLamp({
  on,
  label,
  color = tokens.signal,
  onClick,
  disabled,
  loading,
  size = "medium",
}: SignalLampProps) {
  const dim = size === "small" ? 8 : 10;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      onClick={disabled || loading ? undefined : onClick}
      sx={{
        cursor: onClick && !disabled && !loading ? "pointer" : "default",
        userSelect: "none",
        opacity: disabled ? 0.5 : 1,
        py: 0.25,
      }}
      role={onClick ? "button" : undefined}
      aria-pressed={onClick ? on : undefined}
    >
      {loading ? (
        <CircularProgress size={dim} sx={{ color }} />
      ) : (
        <Box
          sx={{
            width: dim,
            height: dim,
            borderRadius: "50%",
            flexShrink: 0,
            backgroundColor: on ? color : "transparent",
            border: `1.5px solid ${on ? color : tokens.hairlineStrong}`,
            boxShadow: on ? `0 0 8px 1.5px ${alpha(color, 0.65)}` : "none",
            transition: "all 160ms ease",
          }}
        />
      )}
      {label && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: on ? tokens.textPrimary : tokens.textSecondary,
          }}
        >
          {label}
        </Typography>
      )}
    </Stack>
  );
}
