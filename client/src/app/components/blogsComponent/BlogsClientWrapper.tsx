"use client";

import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import BlogCard from "./BlogCard";
import { BlogPost } from "../../../services/wordpressService";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import axios from "axios";

type ContentType = "blogs" | "newsletter";

interface BlogsClientWrapperProps {
  initialPosts?: BlogPost[];
  initialTotal?: number;
  initialHasMore?: boolean;
  initialType?: ContentType;
  // Backward compatibility prop if passed anywhere
  initialBlogs?: BlogPost[];
}

export default function BlogsClientWrapper({
  initialPosts = [],
  initialHasMore = false,
  initialType = "blogs",
  initialBlogs,
}: BlogsClientWrapperProps) {
  // Support either initialPosts or legacy initialBlogs prop
  const startingPosts = initialPosts.length > 0 ? initialPosts : (initialBlogs || []);
  
  const [activeTab, setActiveTab] = useState<ContentType>(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>(startingPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch posts helper (for tab switch or search query change)
  const fetchPosts = useCallback(
    async (type: ContentType, search: string, pageNum: number, append: boolean = false) => {
      // Abort any in-flight request to avoid race conditions
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingInitial(true);
      }

      try {
        const response = await axios.get("/api/blogs/", {
          params: {
            page: pageNum,
            perPage: 6,
            type,
            search: search || undefined,
          },
          signal: controller.signal,
        });

        const data = response.data;
        const newPosts: BlogPost[] = data.posts || [];

        setPosts((prevPosts) => {
          if (append) {
            // Deduplicate by id
            const existingIds = new Set(prevPosts.map((p) => p.id));
            const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id));
            return [...prevPosts, ...uniqueNewPosts];
          }
          return newPosts;
        });

        setHasMore(data.hasMore ?? false);
        setPage(pageNum);
      } catch (error: any) {
        if (axios.isCancel(error) || error.name === "CanceledError") {
          // Request was cancelled intentionally, do nothing
          return;
        }
        console.error("Error fetching posts:", error);
        if (!append) {
          setPosts([]);
          setHasMore(false);
        }
      } finally {
        setIsLoadingInitial(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Handle Tab or Search change
  useEffect(() => {
    // Skip initial mount if we already have starting SSR posts for "blogs" with no search
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (activeTab === "blogs" && debouncedSearch === "" && startingPosts.length > 0) {
        return;
      }
    }

    setPage(1);
    fetchPosts(activeTab, debouncedSearch, 1, false);
  }, [activeTab, debouncedSearch, fetchPosts, startingPosts.length]);

  // Handle Load More (Infinite scroll trigger)
  const handleLoadMore = useCallback(() => {
    if (isLoadingInitial || isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    fetchPosts(activeTab, debouncedSearch, nextPage, true);
  }, [isLoadingInitial, isLoadingMore, hasMore, page, activeTab, debouncedSearch, fetchPosts]);

  // Set up IntersectionObserver for the sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingInitial && !isLoadingMore) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "250px", // Trigger slightly before reaching the bottom for a seamless experience
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, hasMore, isLoadingInitial, isLoadingMore]);

  // Tab click handler
  const handleTabChange = (newTab: ContentType) => {
    if (activeTab === newTab) return;
    setActiveTab(newTab);
    setPage(1);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Category Chips Toggle (Blogs vs Newsletter) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <Chip
          icon={
            <ArticleOutlinedIcon
              sx={{
                fontSize: "18px !important",
                color: activeTab === "blogs" ? "#FFFFFF !important" : "#6B7280 !important",
              }}
            />
          }
          label="Blogs"
          clickable
          onClick={() => handleTabChange("blogs")}
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2.4, sm: 2.8 },
            borderRadius: "30px",
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "15px", sm: "16px" },
            fontWeight: activeTab === "blogs" ? 600 : 500,
            bgcolor: activeTab === "blogs" ? "#FF5722" : "#F3F4F6",
            color: activeTab === "blogs" ? "#FFFFFF" : "#4B5563",
            border: activeTab === "blogs" ? "1px solid #FF5722" : "1px solid #E5E7EB",
            boxShadow:
              activeTab === "blogs"
                ? "0 4px 12px rgba(255, 87, 34, 0.25)"
                : "none",
            transition: "all 0.25s ease",
            "&:hover": {
              bgcolor: activeTab === "blogs" ? "#E64A19" : "#E5E7EB",
              transform: "translateY(-1px)",
            },
          }}
        />

        <Chip
          icon={
            <MarkEmailReadOutlinedIcon
              sx={{
                fontSize: "18px !important",
                color:
                  activeTab === "newsletter"
                    ? "#FFFFFF !important"
                    : "#6B7280 !important",
              }}
            />
          }
          label="Newsletter"
          clickable
          onClick={() => handleTabChange("newsletter")}
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2.4, sm: 2.8 },
            borderRadius: "30px",
            fontFamily: "Source Sans Pro",
            fontSize: { xs: "15px", sm: "16px" },
            fontWeight: activeTab === "newsletter" ? 600 : 500,
            bgcolor: activeTab === "newsletter" ? "#FF5722" : "#F3F4F6",
            color: activeTab === "newsletter" ? "#FFFFFF" : "#4B5563",
            border:
              activeTab === "newsletter"
                ? "1px solid #FF5722"
                : "1px solid #E5E7EB",
            boxShadow:
              activeTab === "newsletter"
                ? "0 4px 12px rgba(255, 87, 34, 0.25)"
                : "none",
            transition: "all 0.25s ease",
            "&:hover": {
              bgcolor: activeTab === "newsletter" ? "#E64A19" : "#E5E7EB",
              transform: "translateY(-1px)",
            },
          }}
        />
      </Box>

      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: { xs: 4, md: 6 },
        }}
      >
        <TextField
          placeholder={
            activeTab === "newsletter"
              ? "Search newsletters..."
              : "Search articles..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9CA3AF" }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                  sx={{ color: "#9CA3AF" }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            width: "100%",
            maxWidth: "540px",
            "& .MuiOutlinedInput-root": {
              bgcolor: "#FFFFFF",
              borderRadius: "12px",
              height: "48px",
              "& fieldset": {
                borderColor: "#E5E7EB",
              },
              "&:hover fieldset": {
                borderColor: "#D1D5DB",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#FF5722",
                borderWidth: "1.5px",
              },
            },
            "& input": {
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
            },
          }}
        />
      </Box>

      {/* Initial Loading Spinner */}
      {isLoadingInitial ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
          }}
        >
          <CircularProgress size={44} sx={{ color: "#FF5722" }} />
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              color: "#6B7280",
            }}
          >
            Loading {activeTab === "newsletter" ? "newsletters" : "articles"}...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Blog / Newsletter Cards Grid */}
          {posts.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: { xs: 3, md: 4 },
                mb: { xs: 4, md: 5 },
              }}
            >
              {posts.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </Box>
          )}

          {/* Empty State */}
          {posts.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 6, md: 10 },
                px: 2,
                bgcolor: "#F9FAFB",
                borderRadius: "16px",
                border: "1px dashed #E5E7EB",
                maxWidth: "600px",
                mx: "auto",
                mb: 6,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Faustina",
                  fontSize: { xs: "22px", md: "26px" },
                  fontWeight: 600,
                  color: "#1F2937",
                  mb: 1,
                }}
              >
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : activeTab === "newsletter"
                  ? "No newsletters available yet"
                  : "No articles found"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "15px",
                  color: "#6B7280",
                  mb: 3,
                }}
              >
                {searchQuery
                  ? "Try searching for a different keyword or topic."
                  : activeTab === "newsletter"
                  ? "We will be publishing insightful newsletters soon. Stay tuned!"
                  : "Check back later for new updates and insights."}
              </Typography>

              {searchQuery ? (
                <Button
                  variant="outlined"
                  onClick={() => setSearchQuery("")}
                  sx={{
                    fontFamily: "Source Sans Pro",
                    textTransform: "none",
                    borderColor: "#FF5722",
                    color: "#FF5722",
                    borderRadius: "8px",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#E64A19",
                      bgcolor: "rgba(255, 87, 34, 0.04)",
                    },
                  }}
                >
                  Clear Search
                </Button>
              ) : activeTab === "newsletter" ? (
                <Button
                  variant="contained"
                  onClick={() => handleTabChange("blogs")}
                  sx={{
                    fontFamily: "Source Sans Pro",
                    textTransform: "none",
                    bgcolor: "#FF5722",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "#E64A19",
                    },
                  }}
                >
                  Explore Blogs
                </Button>
              ) : null}
            </Box>
          )}

          {/* Infinite Scroll Bottom Loading Indicator */}
          {isLoadingMore && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                gap: 1.5,
              }}
            >
              <CircularProgress size={32} sx={{ color: "#FF5722" }} />
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#6B7280",
                }}
              >
                Loading more...
              </Typography>
            </Box>
          )}

          {/* End of content notice */}
          {!hasMore && posts.length > 0 && !isLoadingMore && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#9CA3AF",
                  letterSpacing: "0.5px",
                }}
              >
                — You have viewed all {activeTab === "newsletter" ? "newsletters" : "articles"} —
              </Typography>
            </Box>
          )}

          {/* Infinite Scroll Sentinel (Invisible target to trigger next page) */}
          <Box
            ref={sentinelRef}
            sx={{
              height: "20px",
              width: "100%",
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </Box>
  );
}
