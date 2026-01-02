import { Box, CircularProgress } from "@mui/material";

// Simple loading state for individual blog page
export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
      }}
    >
      <CircularProgress
        size={50}
        sx={{
          color: "#FF5722",
        }}
      />
    </Box>
  );
}
