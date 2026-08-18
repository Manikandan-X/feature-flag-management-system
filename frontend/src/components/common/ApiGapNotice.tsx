import { Box, Stack, Typography, alpha } from "@mui/material";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import { tokens } from "../../theme";

/**
 * Shown on sections that can only WRITE, not READ, because the backend
 * doesn't yet expose a GET endpoint for this data. Written once, referenced
 * across the 3 known gaps: users list, user-assignments list, schedule readback.
 */
export function ApiGapNotice({ endpoint, note }: { endpoint: string; note: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px dashed ${alpha(tokens.warning, 0.5)}`,
        backgroundColor: alpha(tokens.warning, 0.06),
        px: 2,
        py: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <ConstructionRoundedIcon sx={{ color: tokens.warning, fontSize: 20, mt: "1px" }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.warning }}>
            Backend endpoint needed: {endpoint}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {note}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
