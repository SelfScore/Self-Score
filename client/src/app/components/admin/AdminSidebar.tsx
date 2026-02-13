"use client";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import LogoutIcon from "@mui/icons-material/Logout";
import { logoutAdmin } from "@/services/adminAuthService";
import { adminService } from "@/services/adminService";
import LogoutConfirmationModal from "@/app/components/ui/LogoutConfirmationModal";

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
    title: "Consultants",
    icon: <SupervisorAccountIcon />,
    path: "/admin/consultants",
  },
  {
    title: "Level 4 Submissions",
    icon: <AssignmentIcon />,
    path: "/admin/level4-submissions",
  },
  {
    title: "Level 5 Submissions",
    icon: <AssignmentIcon />,
    path: "/admin/level5-submissions",
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
  const [counts, setCounts] = useState({
    pendingReviews: 0,
    pendingLevel4Reviews: 0,
    pendingLevel5Reviews: 0,
    unreadMessages: 0,
    pendingConsultants: 0,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    // Fetch counts initially
    fetchCounts();

    // Refresh counts when navigating to relevant pages
    if (
      pathname?.startsWith("/admin/level4-submissions") ||
      pathname?.startsWith("/admin/messages")
    ) {
      fetchCounts();
    }
  }, [pathname]); // Fetch on initial mount and when pathname changes

  const fetchCounts = async () => {
    try {
      const data = await adminService.getCounts();
      setCounts(data);
    } catch (error) {
      console.error("Failed to fetch counts:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      await logoutAdmin();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
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

          // Determine badge count for this item
          let badgeCount = 0;
          if (item.path === "/admin/level4-submissions") {
            badgeCount = counts.pendingLevel4Reviews;
          } else if (item.path === "/admin/level5-submissions") {
            badgeCount = counts.pendingLevel5Reviews;
          } else if (item.path === "/admin/messages") {
            badgeCount = counts.unreadMessages;
          } else if (item.path === "/admin/consultants") {
            badgeCount = counts.pendingConsultants;
          }

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
                {badgeCount > 0 && (
                  <Badge
                    badgeContent={badgeCount}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#FF4F00",
                        color: "#FFF",
                        fontWeight: 600,
                        fontSize: "12px",
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout Button */}
      <Box sx={{ px: 2, pb: 3 }}>
        <ListItemButton
          onClick={handleLogoutClick}
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

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        open={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />
    </Box>
  );
}
