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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import {
  level4ReviewService,
  Level4Submission,
} from "@/services/level4ReviewService";

export default function Level4SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Level4Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await level4ReviewService.getAllSubmissions(
        page,
        limit,
        search
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
  }, [page, search]);

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
    router.push(`/admin/level4-submissions/${interviewId}`);
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
          Level 4 Submissions
        </Typography>
        <Typography variant="body1" sx={{ color: "#666" }}>
          Review and evaluate user submissions for Level 4 Mastery Test
        </Typography>
      </Box>

      {/* Search and Stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearchChange}
          sx={{
            minWidth: "300px",
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#666" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Total Submissions: <strong>{total}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
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
      ) : submissions.length === 0 ? (
        /* Empty State */
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: "#F9F9F9",
            borderRadius: "12px",
          }}
        >
          <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
            No submissions found
          </Typography>
          <Typography variant="body2" sx={{ color: "#999" }}>
            {search
              ? "Try adjusting your search criteria"
              : "No Level 4 submissions yet"}
          </Typography>
        </Paper>
      ) : (
        /* Table */
        <>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#005F73" }}>
                    User Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#005F73" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#005F73" }}>
                    Attempt #
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#005F73" }}>
                    Mode
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#005F73" }}>
                    Submitted At
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#005F73" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#005F73" }}>
                    Score
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "#005F73" }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission._id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#F9F9F9",
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => handleViewSubmission(submission._id)}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {submission.user.username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: "#666", fontSize: "14px" }}>
                        {submission.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`#${submission.attemptNumber}`}
                        size="small"
                        sx={{ backgroundColor: "#E0F2F1", color: "#00695C" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.mode}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: "#005F73", color: "#005F73" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "14px", color: "#666" }}>
                        {formatDate(submission.submittedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(submission.status)}</TableCell>
                    <TableCell>
                      {submission.review ? (
                        <Typography sx={{ fontWeight: 600, color: "#005F73" }}>
                          {submission.review.totalScore}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: "#999" }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip
                        title={
                          submission.status === "PENDING_REVIEW"
                            ? "Review Submission"
                            : "View Review"
                        }
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSubmission(submission._id);
                          }}
                          sx={{
                            color: "#005F73",
                            "&:hover": { backgroundColor: "#E0F2F1" },
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
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#005F73",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#005F73 !important",
                    color: "#fff",
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
