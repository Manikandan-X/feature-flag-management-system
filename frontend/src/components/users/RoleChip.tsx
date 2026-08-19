import { Chip, alpha } from "@mui/material";
import { tokens } from "../../theme";
import type { UserRole } from "../../types";

const roleColor: Record<UserRole, string> = {
  ADMIN: tokens.signal,
  EMPLOYEE: tokens.envDevelopment,
};

export function RoleChip({ role, size = "small" }: { role: UserRole | string; size?: "small" | "medium" }) {
  const color = roleColor[role as UserRole] ?? tokens.signal;
  return (
    <Chip
      label={role}
      size={size}
      sx={{
        color,
        backgroundColor: alpha(color, 0.14),
        border: `1px solid ${alpha(color, 0.4)}`,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "0.68rem",
      }}
    />
  );
}
