"use client";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EmailIcon from "@mui/icons-material/Email";
import LogoutIcon from "@mui/icons-material/Logout";
import { logoutAdmin } from "@/services/adminAuthService";

const menuItems = [
  {
    title: "Overview",
    icon: <DashboardIcon />,
    path: "/admin/overview",
  },
  {
    title: "Users",
    icon: <PeopleIcon />,
    path: "/admin/users",
  },
  {
    title: "Inbox",
    icon: <EmailIcon />,
    path: "/admin/messages",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "#FFF",
        borderRight: "1px solid #E0E0E0",
        display: "flex",
        flexDirection: "column",
        pt: 3,
      }}
    >
      {/* Logo/Title */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "Faustina",
            fontSize: "28px",
            fontWeight: 700,
            color: "#FF4F00",
          }}
        >
          Admin Panel
        </Typography>
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
            color: "#6B7280",
            mt: 0.5,
          }}
        >
          Self Score Management
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.path || pathname?.startsWith(item.path + "/");

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: isActive ? "#FF4F0010" : "transparent",
                  "&:hover": {
                    backgroundColor: isActive ? "#FF4F0020" : "#F7F7F7",
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "#FF4F00" : "#6B7280",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "16px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#FF4F00" : "#2B2B2B",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout Button */}
      <Box sx={{ px: 2, pb: 3 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: "12px",
            backgroundColor: "transparent",
            border: "1px solid #E0E0E0",
            "&:hover": {
              backgroundColor: "#FEF2F2",
              borderColor: "#FF4F00",
            },
            py: 1.5,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "#6B7280" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              fontWeight: 400,
              color: "#2B2B2B",
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
