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
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  adminService,
  AdminUser,
  UsersResponse,
} from "../../../services/adminService";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [filter, setFilter] = useState<"all" | "purchased" | "unpurchased">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, search, sortBy, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response: UsersResponse = await adminService.getUsers(
        pagination.currentPage,
        10,
        search,
        sortBy,
        filter
      );
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search by email or username..."
          value={search}
          onChange={handleSearchChange}
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

        <FormControl sx={{ minWidth: 170 }}>
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
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="purchased">Purchased</MenuItem>
            <MenuItem value="unpurchased">Unpurchased</MenuItem>
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
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
              <TableCell
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 600,
                  color: "#6B7280",
                  fontSize: "14px",
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
                }}
              >
                Status
              </TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#6B7280" }}>
                    Loading users...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell align="center">
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

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
