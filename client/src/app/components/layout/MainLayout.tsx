"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith("/admin");

  // For admin routes, don't render Header and Footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For regular routes, render with Header and Footer
  return (
    <Box position={"relative"} minHeight="100vh">
      <Header />
      {children}
      <Footer />
    </Box>
  );
}
