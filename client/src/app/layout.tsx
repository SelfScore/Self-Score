import type { Metadata } from "next";
import { Geist, Geist_Mono, Faustina, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ReduxProvider } from "../store/ReduxProvider";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { Box } from "@mui/material";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const faustina = Faustina({
  variable: "--font-faustina",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Life Score - Transform Your Life",
  description:
    "Discover your potential and track your progress across all life dimensions with personalized life scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${faustina.variable} ${spaceGrotesk.variable}`}
      >
        <ReduxProvider>
          <AppRouterCacheProvider>
            <Box position={"relative"} minHeight="100vh">
              <Header />
              {children}
              <Footer />
            </Box>
          </AppRouterCacheProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
