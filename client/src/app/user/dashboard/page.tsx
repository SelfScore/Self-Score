"use client";

import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Person, Assessment, History, Settings } from "@mui/icons-material";

export default function UserDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#E87A42",
                fontSize: "2rem",
                mr: 3,
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#005F73", mb: 1 }}
              >
                Welcome back, {user.username}!
              </Typography>
              <Typography variant="body1" sx={{ color: "#666", mb: 1 }}>
                {user.email}
              </Typography>
              {user.phoneNumber && (
                <Typography variant="body2" sx={{ color: "#999" }}>
                  {user.phoneNumber}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              color: "#E87A42",
              borderColor: "#E87A42",
              "&:hover": {
                backgroundColor: "rgba(232, 122, 66, 0.1)",
                borderColor: "#D16A35",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Quick Actions Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => router.push("/user/test")}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Assessment sx={{ fontSize: 48, color: "#E87A42", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Take Test
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Start your life assessment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => router.push("/user/history")}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <History sx={{ fontSize: 48, color: "#005F73", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Test History
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                View your past results
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => router.push("/user/profile")}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Person sx={{ fontSize: 48, color: "#E87A42", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Profile
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Manage your account
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => router.push("/user/settings")}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Settings sx={{ fontSize: 48, color: "#005F73", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Settings
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Customize preferences
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#005F73", mb: 3 }}
        >
          Recent Activity
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
            No recent activity yet
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/user/test")}
            sx={{
              backgroundColor: "#E87A42",
              "&:hover": { backgroundColor: "#D16A35" },
            }}
          >
            Take Your First Test
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
