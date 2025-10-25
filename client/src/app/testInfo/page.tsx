"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import TestInfo from "./TestInfo";

function TestInfoContent() {
  const searchParams = useSearchParams();
  const level = parseInt(searchParams.get("level") || "1");

  // Convert to 0-based index for the component
  const initialLevel = level - 1;

  return <TestInfo initialLevel={initialLevel} />;
}

export default function TestInfoPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#FAFAFA",
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
      }
    >
      <TestInfoContent />
    </Suspense>
  );
}
