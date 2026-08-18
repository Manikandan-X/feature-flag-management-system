import { Box, Card, Stack, Typography, alpha } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: SvgIconComponent;
  color: string;
  suffix?: string;
}) {
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography
            variant="h3"
            sx={{ mt: 0.5, fontFamily: '"JetBrains Mono", monospace', fontSize: "2rem" }}
          >
            {value}
            {suffix && (
              <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                {suffix}
              </Typography>
            )}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(color, 0.14),
            border: `1px solid ${alpha(color, 0.35)}`,
            color,
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>
      </Stack>
    </Card>
  );
}
