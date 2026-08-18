import { createTheme, alpha } from "@mui/material/styles";

// ==========================================================================
// Design tokens — "Switchboard": a patch-panel / control-room aesthetic.
// Feature flags ARE literally on/off signals routed to environments, so the
// whole system borrows its visual language from patch bays and indicator
// lamps rather than generic dashboard chrome.
// ==========================================================================

export const tokens = {
  ink: "#12141C", // page background — deep charcoal-navy
  surface: "#1B1E2A", // card / panel surface
  surfaceRaised: "#232739", // hovered / elevated surface
  hairline: "#2E3244", // borders
  hairlineStrong: "#3B4058",
  textPrimary: "#EDEEF3",
  textSecondary: "#9195A8",
  textMuted: "#666B80",

  signal: "#33D6C0", // primary brand / interactive accent — "signal" teal
  signalDim: "#1F8A7C",
  signalGlow: "rgba(51, 214, 192, 0.35)",

  // Environment-coded accents — the domain's own three lamp colors
  envDevelopment: "#8B7CF6",
  envTesting: "#F5A623",
  envProduction: "#FF6B5B",

  danger: "#FF5C72",
  success: "#33D6C0",
  warning: "#F5A623",
};

export const environmentColor = (name: string): string => {
  const n = name.toLowerCase();
  if (n.startsWith("dev")) return tokens.envDevelopment;
  if (n.startsWith("test")) return tokens.envTesting;
  if (n.startsWith("prod")) return tokens.envProduction;
  return tokens.signal;
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: tokens.ink,
      paper: tokens.surface,
    },
    primary: {
      main: tokens.signal,
      dark: tokens.signalDim,
      contrastText: "#0A0B10",
    },
    secondary: {
      main: tokens.envDevelopment,
    },
    error: {
      main: tokens.danger,
    },
    warning: {
      main: tokens.warning,
    },
    success: {
      main: tokens.success,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
    },
    divider: tokens.hairline,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h4: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontWeight: 600,
    },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: tokens.textSecondary },
    button: { fontWeight: 600, textTransform: "none" },
    caption: { color: tokens.textSecondary },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.ink,
          backgroundImage:
            "radial-gradient(circle at 12% 8%, rgba(51,214,192,0.06), transparent 40%), " +
            "radial-gradient(circle at 88% 92%, rgba(139,124,246,0.05), transparent 40%)",
          backgroundAttachment: "fixed",
        },
        "::selection": {
          backgroundColor: alpha(tokens.signal, 0.35),
        },
        "*:focus-visible": {
          outline: `2px solid ${tokens.signal}`,
          outlineOffset: "2px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${tokens.hairline}`,
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.hairline}`,
          borderRadius: 12,
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingLeft: 16,
          paddingRight: 16,
        },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 0 0 1px ${alpha(tokens.signal, 0.4)}, 0 8px 20px -8px ${tokens.signalGlow}`,
          },
        },
        outlined: {
          borderColor: tokens.hairlineStrong,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.72rem",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: tokens.hairline,
        },
        head: {
          color: tokens.textSecondary,
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          backgroundColor: tokens.surface,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: alpha(tokens.signal, 0.04),
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface,
          borderRight: `1px solid ${tokens.hairline}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(tokens.ink, 0.85),
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${tokens.hairline}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#FFFFFF", 0.02),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surfaceRaised,
          border: `1px solid ${tokens.hairline}`,
          fontSize: "0.72rem",
        },
      },
    },
  },
});
