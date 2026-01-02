import { Box, CircularProgress } from "@mui/material";

// Simple loading state for blogs page
export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#FFF",
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
