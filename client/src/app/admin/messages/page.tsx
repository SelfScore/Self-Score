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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  Email as EmailIcon,
  MarkEmailRead as EmailOpenIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { contactService, ContactMessage } from "@/services/contactService";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">(
    "all"
  );
  const [search, setSearch] = useState("");

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await contactService.getMessages(
        page + 1,
        rowsPerPage,
        statusFilter,
        sortBy,
        search
      );

      if (response.success) {
        setMessages(response.data.messages);
        setTotalMessages(response.data.pagination.total);
      } else {
        setError("Failed to fetch messages");
      }
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
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

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setOpenDialog(true);

    // Mark as read if unread
    if (message.status === "unread") {
      try {
        await contactService.markAsRead(message._id);
        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === message._id ? { ...msg, status: "read" } : msg
          )
        );
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setActionLoading(true);
      await contactService.deleteMessage(messageId);

      // Refresh messages
      await fetchMessages();

      // Close dialog if deleted message was open
      if (selectedMessage?._id === messageId) {
        setOpenDialog(false);
        setSelectedMessage(null);
      }
    } catch (err: any) {
      console.error("Error deleting message:", err);
      alert(err.response?.data?.message || "Failed to delete message");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMessage(null);
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

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength
      ? message.substring(0, maxLength) + "..."
      : message;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#1A1A1A", mb: 1 }}
        >
          Contact Messages
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          Manage all contact form submissions from users
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
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            },
          }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={sortBy}
            onChange={(e: SelectChangeEvent) => {
              setSortBy(e.target.value as "latest" | "oldest");
              setPage(0);
            }}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            }}
          >
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={statusFilter}
            onChange={(e: SelectChangeEvent) => {
              setStatusFilter(e.target.value as "all" | "read" | "unread");
              setPage(0);
            }}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            }}
          >
            <MenuItem value="all">All Messages</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
            <MenuItem value="read">Read</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Messages Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No messages found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow
                    key={message._id}
                    hover
                    sx={{
                      backgroundColor:
                        message.status === "unread" ? "#FFF9F5" : "inherit",
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewMessage(message)}
                  >
                    <TableCell>
                      <Chip
                        icon={
                          message.status === "unread" ? (
                            <EmailIcon fontSize="small" />
                          ) : (
                            <EmailOpenIcon fontSize="small" />
                          )
                        }
                        label={message.status === "unread" ? "Unread" : "Read"}
                        size="small"
                        color={
                          message.status === "unread" ? "warning" : "default"
                        }
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: message.status === "unread" ? 600 : 400,
                        }}
                      >
                        {message.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#0A9396" }}>
                        {message.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {truncateMessage(message.message)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#999" }}>
                        {formatDate(message.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMessage(message);
                          }}
                          sx={{ color: "#0A9396" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(message._id);
                          }}
                          sx={{ color: "#E87A42" }}
                          disabled={actionLoading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalMessages}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Message Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Message Details
                </Typography>
                <Chip
                  label={
                    selectedMessage.status === "unread" ? "Unread" : "Read"
                  }
                  size="small"
                  color={
                    selectedMessage.status === "unread" ? "warning" : "default"
                  }
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                  From
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedMessage.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ color: "#0A9396" }}>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {selectedMessage.email}
                  </a>
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                  Date
                </Typography>
                <Typography variant="body2">
                  {formatDate(selectedMessage.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                  Message
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: "#F9F9F9",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedMessage.message}
                  </Typography>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                onClick={() => handleDeleteMessage(selectedMessage._id)}
                color="error"
                variant="outlined"
                disabled={actionLoading}
              >
                Delete
              </Button>
              <Button onClick={handleCloseDialog} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
