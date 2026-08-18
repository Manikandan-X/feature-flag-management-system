import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import type { SvgIconComponent } from "@mui/icons-material";

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardRoundedIcon },
  { label: "Feature Flags", path: "/flags", icon: ToggleOnRoundedIcon },
  { label: "Environments", path: "/environments", icon: DnsRoundedIcon },
  { label: "Analytics", path: "/analytics", icon: InsightsRoundedIcon, adminOnly: true },
  { label: "Audit Log", path: "/audit-logs", icon: HistoryRoundedIcon, adminOnly: true },
];
