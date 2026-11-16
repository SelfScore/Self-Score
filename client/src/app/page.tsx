import type { Metadata } from "next";
import AboutLevels from "./components/landing/AboutLevels";
import AboutUs from "./components/landing/AboutUs";
import Advantages from "./components/landing/Advantages";
import ContactUs from "./components/landing/ContactUs";
import FAQ from "./components/landing/FAQ";
import HeroSection from "./components/landing/HeroSection";
import OurMission from "./components/landing/OurMission";
import Testimonial from "./components/landing/Testimonial";
import JsonLd from "./components/seo/JsonLd";
import { faqData } from "./data/faqData";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.selfscore.net/" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function HomePage() {
  return (
    <main>
      <JsonLd data={faqSchema} />
      <HeroSection />
      <AboutLevels />
      <Advantages />
      <AboutUs />
      <OurMission />
      <Testimonial />
      <FAQ />
      <ContactUs />
    </main>
  );
}
