import type { Metadata } from "next";
import { Geist, Geist_Mono, Faustina, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../store/ReduxProvider";
import MainLayout from "./components/layout/MainLayout";
// import MuiProvider from "./MuiProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

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

// Base URL for the website
const baseUrl = "https://selfscore.net";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Self Score | Discover Your Happiness, Purpose & Self Awareness Test",
    template: "%s | Self Score",
  },
  description:
    "Explore your inner world with Self Score, a unique self-assessment for self-awareness, personal growth, happiness, and inner peace. Take the life score test and begin your journey today.",
  keywords: [
    "self score",
    "self assessment test",
    "self awareness",
    "personal growth",
    "happiness score",
    "life purpose test",
    "personality integration",
  ],
  authors: [{ name: "Self Score" }],
  creator: "Self Score",
  publisher: "Self Score",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Self Score",
    title: "Self Score | Discover Your Happiness, Purpose & Self Awareness Test",
    description:
      "Explore your inner world with Self Score, a unique self-assessment for self-awareness, personal growth, happiness, and inner peace.",
    images: [
      {
        url: "/images/logos/LogoWithText.png",
        width: 1200,
        height: 630,
        alt: "Self Score - Discover Your True Self",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Self Score | Discover Your Happiness, Purpose & Self Awareness Test",
    description:
      "Explore your inner world with Self Score, a unique self-assessment for self-awareness, personal growth, happiness, and inner peace.",
    images: ["/images/logos/LogoWithText.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: baseUrl,
  },
};

// Structured Data - Organization and WebSite schemas
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Self Score",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/logos/LogoWithText.png`,
      },
      description:
        "Self Score helps you discover your happiness, purpose, and self-awareness through unique assessments and personalized guidance.",
      // Add social media URLs here when available
      // sameAs: [
      //   "https://twitter.com/selfscore",
      //   "https://facebook.com/selfscore",
      //   "https://instagram.com/selfscore",
      //   "https://linkedin.com/company/selfscore",
      // ],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Self Score",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      description:
        "Discover your happiness, purpose, and self-awareness with Self Score assessments.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/blogs/?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${faustina.variable} ${spaceGrotesk.variable}`}
      >
        <ReduxProvider>
          {/* <MuiProvider> */}
          <AppRouterCacheProvider>
            <MainLayout>{children}</MainLayout>
          </AppRouterCacheProvider>

          {/* </MuiProvider> */}
        </ReduxProvider>
      </body>
    </html>
  );
}
