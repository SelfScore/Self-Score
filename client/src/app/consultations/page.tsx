"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Pagination,
  SelectChangeEvent,
  Slider,
  //   Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
// import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/navigation";
import {
  consultantService,
  PublicConsultant,
} from "@/services/consultantService";
import { useAuth } from "@/hooks/useAuth";
import SignUpModal from "@/app/user/SignUpModal";

export default function ConsultationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [consultants, setConsultants] = useState<PublicConsultant[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<
    PublicConsultant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "priceAsc" | "priceDesc"
  >("nameAsc");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Filters
  const [locationFilter, setLocationFilter] = useState("");
  const [servicesFilter, setServicesFilter] = useState<string[]>([]);
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 150]);
  const [minRating, setMinRating] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    consultants,
    searchQuery,
    sortBy,
    locationFilter,
    servicesFilter,
    languageFilter,
    priceRange,
    minRating,
  ]);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getPublicConsultants();
      if (response.success && response.data) {
        setConsultants(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...consultants];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.coachingSpecialties.some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Location filter
    if (locationFilter.trim()) {
      filtered = filtered.filter((c) =>
        c.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Services filter
    if (servicesFilter.length > 0) {
      filtered = filtered.filter((c) =>
        servicesFilter.every((filter) =>
          c.services.some((s) => s.sessionType === filter && s.enabled)
        )
      );
    }

    // Language filter
    if (languageFilter.length > 0) {
      filtered = filtered.filter((c) =>
        languageFilter.some((lang) => c.languagesSpoken.includes(lang))
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (c) => c.hourlyRate >= priceRange[0] && c.hourlyRate <= priceRange[1]
    );

    // Rating filter (placeholder - using 4.8 as default rating)
    if (minRating > 0) {
      // For now, just show all consultants as placeholder
      // Later you can implement actual rating system
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nameAsc":
          return a.firstName.localeCompare(b.firstName);
        case "nameDesc":
          return b.firstName.localeCompare(a.firstName);
        case "priceAsc":
          return a.hourlyRate - b.hourlyRate;
        case "priceDesc":
          return b.hourlyRate - a.hourlyRate;
        default:
          return 0;
      }
    });

    setFilteredConsultants(filtered);
    setCurrentPage(1);
  };

  const handleConsultantClick = (consultantId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/consultations/${consultantId}`);
  };

  const handleBookClick = (e: React.MouseEvent, consultantId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/consultations/${consultantId}`);
  };

  const handleServiceFilterChange = (sessionType: string) => {
    setServicesFilter((prev) =>
      prev.includes(sessionType)
        ? prev.filter((s) => s !== sessionType)
        : [...prev, sessionType]
    );
  };

  const handleLanguageFilterChange = (language: string) => {
    setLanguageFilter((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
  };

  // Pagination
  const paginatedConsultants = filteredConsultants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredConsultants.length / itemsPerPage);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#005F73" }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#FFFFFF", pb: 6 }}>
        <Box sx={{ maxWidth: "87%", py: 8, mt: 8, mx: "auto" }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: { xs: "32px", md: "40px" },
                fontWeight: 700,
                color: "#1A1A1A",
                mb: 1,
              }}
            >
              Consultations
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "16px", md: "18px" },
                color: "#666",
              }}
            >
              Connect with certified wellness coaches who can guide you on your
              journey to better health and well-being
            </Typography>
          </Box>

          {/* Search and Sort */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              flexDirection: { xs: "column", md: "row" },
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#717182" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "0.1px solid #3A3A3A4D",
                  height: "48px",
                },
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={sortBy}
                onChange={(e: SelectChangeEvent) =>
                  setSortBy(e.target.value as any)
                }
                displayEmpty
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "#F7F7F7",
                  border: "0.1px solid #3A3A3A4D",
                  height: "48px",
                }}
              >
                <MenuItem value="nameAsc">Sort: A to Z</MenuItem>
                <MenuItem value="nameDesc">Sort: Z to A</MenuItem>
                <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                <MenuItem value="priceDesc">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* Filters Sidebar */}
            <Box sx={{ width: { xs: "100%", md: "300px" }, flexShrink: 0 }}>
              <Box
                sx={{
                  position: "sticky",
                  top: 100,
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  border: "0.8px solid #0000001A",
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1A1A1A",
                    mb: 3,
                  }}
                >
                  Filters
                </Typography>

                {/* Location */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      mb: 1,
                    }}
                  >
                    Location
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#F5F5F5",
                      },
                    }}
                  />
                </Box>

                {/* Services Offered */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      mb: 1,
                    }}
                  >
                    Services Offered
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={servicesFilter.includes("30min")}
                        onChange={() => handleServiceFilterChange("30min")}
                        sx={{ "&.Mui-checked": { color: "#005F73" } }}
                      />
                    }
                    label="30-minute call"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={servicesFilter.includes("60min")}
                        onChange={() => handleServiceFilterChange("60min")}
                        sx={{ "&.Mui-checked": { color: "#005F73" } }}
                      />
                    }
                    label="60-minute call"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={servicesFilter.includes("90min")}
                        onChange={() => handleServiceFilterChange("90min")}
                        sx={{ "&.Mui-checked": { color: "#005F73" } }}
                      />
                    }
                    label="90-minute call"
                  />
                </Box>

                {/* Language */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      mb: 1,
                    }}
                  >
                    Language
                  </Typography>
                  {["English (UK)", "Spanish", "Korean", "English (US)"].map(
                    (lang) => (
                      <FormControlLabel
                        key={lang}
                        control={
                          <Checkbox
                            checked={languageFilter.includes(lang)}
                            onChange={() => handleLanguageFilterChange(lang)}
                            sx={{ "&.Mui-checked": { color: "#005F73" } }}
                          />
                        }
                        label={lang}
                      />
                    )
                  )}
                </Box>

                {/* Price Range */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      mb: 1,
                    }}
                  >
                    Price Per Hour (${priceRange[0]} - ${priceRange[1]}+)
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) =>
                      setPriceRange(newValue as number[])
                    }
                    valueLabelDisplay="auto"
                    min={0}
                    max={150}
                    sx={{ color: "#005F73" }}
                  />
                </Box>

                {/* Minimum Rating */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      mb: 1,
                    }}
                  >
                    Minimum Rating
                  </Typography>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Box key={rating} sx={{ mb: 0.5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={minRating === rating}
                            onChange={() => setMinRating(rating)}
                            sx={{ "&.Mui-checked": { color: "#005F73" } }}
                          />
                        }
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {rating}
                            <StarIcon
                              sx={{ fontSize: "16px", color: "#FF9800" }}
                            />
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Consultants Grid */}
            <Box sx={{ flex: 1 }}>
              {paginatedConsultants.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "18px",
                      color: "#666",
                    }}
                  >
                    No consultants found matching your criteria
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                      },
                      gap: 3,
                    }}
                  >
                    {paginatedConsultants.map((consultant) => (
                      <Box key={consultant._id}>
                        <Card
                          sx={{
                            height: "100%",
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            borderRadius: "16px",
                            border: "0.8px solid #3A3A3A4D",
                          }}
                          onClick={() => handleConsultantClick(consultant._id)}
                        >
                          {/* Placeholder for rating badge */}
                          <Box
                            sx={{
                              position: "relative",
                              height: "220px",
                              backgroundColor: "#F0F0F0",
                              backgroundImage: consultant.profilePhoto
                                ? `url(${consultant.profilePhoto})`
                                : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <Chip
                              icon={
                                <StarIcon
                                  sx={{ fontSize: "16px", color: "#FFF" }}
                                />
                              }
                              label="4.8"
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                backgroundColor: "#FF9800",
                                color: "#FFF",
                                fontWeight: 600,
                                fontSize: "14px",
                              }}
                            />
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            {/* Languages */}
                            <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                              {consultant.languagesSpoken
                                .slice(0, 2)
                                .map((lang) => (
                                  <Chip
                                    key={lang}
                                    label={lang}
                                    size="small"
                                    sx={{
                                      backgroundColor: "#F5F5F5",
                                      fontSize: "12px",
                                      height: "24px",
                                    }}
                                  />
                                ))}
                            </Box>

                            {/* Name */}
                            <Typography
                              sx={{
                                fontFamily: "Faustina",
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#1A1A1A",
                                mb: 0.5,
                              }}
                            >
                              {consultant.firstName} {consultant.lastName}
                            </Typography>

                            {/* Location */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mb: 1,
                              }}
                            >
                              <LocationOnIcon
                                sx={{ fontSize: "16px", color: "#666" }}
                              />
                              <Typography
                                sx={{
                                  fontFamily: "Source Sans Pro",
                                  fontSize: "14px",
                                  color: "#666",
                                }}
                              >
                                {consultant.location}
                              </Typography>
                            </Box>

                            {/* Experience */}
                            <Typography
                              sx={{
                                fontFamily: "Source Sans Pro",
                                fontSize: "14px",
                                color: "#666",
                                mb: 1.5,
                              }}
                            >
                              {consultant.yearsOfExperience} years experience
                            </Typography>

                            {/* Price */}
                            <Typography
                              sx={{
                                fontFamily: "Source Sans Pro",
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#1A1A1A",
                                mb: 2,
                              }}
                            >
                              Starting at{" "}
                              <span style={{ color: "#005F73" }}>
                                ${consultant.hourlyRate}/hr
                              </span>
                            </Typography>

                            {/* Book Button */}
                            <Button
                              fullWidth
                              onClick={(e) =>
                                handleBookClick(e, consultant._id)
                              }
                              sx={{
                                backgroundColor: "#FF5722",
                                color: "#FFF",
                                fontFamily: "Source Sans Pro",
                                fontSize: "14px",
                                fontWeight: 600,
                                py: 1,
                                borderRadius: "8px",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "#E64A19",
                                },
                              }}
                            >
                              Book a Call
                            </Button>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            fontFamily: "Source Sans Pro",
                          },
                          "& .Mui-selected": {
                            backgroundColor: "#005F73 !important",
                            color: "#FFF",
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Login/Signup Modal */}
      <SignUpModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
