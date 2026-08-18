import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  alpha,
  useMediaQuery,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { navItems } from "./navConfig";
import { useAuth } from "../../context/AuthContext";
import { tokens } from "../../theme";

const DRAWER_WIDTH = 248;

export function AppShell() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 2.5, py: 3 }}>
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
          <Typography
            variant="h6"
            sx={{ fontFamily: '"JetBrains Mono", monospace', letterSpacing: "-0.02em" }}
          >
            signal
          </Typography>
        </Stack>
      </Box>

      <List sx={{ px: 1.5, flex: 1 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: tokens.textSecondary,
              "&.active": {
                color: tokens.textPrimary,
                backgroundColor: alpha(tokens.signal, 0.1),
                "& .MuiListItemIcon-root": { color: tokens.signal },
              },
              "&:hover": { backgroundColor: alpha("#FFFFFF", 0.04) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <item.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { fontSize: "0.875rem", fontWeight: 600 } }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: tokens.hairline }} />
      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: tokens.textMuted, fontFamily: '"JetBrains Mono", monospace' }}
        >
          role: {user?.role ?? "—"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, width: "100%" }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: tokens.textPrimary }}>
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: "0.8rem",
                  bgcolor: alpha(tokens.envDevelopment, 0.2),
                  color: tokens.envDevelopment,
                  border: `1px solid ${alpha(tokens.envDevelopment, 0.5)}`,
                }}
              >
                {user?.username?.slice(0, 2).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                {user?.username}
              </Typography>
            </Box>
          </Stack>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                navigate("/profile");
              }}
            >
              <LockResetRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />
              Change password
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                logout();
                navigate("/login");
              }}
            >
              <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.25 }} />
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 10, md: 11 },
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
