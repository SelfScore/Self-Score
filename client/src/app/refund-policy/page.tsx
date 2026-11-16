import type { Metadata } from "next";
import RefundPolicy from "../components/landing/RefundPolicy";

// Own title/description/canonical (previously inherited the homepage canonical)
export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "When and how you can request a refund for Self Score level purchases and consultations, and how long refunds take.",
  openGraph: {
    title: "Refund Policy | Self Score",
    description:
      "When and how you can request a refund for Self Score level purchases and consultations, and how long refunds take.",
    url: "https://www.selfscore.net/refund-policy/",
  },
  alternates: {
    canonical: "https://www.selfscore.net/refund-policy/",
  },
};

export default function RefundPolicyPage() {
  return <RefundPolicy />;
}
