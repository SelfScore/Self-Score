"use client";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { useState, useEffect } from "react";
import { adminService, AnalyticsData } from "../../../services/adminService";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AdminOverview() {
  const [period, setPeriod] = useState<"7" | "14" | "30" | "all">("7");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAnalytics(period);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value as "7" | "14" | "30" | "all");
  };

  const formatRevenue = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    isRevenue = false,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    isRevenue?: boolean;
  }) => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #E0E0E0",
        backgroundColor: "#FFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#6B7280",
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: "32px",
              fontWeight: 700,
              color: "#2B2B2B",
            }}
          >
            {isRevenue ? formatRevenue(value) : value.toLocaleString()}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography sx={{ color: "#6B7280" }}>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Faustina",
              fontSize: "32px",
              fontWeight: 700,
              color: "#2B2B2B",
            }}
          >
            Overview
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#6B7280",
              mt: 0.5,
            }}
          >
            Analytics and insights for your platform
          </Typography>
        </Box>

        {/* Period Selector */}
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={period}
            onChange={handlePeriodChange}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            }}
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="14">Last 14 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={analytics?.summary.totalUsers || 0}
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            color="#0C677A"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="New Users"
            value={analytics?.summary.newUsers || 0}
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            color="#FF4F00"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tests Completed"
            value={analytics?.summary.totalTestsCompleted || 0}
            icon={<AssessmentIcon sx={{ fontSize: 28 }} />}
            color="#508B28"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={analytics?.summary.totalRevenue || 0}
            icon={<AttachMoneyIcon sx={{ fontSize: 28 }} />}
            color="#51BB00"
            isRevenue
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* New Users Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid #E0E0E0",
              backgroundColor: "#FFF",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "20px",
                fontWeight: 600,
                color: "#2B2B2B",
                mb: 3,
              }}
            >
              New Users Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.charts.dailyUsers || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  stroke="#E0E0E0"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  stroke="#E0E0E0"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF4F00"
                  strokeWidth={2}
                  name="New Users"
                  dot={{ fill: "#FF4F00", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tests Completed Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid #E0E0E0",
              backgroundColor: "#FFF",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "20px",
                fontWeight: 600,
                color: "#2B2B2B",
                mb: 3,
              }}
            >
              Tests Completed Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.charts.dailyTests || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  stroke="#E0E0E0"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  stroke="#E0E0E0"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#0C677A"
                  name="Tests Completed"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
