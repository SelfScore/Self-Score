import type { Metadata } from "next";
import PrivacyPolicy from "../components/landing/PrivacyPolicy";

// Own title/description/canonical (previously inherited the homepage canonical)
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Self Score collects, uses and protects your personal information and test responses, and the choices you have about your data.",
  openGraph: {
    title: "Privacy Policy | Self Score",
    description:
      "How Self Score collects, uses and protects your personal information and test responses, and the choices you have about your data.",
    url: "https://www.selfscore.net/privacy-policy/",
  },
  alternates: {
    canonical: "https://www.selfscore.net/privacy-policy/",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
