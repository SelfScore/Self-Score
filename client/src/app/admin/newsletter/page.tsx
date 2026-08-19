"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from "@mui/icons-material";
import { adminService } from "@/services/adminService";

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  isSubscribed: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  source: string;
}

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [statusFilter, setStatusFilter] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [search, setSearch] = useState("");

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminService.getNewsletterSubscribers(
        page + 1,
        rowsPerPage,
        search,
        sortBy,
        statusFilter
      );

      if (response && Array.isArray(response.subscribers)) {
        setSubscribers(response.subscribers);
        setTotalSubscribers(response.pagination.total);
      } else {
        setError("Failed to fetch newsletter subscribers");
      }
    } catch (err: any) {
      console.error("Error fetching newsletter subscribers:", err);
      setError(err.response?.data?.message || "Failed to load newsletter subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, sortBy, statusFilter, search]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (subscriberId: string, currentStatus: boolean) => {
    const confirmationMsg = currentStatus
      ? "Are you sure you want to unsubscribe this email address?"
      : "Are you sure you want to re-subscribe this email address?";
      
    if (!confirm(confirmationMsg)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await adminService.toggleSubscriberStatus(subscriberId);
      if (response && response._id) {
        // Refresh local subscribers list
        await fetchSubscribers();
      } else {
        alert("Failed to update subscriber status");
      }
    } catch (err: any) {
      console.error("Error updating subscriber status:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm("Are you sure you want to delete this subscriber? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deleteSubscriber(subscriberId);
      // Reset page to 0 if we delete the last item on the page
      if (subscribers.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        await fetchSubscribers();
      }
    } catch (err: any) {
      console.error("Error deleting subscriber:", err);
      alert(err.response?.data?.message || "Failed to delete subscriber");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#1A1A1A", mb: 1, fontFamily: "Faustina" }}
        >
          Newsletter Subscribers
        </Typography>
        <Typography variant="body2" sx={{ color: "#666", fontFamily: "Source Sans Pro" }}>
          Manage all email newsletter subscribers and their subscription status
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#6B7280" }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "12px",
              backgroundColor: "#FFF",
              fontFamily: "Source Sans Pro",
            },
          }}
        />

        {/* Status Filter */}
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(0);
            }}
            displayEmpty
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              fontFamily: "Source Sans Pro",
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: "Source Sans Pro" }}>All Statuses</MenuItem>
            <MenuItem value="subscribed" sx={{ fontFamily: "Source Sans Pro" }}>Subscribed</MenuItem>
            <MenuItem value="unsubscribed" sx={{ fontFamily: "Source Sans Pro" }}>Unsubscribed</MenuItem>
          </Select>
        </FormControl>

        {/* Sort By Date */}
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setPage(0);
            }}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              fontFamily: "Source Sans Pro",
            }}
          >
            <MenuItem value="latest" sx={{ fontFamily: "Source Sans Pro" }}>Newest First</MenuItem>
            <MenuItem value="oldest" sx={{ fontFamily: "Source Sans Pro" }}>Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main Table */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          border: "1px solid #E5E7EB",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#374151", fontFamily: "Source Sans Pro" }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#374151", fontFamily: "Source Sans Pro" }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#374151", fontFamily: "Source Sans Pro" }}>
                Source
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#374151", fontFamily: "Source Sans Pro" }}>
                Date Joined
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#374151", fontFamily: "Source Sans Pro" }}>
                Status
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, color: "#374151", fontFamily: "Source Sans Pro" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={40} sx={{ color: "#FF4F00" }} />
                </TableCell>
              </TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography sx={{ color: "#6B7280", fontFamily: "Source Sans Pro" }}>
                    No newsletter subscribers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber._id} hover>
                  <TableCell sx={{ fontFamily: "Source Sans Pro", fontWeight: 500 }}>
                    {subscriber.name}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Source Sans Pro", color: "#4B5563" }}>
                    {subscriber.email}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Source Sans Pro", color: "#6B7280" }}>
                    <Chip
                      label={subscriber.source || "homepage-popup"}
                      size="small"
                      sx={{
                        backgroundColor: "#F3F4F6",
                        color: "#4B5563",
                        fontSize: "12px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Source Sans Pro", color: "#6B7280" }}>
                    {formatDate(subscriber.subscribedAt)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={subscriber.isSubscribed ? "Subscribed" : "Unsubscribed"}
                      color={subscriber.isSubscribed ? "success" : "default"}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: subscriber.isSubscribed ? "#D1FAE5" : "#F3F4F6",
                        color: subscriber.isSubscribed ? "#065F46" : "#4B5563",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <Tooltip
                        title={subscriber.isSubscribed ? "Unsubscribe User" : "Subscribe User"}
                      >
                        <IconButton
                          onClick={() =>
                            handleToggleStatus(subscriber._id, subscriber.isSubscribed)
                          }
                          disabled={actionLoading}
                          sx={{
                            color: subscriber.isSubscribed ? "#FF4F00" : "#6B7280",
                          }}
                        >
                          {subscriber.isSubscribed ? (
                            <ToggleOnIcon sx={{ fontSize: 28 }} />
                          ) : (
                            <ToggleOffIcon sx={{ fontSize: 28 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Subscriber">
                        <IconButton
                          onClick={() => handleDeleteSubscriber(subscriber._id)}
                          disabled={actionLoading}
                          sx={{
                            color: "#EF4444",
                            "&:hover": { backgroundColor: "#FEF2F2" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalSubscribers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #E5E7EB",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontFamily: "Source Sans Pro",
            },
          }}
        />
      </TableContainer>
    </Box>
  );
}
