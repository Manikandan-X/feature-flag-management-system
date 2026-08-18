import { Chip, alpha } from "@mui/material";
import { environmentColor } from "../../theme";

export function EnvironmentChip({
  name,
  size = "small",
}: {
  name: string;
  size?: "small" | "medium";
}) {
  const color = environmentColor(name);
  return (
    <Chip
      label={name}
      size={size}
      sx={{
        color,
        backgroundColor: alpha(color, 0.14),
        border: `1px solid ${alpha(color, 0.4)}`,
        textTransform: "capitalize",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.68rem",
      }}
    />
  );
}
