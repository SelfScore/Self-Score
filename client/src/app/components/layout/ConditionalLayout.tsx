"use client";

import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Admin routes don't need header/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Regular routes get header and footer
  return (
    <Box position={"relative"} minHeight="100vh">
      <Header />
      {children}
      <Footer />
    </Box>
  );
}
