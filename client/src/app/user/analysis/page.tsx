"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Box, Typography, CircularProgress } from "@mui/material";

export default function AnalysisPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to level-1 by default if no specific level is provided
    router.replace("/user/analysis/level-1");
  }, [router]);

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={50} sx={{ color: "#E87A42" }} />
        <Typography variant="h6" color="text.secondary">
          Loading your analysis...
        </Typography>
      </Box>
    </Container>
  );
}
