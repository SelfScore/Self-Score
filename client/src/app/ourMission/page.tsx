import type { Metadata } from "next";
import HeroSection from "../components/ourMissionComponents/HeroSection";
import WhyWeBuild from "../components/ourMissionComponents/WhyWeBuild";
import JsonLd, { breadcrumbSchema } from "../components/seo/JsonLd";

export const metadata: Metadata = {
  // "| Self Score" is appended by the root title template
  title: "Our Mission: Transform Yourself, Transform the World",
  description:
    "Discover how improving the self leads to a peaceful, meaningful life and contributes to a better world.",
  keywords: [
    "self improvement mission",
    "self growth purpose",
    "personal development mission",
    "self awareness journey",
    "improve self world",
  ],
  openGraph: {
    title: "Our Mission | Self Score: Transform Yourself, Transform the World",
    description:
      "Discover how improving the self leads to a peaceful, meaningful life and contributes to a better world.",
    url: "https://www.selfscore.net/ourMission/",
  },
  alternates: {
    canonical: "https://www.selfscore.net/ourMission/",
  },
};

export default function OurMission() {
  return (
    <div>
      <JsonLd data={breadcrumbSchema([["Home", "/"], ["Our Mission", "/ourMission/"]])} />
      <HeroSection />
      <WhyWeBuild />
    </div>
  );
}

