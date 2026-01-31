"use client";

import {
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  Dashboard,
  ExitToApp,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import LogoWithText from "../../../../public/images/logos/LogoWithText.png";
import { useAuth } from "../../../hooks/useAuth";
import {
  consultantAuthService,
  ConsultantData,
} from "../../../services/consultantAuthService";
import FreeChip from "../ui/FreeChip";
import ButtonSelfScore from "../ui/ButtonSelfScore";
import LogoutConfirmationModal from "../ui/LogoutConfirmationModal";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [consultant, setConsultant] = useState<ConsultantData | null>(null);
  const [isConsultantAuth, setIsConsultantAuth] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check for consultant authentication only on consultant pages
  useEffect(() => {
    const checkConsultantAuth = async () => {
      // If user is authenticated, don't check consultant auth at all
      if (isAuthenticated) {
        setConsultant(null);
        setIsConsultantAuth(false);
        return;
      }

      // Only check consultant auth if we're on a consultant route
      const isConsultantRoute = pathname.startsWith("/consultant");

      if (isConsultantRoute) {
        try {
          const response = await consultantAuthService.getCurrentConsultant();
          if (response.success && response.data) {
            setConsultant(response.data);
            setIsConsultantAuth(true);
            return;
          }
        } catch (_error) {
          // Silently fail - not a consultant
        }
      }

      // Reset consultant state
      setConsultant(null);
      setIsConsultantAuth(false);
    };

    checkConsultantAuth();
  }, [pathname, isAuthenticated]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      if (isConsultantAuth) {
        await consultantAuthService.logout();
        setConsultant(null);
        setIsConsultantAuth(false);
        router.push("/consultant/login");
      } else {
        logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const navigationLinks = [
    // { label: "Home", href: "/" },
    { label: "Our Mission", href: "/ourMission" },
    {
      label: "Self Score Test",
      href: isAuthenticated ? "/selfscoretest" : "/testInfo",
      variant: "contained",
      FreeChip: true,
    },
    { label: "Contact Us", href: "/contact" },
    { label: "Consultations", href: "/consultations" },
    { label: "Blogs", href: "/blogs" },
  ];

  // Helper function to check if a link is active
  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    // Normalize both paths by removing trailing slashes
    const normalizedPathname =
      pathname.endsWith("/") && pathname !== "/"
        ? pathname.slice(0, -1)
        : pathname;
    const normalizedHref =
      href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;
    return normalizedPathname === normalizedHref;
  };

  const drawer = (
    <Box sx={{ width: 280, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header - User info (if logged in) or just close button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          borderBottom: "1px solid #E8E8E8",
        }}
      >
        {isAuthenticated || isConsultantAuth ? (
          <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", flex: 1 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: "#E87A42",
                mr: 1.5,
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {isConsultantAuth
                ? consultant?.firstName?.charAt(0) || consultant?.email?.charAt(0) || "C"
                : user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
            </Avatar>
            <Box sx={{ overflow: "hidden", minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#1A1A1A",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}
              >
                {isConsultantAuth
                  ? `${consultant?.firstName} ${consultant?.lastName}`
                  : user?.username}
              </Typography>
              <Typography
                sx={{
                  color: "#666",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}
              >
                {isConsultantAuth ? consultant?.email : user?.email}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box />
        )}
        <IconButton
          onClick={handleDrawerToggle}
          size="small"
          sx={{
            color: "#2B2B2B",
            ml: 1,
            "&:hover": {
              backgroundColor: "rgba(0, 95, 115, 0.1)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <List sx={{ py: 1, overflow: "hidden" }} disablePadding>
        {/* Home Link - Only in drawer */}
        <ListItem disablePadding sx={{ px: 1.5 }}>
          <Link href="/" style={{ textDecoration: "none", width: "100%" }}>
            <Button
              fullWidth
              variant="text"
              onClick={handleDrawerToggle}
              sx={{
                justifyContent: "flex-start",
                py: 0.75,
                px: 1.5,
                fontSize: "14px",
                fontWeight: isLinkActive("/") ? 600 : 400,
                fontFamily: "Source Sans Pro, sans-serif",
                color: isLinkActive("/") ? "#005F73" : "#2B2B2B",
                backgroundColor: isLinkActive("/") ? "rgba(0, 95, 115, 0.08)" : "transparent",
                borderRadius: "8px",
                textTransform: "none",
                minHeight: "36px",
                "&:hover": {
                  backgroundColor: "rgba(0, 95, 115, 0.08)",
                  color: "#005F73",
                },
              }}
            >
              Home
            </Button>
          </Link>
        </ListItem>

        {navigationLinks.map((link) => {
          const isActive = isLinkActive(link.href);
          return (
            <ListItem key={link.label} disablePadding sx={{ px: 1.5 }}>
              <Box sx={{ width: "100%" }}>
                {link.FreeChip && (
                  <Box sx={{ mb: 0.5, display: "flex", justifyContent: "flex-start", pl: 1 }}>
                    <FreeChip />
                  </Box>
                )}
                <Link href={link.href} style={{ textDecoration: "none", width: "100%" }}>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={handleDrawerToggle}
                    sx={{
                      justifyContent: "flex-start",
                      py: 0.75,
                      px: 1.5,
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: "Source Sans Pro, sans-serif",
                      color: isActive ? "#005F73" : "#2B2B2B",
                      backgroundColor: isActive ? "rgba(0, 95, 115, 0.08)" : "transparent",
                      borderRadius: "8px",
                      textTransform: "none",
                      minHeight: "36px",
                      "&:hover": {
                        backgroundColor: "rgba(0, 95, 115, 0.08)",
                        color: "#005F73",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                </Link>
              </Box>
            </ListItem>
          );
        })}

        {/* Authentication section for mobile */}
        {isAuthenticated || isConsultantAuth ? (
          <>
            <Divider sx={{ my: 1, mx: 1.5 }} />

            {/* Dashboard Link */}
            <ListItem disablePadding sx={{ px: 1.5 }}>
              <Link
                href={isConsultantAuth ? "/consultant/dashboard" : "/user/dashboard"}
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleDrawerToggle}
                  sx={{
                    justifyContent: "flex-start",
                    py: 0.75,
                    px: 1.5,
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#2B2B2B",
                    borderRadius: "8px",
                    minHeight: "36px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 95, 115, 0.08)",
                      color: "#005F73",
                    },
                  }}
                >
                  <Dashboard sx={{ mr: 1, color: "#005F73", fontSize: 18 }} />
                  Dashboard
                </Button>
              </Link>
            </ListItem>

            {/* Profile Link */}
            <ListItem disablePadding sx={{ px: 1.5 }}>
              <Link
                href={isConsultantAuth ? "/consultant/profile" : "/user/profile"}
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleDrawerToggle}
                  sx={{
                    justifyContent: "flex-start",
                    py: 0.75,
                    px: 1.5,
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#2B2B2B",
                    borderRadius: "8px",
                    minHeight: "36px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 95, 115, 0.08)",
                      color: "#005F73",
                    },
                  }}
                >
                  <AccountCircle sx={{ mr: 1, color: "#005F73", fontSize: 18 }} />
                  Profile
                </Button>
              </Link>
            </ListItem>

            {/* Logout Button */}
            <ListItem disablePadding sx={{ px: 1.5 }}>
              <Button
                fullWidth
                variant="text"
                onClick={handleLogoutClick}
                sx={{
                  justifyContent: "flex-start",
                  py: 0.75,
                  px: 1.5,
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#d32f2f",
                  borderRadius: "8px",
                  minHeight: "36px",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.08)",
                  },
                }}
              >
                <ExitToApp sx={{ mr: 1, fontSize: 18 }} />
                Logout
              </Button>
            </ListItem>
          </>
        ) : (
          <>
            <Divider sx={{ my: 1, mx: 1.5 }} />
            <ListItem disablePadding sx={{ px: 1.5 }}>
              <Link
                href="/auth/signin"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <ButtonSelfScore text="Sign In" />
              </Link>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      position="fixed"
      left="50%"
      sx={{
        transform: "translateX(-50%)",
        backgroundColor: "rgba(247, 247, 247, 0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid #3A3A3A33",
        boxShadow: "none",
        top: 0,
        width: { xs: "98%", sm: "95%", md: "90%", lg: "90%" },
        borderRadius: { xs: "12px", md: "16px" },
        mx: "auto",
        my: { xs: "8px", md: "14px" },
        zIndex: 10,
        px: { xs: 1.5, sm: 2, md: 0.5, lg: 1, xl: 1 },
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            maxHeight: "56px",
            border: "none",
            boxShadow: "none",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "opacity 0.3s ease",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <Image
                src={LogoWithText}
                alt="Life Score Logo"
                height={isMobile ? 50 : 60}
                width={isMobile ? 100 : 120}
                style={{
                  objectFit: "contain",
                  scale: isMobile ? 1 : 1.1,
                }}
                priority
              />
            </Box>
          </Link>

          {!isMobile && (
            <>
              {/* Navigation Links - Center */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { md: 1, lg: 1.5, xl: 2 },
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {navigationLinks.map((link) => {
                  const isActive = isLinkActive(link.href);
                  return (
                    <Box key={link.label}>
                      {link.FreeChip && (
                        <Box>
                          <FreeChip />
                        </Box>
                      )}
                      <Link
                        key={link.label}
                        href={link.href}
                        style={{ textDecoration: "none" }}
                      >
                        <Button
                          sx={{
                            color: isActive ? "#005F73" : "#1A1A1A",
                            fontWeight: isActive ? 600 : 500,
                            fontSize: {
                              md: "0.875rem",
                              lg: "1rem",
                              xl: "1rem",
                            },
                            fontFamily: "Source Sans Pro, sans-serif",
                            px: { md: 1, lg: 1.5, xl: 2 },
                            borderBottom: isActive
                              ? "1.5px solid #005F73"
                              : "1.5px solid transparent",
                            borderRadius: 0,
                            textTransform: "none",
                            // "&:hover": {
                            //   backgroundColor: "rgba(0, 95, 115, 0.1)",
                            //   color: isActive ? "#005F73" : "#005F73",
                            // },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {link.label}
                        </Button>
                      </Link>
                    </Box>
                  );
                })}
              </Box>

              {/* Authentication - Right */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isAuthenticated || isConsultantAuth ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      onClick={handleProfileMenuOpen}
                      sx={{
                        color: "#005F73",
                        "&:hover": {
                          backgroundColor: "rgba(0, 95, 115, 0.1)",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#E87A42",
                          fontSize: "1rem",
                          fontWeight: "bold",
                        }}
                      >
                        {isConsultantAuth
                          ? consultant?.firstName?.charAt(0) ||
                          consultant?.email?.charAt(0) ||
                          "C"
                          : user?.username?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          "U"}
                      </Avatar>
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleProfileMenuClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      sx={{
                        mt: 1.5,
                        "& .MuiPaper-root": {
                          borderRadius: "12px",
                          minWidth: "220px",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
                          border: "1px solid #E0E0E0",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          px: 2.5,
                          py: 2,
                          borderBottom: "1px solid #E8E8E8",
                          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              backgroundColor: "#E87A42",
                              fontSize: "1rem",
                              fontWeight: "bold",
                            }}
                          >
                            {isConsultantAuth
                              ? consultant?.firstName?.charAt(0) ||
                              consultant?.email?.charAt(0) ||
                              "C"
                              : user?.username?.charAt(0) ||
                              user?.email?.charAt(0) ||
                              "U"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600, color: "#1A1A1A", fontSize: "15px" }}
                            >
                              {isConsultantAuth
                                ? `${consultant?.firstName} ${consultant?.lastName}`
                                : user?.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#666", fontSize: "12px" }}>
                              {isConsultantAuth ? consultant?.email : user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ py: 1 }}>
                        <MenuItem
                          onClick={() => {
                            handleProfileMenuClose();
                            window.location.href = isConsultantAuth
                              ? "/consultant/dashboard"
                              : "/user/dashboard";
                          }}
                          sx={{
                            py: 1.5,
                            px: 2.5,
                            fontSize: "14px",
                            color: "#2B2B2B",
                            "&:hover": {
                              backgroundColor: "rgba(0, 95, 115, 0.08)",
                              color: "#005F73",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Dashboard sx={{ mr: 1.5, fontSize: 20, color: "#005F73" }} />
                          Dashboard
                        </MenuItem>

                        <MenuItem
                          onClick={() => {
                            handleProfileMenuClose();
                            window.location.href = isConsultantAuth
                              ? "/consultant/profile"
                              : "/user/profile";
                          }}
                          sx={{
                            py: 1.5,
                            px: 2.5,
                            fontSize: "14px",
                            color: "#2B2B2B",
                            "&:hover": {
                              backgroundColor: "rgba(0, 95, 115, 0.08)",
                              color: "#005F73",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <AccountCircle sx={{ mr: 1.5, fontSize: 20, color: "#005F73" }} />
                          Profile
                        </MenuItem>
                      </Box>

                      <Divider sx={{ my: 0 }} />

                      <Box sx={{ py: 1 }}>
                        <MenuItem
                          onClick={handleLogoutClick}
                          sx={{
                            py: 1.5,
                            px: 2.5,
                            fontSize: "14px",
                            color: "#d32f2f",
                            "&:hover": {
                              backgroundColor: "rgba(211, 47, 47, 0.08)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <ExitToApp sx={{ mr: 1.5, fontSize: 20 }} />
                          Logout
                        </MenuItem>
                      </Box>
                    </Menu>
                  </Box>
                ) : (
                  <Link href="/auth/signin" style={{ textDecoration: "none" }}>
                    <ButtonSelfScore text="Sign In" />
                  </Link>
                )}
              </Box>
            </>
          )}

          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{ color: "#005F73" }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            maxWidth: "85vw",
            backgroundColor: "#F9F8F6",
            overflowX: "hidden",
          },
        }}
      >
        {drawer}
      </Drawer>

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
