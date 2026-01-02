"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import {
  level5ReviewService,
  Level5Submission,
} from "@/services/level5ReviewService";

export default function Level5SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Level5Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "PENDING_REVIEW" | "REVIEWED"
  >("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await level5ReviewService.getAllSubmissions(
        page,
        limit,
        search,
        sortBy,
        statusFilter
      );

      if (response.success) {
        setSubmissions(response.data.submissions);
        setTotalPages(response.data.pagination.pages);
        setTotal(response.data.pagination.total);
      } else {
        setError("Failed to fetch submissions");
      }
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Failed to fetch submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleViewSubmission = (interviewId: string) => {
    router.push(`/admin/level5-submissions/${interviewId}`);
  };

  const getStatusChip = (status: string) => {
    if (status === "PENDING_REVIEW") {
      return (
        <Chip
          label="Pending Review"
          icon={<PendingIcon />}
          sx={{
            backgroundColor: "#FFF3E0",
            color: "#E65100",
            fontWeight: 600,
          }}
        />
      );
    } else if (status === "REVIEWED") {
      return (
        <Chip
          label="Reviewed"
          icon={<CheckCircleIcon />}
          sx={{
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
            fontWeight: 600,
          }}
        />
      );
    }
    return <Chip label={status} />;
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#005F73", mb: 1 }}
        >
          Level 5 AI Interview Submissions
        </Typography>
        <Typography variant="body1" sx={{ color: "#666" }}>
          Review and evaluate user submissions for Level 5 Real-Time AI Voice
          Interview
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearchChange}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#666" }} />
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
              setPage(1);
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

        <FormControl sx={{ minWidth: 180 }}>
          <Select
            value={statusFilter}
            onChange={(e: SelectChangeEvent) => {
              setStatusFilter(
                e.target.value as "all" | "PENDING_REVIEW" | "REVIEWED"
              );
              setPage(1);
            }}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="PENDING_REVIEW">Pending Review</MenuItem>
            <MenuItem value="REVIEWED">Reviewed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress sx={{ color: "#005F73" }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : submissions.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: "#F5F5F5",
            borderRadius: "12px",
          }}
        >
          <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
            No submissions found
          </Typography>
          <Typography variant="body2" sx={{ color: "#999" }}>
            {search
              ? "Try adjusting your search criteria"
              : "No Level 5 submissions available yet"}
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Submissions Table */}
          <TableContainer
            component={Paper}
            sx={{ borderRadius: "12px", mb: 3 }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  {/* <TableCell sx={{ fontWeight: 700 }}>Session ID</TableCell> */}
                  <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission._id}
                    hover
                    onClick={() => handleViewSubmission(submission._id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{submission.user.username}</TableCell>
                    <TableCell>{submission.user.email}</TableCell>
                    {/* <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          backgroundColor: "#F5F5F5",
                          px: 1,
                          py: 0.5,
                          borderRadius: "4px",
                        }}
                      >
                        {submission.sessionId.slice(0, 8)}...
                      </Typography>
                    </TableCell> */}
                    <TableCell>
                      {submission.submittedAt
                        ? formatDate(submission.submittedAt)
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusChip(submission.status)}</TableCell>
                    <TableCell>
                      {submission.review?.totalScore ? (
                        <Chip
                          label={submission.review.totalScore}
                          sx={{
                            backgroundColor: "#E8F5E9",
                            color: "#2E7D32",
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View & Review">
                        <IconButton
                          onClick={() => handleViewSubmission(submission._id)}
                          sx={{
                            color: "#005F73",
                            "&:hover": { backgroundColor: "#E0F7FA" },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#666" }}>
              Showing {submissions.length} of {total} submissions
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#005F73",
                },
                "& .Mui-selected": {
                  backgroundColor: "#005F73 !important",
                  color: "#FFF",
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
