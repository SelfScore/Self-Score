import type { Metadata } from "next";
import HeroSection from "../components/ourMissionComponents/HeroSection";
import WhyWeBuild from "../components/ourMissionComponents/WhyWeBuild";

export const metadata: Metadata = {
  title: "Our Mission | Self Score: Transform Yourself, Transform the World",
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
    url: "https://selfscore.net/ourMission/",
  },
  alternates: {
    canonical: "https://selfscore.net/ourMission/",
  },
};

export default function OurMission() {
  return (
    <div>
      <HeroSection />
      <WhyWeBuild />
    </div>
  );
}

