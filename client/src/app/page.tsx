import AboutLevels from "./components/landing/AboutLevels";
import AboutUs from "./components/landing/AboutUs";
import Advantages from "./components/landing/Advantages";
import ContactUs from "./components/landing/ContactUs";
import FAQ from "./components/landing/FAQ";
import HeroSection from "./components/landing/HeroSection";
import OurMission from "./components/landing/OurMission";
import Testimonial from "./components/landing/Testimonial";

export default function HomePage() {
  return (
    <main>
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
