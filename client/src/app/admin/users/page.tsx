"use client";

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
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Pagination,
  Menu,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Button,
} from "@mui/material";
import { useState, useEffect, Suspense } from "react";
import {
  adminService,
  AdminUser,
  UsersResponse,
} from "../../../services/adminService";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter, useSearchParams } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const GENDER_OPTIONS = [
  { value: "all", label: "All Genders" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const AGE_GROUP_OPTIONS = [
  { value: "all", label: "All Age Groups" },
  { value: "Under 18", label: "Under 18" },
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55+", label: "55+" },
];

function UsersListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial states from URL query params
  const initialPage = parseInt(searchParams.get("page") || "1") || 1;
  const initialLimit = parseInt(searchParams.get("limit") || "10") || 10;
  const initialSearch = searchParams.get("search") || "";
  const initialSortBy = (searchParams.get("sortBy") as "latest" | "oldest") || "latest";
  const initialFilter = (searchParams.get("filter") as "all" | "purchased" | "unpurchased") || "all";
  const initialStatus = (searchParams.get("status") as "all" | "active" | "pending") || "all";
  const initialGender = searchParams.get("gender") || "all";
  const initialAgeGroup = searchParams.get("ageGroup") || "all";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalUsers: 0,
    limit: initialLimit,
  });
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">(initialSortBy);
  const [filter, setFilter] = useState<"all" | "purchased" | "unpurchased">(initialFilter);
  const [status, setStatus] = useState<"all" | "active" | "pending">(initialStatus);
  const [gender, setGender] = useState(initialGender);
  const [ageGroup, setAgeGroup] = useState(initialAgeGroup);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [exporting, setExporting] = useState(false);

  // Update URL search parameters when state changes
  const updateUrlParams = (
    page: number,
    limit: number,
    searchVal: string,
    sortVal: string,
    filterVal: string,
    statusVal: string,
    genderVal: string,
    ageGroupVal: string
  ) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (limit !== 10) params.set("limit", limit.toString());
    if (searchVal) params.set("search", searchVal);
    if (sortVal !== "latest") params.set("sortBy", sortVal);
    if (filterVal !== "all") params.set("filter", filterVal);
    if (statusVal !== "all") params.set("status", statusVal);
    if (genderVal !== "all") params.set("gender", genderVal);
    if (ageGroupVal !== "all") params.set("ageGroup", ageGroupVal);

    const queryString = params.toString();
    const newUrl = `/admin/users${queryString ? `?${queryString}` : ""}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response: UsersResponse = await adminService.getUsers(
        pagination.currentPage,
        pagination.limit,
        search,
        sortBy,
        filter,
        status,
        gender,
        ageGroup
      );
      setUsers(response.users);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.pagination.totalPages,
        totalUsers: response.pagination.totalUsers,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateUrlParams(pagination.currentPage, pagination.limit, search, sortBy, filter, status, gender, ageGroup);
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.limit, search, sortBy, filter, status, gender, ageGroup]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPagination((prev) => ({ ...prev, currentPage: value }));
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: AdminUser
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleViewUser = () => {
    if (selectedUser) {
      router.push(`/admin/users/${selectedUser._id}`);
    }
    handleMenuClose();
  };

  const handleDeleteUser = async () => {
    if (
      selectedUser &&
      confirm(`Are you sure you want to delete ${selectedUser.username}?`)
    ) {
      try {
        await adminService.deleteUser(selectedUser._id);
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
    handleMenuClose();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPurchasedLevels = (user: AdminUser) => {
    const levels = [];
    if (user.purchasedLevels?.level2?.purchased) levels.push("2");
    if (user.purchasedLevels?.level3?.purchased) levels.push("3");
    if (user.purchasedLevels?.level4?.purchased) levels.push("4");
    return levels.length > 0 ? levels.join(", ") : "None";
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      // Fetch all users that match search and filters by setting the limit to totalUsers
      const response: UsersResponse = await adminService.getUsers(
        1,
        pagination.totalUsers || 10000,
        search,
        sortBy,
        filter,
        status,
        gender,
        ageGroup
      );

      const allUsers = response.users || [];

      // CSV Headers
      const headers = [
        "Username",
        "Email",
        "Phone Number",
        "Country",
        "Gender",
        "Age Group",
        "Registration Date",
        "Levels Completed",
        "Purchased Levels",
        "Last Active",
        "Status",
      ];

      // Format Rows
      const rows = allUsers.map((user) => [
        user.username,
        user.email,
        user.phoneNumber ? `+${user.countryCode || ""}${user.phoneNumber}` : "N/A",
        user.country || "N/A",
        user.gender || "N/A",
        user.ageGroup || "N/A",
        formatDate(user.createdAt),
        user.progress?.completedLevels?.length > 0
          ? user.progress.completedLevels.join(", ")
          : "None",
        getPurchasedLevels(user),
        formatDate(user.lastActive),
        user.isVerified ? "Active" : "Pending",
      ]);

      // Convert to CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      // Trigger file download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users:", error);
      alert("Failed to export users list");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      {/* Header with Title and Export Button */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
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
            Users Management
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#6B7280",
              mt: 0.5,
            }}
          >
            Manage all registered users
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          disabled={exporting}
          sx={{
            borderRadius: "12px",
            height: "40px",
            px: 3,
            backgroundColor: "#005F73",
            color: "#FFF",
            fontFamily: "Source Sans Pro",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "none",
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: "#004d5e",
              boxShadow: "none",
            },
          }}
        >
          {exporting ? "Exporting..." : "Export to Excel"}
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by email or username..."
          value={search}
          onChange={handleSearchChange}
          sx={{ flex: { xs: "1 1 100%", md: "1 1 220px" }, minWidth: "180px" }}
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

        <FormControl sx={{ minWidth: 130, flex: { xs: "1 1 auto", sm: "0 0 auto" } }}>
          <Select
            value={sortBy}
            onChange={(e: SelectChangeEvent) => {
              setSortBy(e.target.value as "latest" | "oldest");
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
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

        <FormControl sx={{ minWidth: 150, flex: { xs: "1 1 auto", sm: "0 0 auto" } }}>
          <Select
            value={filter}
            onChange={(e: SelectChangeEvent) => {
              setFilter(e.target.value as "all" | "purchased" | "unpurchased");
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            }}
          >
            <MenuItem value="all">All Purchases</MenuItem>
            <MenuItem value="purchased">Purchased</MenuItem>
            <MenuItem value="unpurchased">Unpurchased</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 130, flex: { xs: "1 1 auto", sm: "0 0 auto" } }}>
          <Select
            value={status}
            onChange={(e: SelectChangeEvent) => {
              setStatus(e.target.value as "all" | "active" | "pending");
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 140, flex: { xs: "1 1 auto", sm: "0 0 auto" } }}>
          <Select
            value={gender}
            onChange={(e: SelectChangeEvent) => {
              setGender(e.target.value);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            }}
          >
            {GENDER_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150, flex: { xs: "1 1 auto", sm: "0 0 auto" } }}>
          <Select
            value={ageGroup}
            onChange={(e: SelectChangeEvent) => {
              setAgeGroup(e.target.value);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            sx={{
              borderRadius: "12px",
              backgroundColor: "#FFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E0E0E0",
              },
            }}
          >
            {AGE_GROUP_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Users Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          border: "1px solid #E0E0E0",
          boxShadow: "none",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Username
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Country
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Gender
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Age Group
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Registration Date
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Levels Completed
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Purchased Levels
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Last Active
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Status
              </TableCell>
              <TableCell align="center" sx={{ whiteSpace: "nowrap" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#6B7280" }}>
                    Loading users...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#6B7280" }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  onClick={() => router.push(`/admin/users/${user._id}`)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#F9FAFB",
                    },
                  }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontWeight: 500,
                        color: "#2B2B2B",
                        fontSize: "14px",
                      }}
                    >
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        color: "#6B7280",
                        fontSize: "14px",
                      }}
                    >
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        color: "#6B7280",
                        fontSize: "14px",
                      }}
                    >
                      {user.country || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        color: "#6B7280",
                        fontSize: "14px",
                      }}
                    >
                      {user.gender || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        color: "#6B7280",
                        fontSize: "14px",
                      }}
                    >
                      {user.ageGroup || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        color: "#6B7280",
                        fontSize: "14px",
                      }}
                    >
                      {formatDate(user.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Chip
                      label={`${user.progress?.completedLevels?.length || 0}/4`}
                      size="small"
                      sx={{
                        backgroundColor: "#FF4F0010",
                        color: "#FF4F00",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        color: "#6B7280",
                        fontSize: "14px",
                      }}
                    >
                      {getPurchasedLevels(user)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        color: "#6B7280",
                        fontSize: "14px",
                      }}
                    >
                      {formatDate(user.lastActive)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {user.isVerified ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                        label="Active"
                        size="small"
                        sx={{
                          backgroundColor: "#51BB0010",
                          color: "#51BB00",
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<CancelIcon sx={{ fontSize: 16 }} />}
                        label="Pending"
                        size="small"
                        sx={{
                          backgroundColor: "#FFA50010",
                          color: "#FFA500",
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, user);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination & Limits */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mt: 4,
        }}
      >
        {/* Entries per page */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#6B7280",
            }}
          >
            Entries per page:
          </Typography>
          <FormControl size="small">
            <Select
              value={pagination.limit.toString()}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setPagination((prev) => ({
                  ...prev,
                  limit: newLimit,
                  currentPage: 1,
                }));
              }}
              sx={{
                borderRadius: "8px",
                backgroundColor: "#FFF",
                height: "32px",
                fontSize: "14px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E0E0E0",
                },
              }}
            >
              <MenuItem value="5">5</MenuItem>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
              <MenuItem value="100">100</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Pagination Controls */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                fontFamily: "Source Sans Pro",
              },
              "& .Mui-selected": {
                backgroundColor: "#FF4F00 !important",
                color: "#FFF",
              },
            }}
          />
        </Box>

        {/* Go to page input */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#6B7280",
            }}
          >
            Go to page:
          </Typography>
          <TextField
            size="small"
            type="number"
            inputProps={{ min: 1, max: pagination.totalPages }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (val >= 1 && val <= pagination.totalPages) {
                  setPagination((prev) => ({ ...prev, currentPage: val }));
                }
              }
            }}
            sx={{
              width: "70px",
              "& .MuiInputBase-root": {
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#FFF",
              },
            }}
          />
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid #E0E0E0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem
          onClick={handleViewUser}
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
          }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={handleDeleteUser}
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "14px",
            color: "#EF4444",
          }}
        >
          Delete User
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function AdminUsers() {
  return (
    <Suspense fallback={
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#FF4F00" }} />
      </Box>
    }>
      <UsersListContent />
    </Suspense>
  );
}
