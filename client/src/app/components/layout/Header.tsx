"use client";

import {
  AppBar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
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
import LogoWithText from "../../../../public/images/logos/LogoWithText.png";
import { useAuth } from "../../../hooks/useAuth";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, user, logout } = useAuth();

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
    { label: "Mission", href: "/mission" },
    { label: "Contact", href: "/contact" },
    { label: "Take the Test", href: "/user/test", variant: "contained" },
  ];

  const authNavigationLinks = isAuthenticated
    ? [...navigationLinks]
    : [
        ...navigationLinks,
        { label: "Sign In", href: "/auth/signin", variant: "outlined" },
      ];

  const drawer = (
    <Box sx={{ width: 280, height: "100%" }}>
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
            height={32}
            width={96}
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
        {authNavigationLinks.map((link) => (
          <ListItem key={link.label} sx={{ mb: 1, px: 3 }}>
            <Link
              href={link.href}
              style={{ textDecoration: "none", width: "100%" }}
            >
              <Button
                fullWidth
                variant={
                  link.variant === "contained"
                    ? "contained"
                    : link.variant === "outlined"
                    ? "outlined"
                    : "text"
                }
                size="large"
                onClick={handleDrawerToggle}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 500,
                  ...(link.variant === "contained" && {
                    backgroundColor: "#E87A42",
                    color: "#F9F8F6",
                    "&:hover": {
                      backgroundColor: "#d66a35",
                    },
                  }),
                  ...(link.variant === "outlined" && {
                    borderColor: "#005F73",
                    color: "#005F73",
                    "&:hover": {
                      backgroundColor: "rgba(0, 95, 115, 0.1)",
                    },
                  }),
                  ...(!link.variant && {
                    color: "#2B2B2B",
                    "&:hover": {
                      backgroundColor: "rgba(0, 95, 115, 0.1)",
                    },
                  }),
                }}
              >
                {link.label}
              </Button>
            </Link>
          </ListItem>
        ))}

        {/* Authentication section for mobile */}
        {isAuthenticated && (
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
        )}
      </List>
    </Box>
  );

  return (
    <Box
      position="sticky"
      sx={{
        backgroundColor: "#F9F8F6",
        border: "none",
        borderBottom: "none",
        boxShadow: "none",
        top: 0,
        zIndex: 0,
        // minHeight:"100px"
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            minHeight: "64px",
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
                height={60}
                width={120}
                style={{
                  objectFit: "contain",
                }}
                priority
              />
            </Box>
          </Link>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navigationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    sx={{
                      color: "#2B2B2B",
                      fontWeight: 500,
                      fontSize: "1rem",
                      px: 2,
                      "&:hover": {
                        backgroundColor: "rgba(0, 95, 115, 0.1)",
                        color: "#005F73",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}

              <Link href="/user/test" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#E87A42",
                    color: "#F9F8F6",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: "25px",
                    "&:hover": {
                      backgroundColor: "#d66a35",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Take the Test
                </Button>
              </Link>

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
                    <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #eee" }}>
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
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "#005F73",
                      color: "#005F73",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: "25px",
                      "&:hover": {
                        backgroundColor: "rgba(0, 95, 115, 0.1)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </Box>
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
      </Container>

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
            backgroundColor: "#F9F8F6",
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
