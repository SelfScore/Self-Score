"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function ConsultantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchConsultants();
  }, [statusFilter]);

  useEffect(() => {
    // Filter consultants based on search query
    if (searchQuery.trim() === "") {
      setFilteredConsultants(consultants);
    } else {
      const filtered = consultants.filter(
        (consultant) =>
          consultant.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          consultant.lastName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          consultant.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConsultants(filtered);
    }
  }, [searchQuery, consultants]);

  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const response = await adminService.getConsultants(
        statusFilter,
        "",
        "appliedAt",
        "desc"
      );
      setConsultants(response.consultants);
      setFilteredConsultants(response.consultants);
      setCounts(response.counts);
    } catch (error) {
      console.error("Failed to fetch consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#FFF3E0", color: "#FF9800" };
      case "approved":
        return { bg: "#E8F5E9", color: "#4CAF50" };
      case "rejected":
        return { bg: "#FFEBEE", color: "#F44336" };
      default:
        return { bg: "#F5F5F5", color: "#999" };
    }
  };

  const handleViewDetails = (consultantId: string) => {
    router.push(`/admin/consultants/${consultantId}`);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Faustina",
            fontSize: "32px",
            fontWeight: 700,
            color: "#1A1A1A",
            mb: 1,
          }}
        >
          Consultant Management
        </Typography>
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "16px",
            color: "#666",
          }}
        >
          Review and manage wellness coach applications
        </Typography>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{ mb: 3, borderRadius: "12px", border: "1px solid #E0E0E0" }}
      >
        <Box sx={{ borderBottom: "1px solid #E0E0E0" }}>
          <Tabs
            value={statusFilter}
            onChange={(_e, newValue) => setStatusFilter(newValue)}
            sx={{
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontFamily: "Source Sans Pro",
                fontSize: "15px",
                fontWeight: 600,
              },
            }}
          >
            <Tab label={`All (${counts.all})`} value="all" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Pending
                  {counts.pending > 0 && (
                    <Chip
                      label={counts.pending}
                      size="small"
                      sx={{
                        backgroundColor: "#FF9800",
                        color: "white",
                        height: "20px",
                        fontSize: "12px",
                      }}
                    />
                  )}
                </Box>
              }
              value="pending"
            />
            <Tab label={`Approved (${counts.approved})`} value="approved" />
            <Tab label={`Rejected (${counts.rejected})`} value="rejected" />
          </Tabs>
        </Box>

        {/* Search */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{ borderRadius: "12px", border: "1px solid #E0E0E0" }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#FF4F00" }} />
          </Box>
        ) : filteredConsultants.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "16px",
                color: "#999",
              }}
            >
              {searchQuery
                ? "No consultants found matching your search"
                : "No consultants found"}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                  <TableCell
                    sx={{ fontWeight: 600, fontFamily: "Source Sans Pro" }}
                  >
                    Consultant
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontFamily: "Source Sans Pro" }}
                  >
                    Contact
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontFamily: "Source Sans Pro" }}
                  >
                    Specialties
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontFamily: "Source Sans Pro" }}
                  >
                    Experience
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontFamily: "Source Sans Pro" }}
                  >
                    Applied On
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontFamily: "Source Sans Pro" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontFamily: "Source Sans Pro" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConsultants.map((consultant) => {
                  const statusColors = getStatusColor(
                    consultant.applicationStatus
                  );
                  return (
                    <TableRow
                      key={consultant._id}
                      sx={{
                        "&:hover": { backgroundColor: "#F9FAFB" },
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewDetails(consultant._id)}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            src={consultant.profilePhoto}
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: "#E87A42",
                            }}
                          >
                            {consultant.firstName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: "Source Sans Pro",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#1A1A1A",
                              }}
                            >
                              {consultant.firstName} {consultant.lastName}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "Source Sans Pro",
                                fontSize: "12px",
                                color: "#666",
                              }}
                            >
                              {consultant.location}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "13px",
                            color: "#666",
                          }}
                        >
                          {consultant.email}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "12px",
                            color: "#999",
                          }}
                        >
                          {consultant.countryCode} {consultant.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            maxWidth: 200,
                          }}
                        >
                          {consultant.coachingSpecialties
                            ?.slice(0, 2)
                            .map((specialty: string) => (
                              <Chip
                                key={specialty}
                                label={specialty}
                                size="small"
                                sx={{
                                  fontSize: "11px",
                                  height: "22px",
                                  backgroundColor: "#E8F4F8",
                                  color: "#005F73",
                                }}
                              />
                            ))}
                          {consultant.coachingSpecialties?.length > 2 && (
                            <Chip
                              label={`+${
                                consultant.coachingSpecialties.length - 2
                              }`}
                              size="small"
                              sx={{
                                fontSize: "11px",
                                height: "22px",
                                backgroundColor: "#F5F5F5",
                                color: "#666",
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "13px",
                            color: "#666",
                          }}
                        >
                          {consultant.yearsOfExperience} years
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "13px",
                            color: "#666",
                          }}
                        >
                          {new Date(
                            consultant.appliedAt || consultant.createdAt
                          ).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={consultant.applicationStatus.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.color,
                            fontWeight: 600,
                            fontSize: "12px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(consultant._id);
                            }}
                            sx={{
                              color: "#005F73",
                              "&:hover": { backgroundColor: "#E8F4F8" },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}
