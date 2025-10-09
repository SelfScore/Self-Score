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
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoWithText from "../../../../public/images/logos/LogoWithText.png";
import { useAuth } from "../../../hooks/useAuth";
import FreeChip from "../ui/FreeChip";
import ButtonSelfScore from "../ui/ButtonSelfScore";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const navigationLinks = [
    { label: "Home", href: "/" },
    { label: "Our Mission", href: "/ourMission" },
    { label: "Contact Us", href: "/contact" },
    {
      label: "Self Score Test",
      href: "/user/test",
      variant: "contained",
      FreeChip: true,
    },
  ];

  const drawer = (
    <Box sx={{ width: { xs: 260, sm: 280 }, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Image
            src={LogoWithText}
            alt="Life Score Logo"
            height={28}
            width={84}
            style={{
              objectFit: "contain",
            }}
          />
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ pt: 3 }}>
        {navigationLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <ListItem key={link.label} sx={{ mb: 1, px: 3 }}>
              <Box sx={{ width: "100%" }}>
                {link.FreeChip && (
                  <Box
                    sx={{ mb: 1, display: "flex", justifyContent: "center" }}
                  >
                    <FreeChip />
                  </Box>
                )}
                <Link
                  href={link.href}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <Button
                    fullWidth
                    variant="text"
                    size="large"
                    onClick={handleDrawerToggle}
                    sx={{
                      justifyContent: "flex-start",
                      py: 1.5,
                      fontSize: { xs: "18px", sm: "20px" },
                      fontWeight: 400,
                      fontFamily: "Source Sans Pro, sans-serif",
                      color: isActive ? "#307E8D" : "#1A1A1A",
                      textDecoration: isActive ? "underline" : "none",
                      textUnderlineOffset: "4px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(0, 95, 115, 0.1)",
                        color: isActive ? "#307E8D" : "#005F73",
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
        {isAuthenticated ? (
          <>
            <Divider sx={{ my: 2 }} />
            <ListItem sx={{ mb: 1, px: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#E87A42",
                    mr: 2,
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {user?.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666" }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </ListItem>

            <ListItem sx={{ mb: 1, px: 3 }}>
              <Link
                href="/user/dashboard"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button
                  fullWidth
                  variant="text"
                  size="large"
                  onClick={handleDrawerToggle}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "#2B2B2B",
                    "&:hover": {
                      backgroundColor: "rgba(0, 95, 115, 0.1)",
                    },
                  }}
                >
                  <Dashboard sx={{ mr: 1 }} />
                  Dashboard
                </Button>
              </Link>
            </ListItem>

            <ListItem sx={{ mb: 1, px: 3 }}>
              <Link
                href="/user/profile"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button
                  fullWidth
                  variant="text"
                  size="large"
                  onClick={handleDrawerToggle}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "#2B2B2B",
                    "&:hover": {
                      backgroundColor: "rgba(0, 95, 115, 0.1)",
                    },
                  }}
                >
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </Button>
              </Link>
            </ListItem>

            <ListItem sx={{ mb: 1, px: 3 }}>
              <Button
                fullWidth
                variant="text"
                size="large"
                onClick={handleLogout}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "#d32f2f",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.1)",
                  },
                }}
              >
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </Button>
            </ListItem>
          </>
        ) : (
          <>
            <Divider sx={{ my: 2 }} />
            <ListItem sx={{ mb: 1, px: 3 }}>
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
        width: { xs: "98%", sm: "95%", md: "90%", lg: "89%" },
        borderRadius: { xs: "12px", md: "16px" },
        mx: "auto",
        my: { xs: "8px", md: "14px" },
        zIndex: 10,
        px: { xs: 1.5, sm: 2, md: 1 },
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
                  gap: 2,
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {navigationLinks.map((link) => {
                  const isActive = pathname === link.href;
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
                            color: isActive ? "#307E8D" : "#1A1A1A",
                            fontWeight: 500,
                            fontSize: "1rem",
                            fontFamily: "Source Sans Pro, sans-serif",
                            px: 2,
                            textDecoration: isActive ? "underline" : "none",
                            textUnderlineOffset: "4px",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "rgba(0, 95, 115, 0.1)",
                              color: isActive ? "#307E8D" : "#005F73",
                            },
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
                {isAuthenticated ? (
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
                        {user?.username?.charAt(0) ||
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
                      sx={{ mt: 1 }}
                    >
                      <Box
                        sx={{ px: 2, py: 1, borderBottom: "1px solid #eee" }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          {user?.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          {user?.email}
                        </Typography>
                      </Box>

                      <MenuItem
                        onClick={() => {
                          handleProfileMenuClose();
                          window.location.href = "/user/dashboard";
                        }}
                      >
                        <Dashboard sx={{ mr: 1, fontSize: 20 }} />
                        Dashboard
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          handleProfileMenuClose();
                          window.location.href = "/user/profile";
                        }}
                      >
                        <AccountCircle sx={{ mr: 1, fontSize: 20 }} />
                        Profile
                      </MenuItem>

                      <Divider />

                      <MenuItem onClick={handleLogout}>
                        <ExitToApp sx={{ mr: 1, fontSize: 20 }} />
                        Logout
                      </MenuItem>
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
            width: { xs: 260, sm: 280 },
            backgroundColor: "#F9F8F6",
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
