import type { Metadata } from "next";
import TermandConditions from "../components/landing/TermandConditions";

// Own title/description/canonical (previously inherited the homepage canonical)
export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply when you use Self Score, including accounts, assessments, payments and acceptable use.",
  openGraph: {
    title: "Terms & Conditions | Self Score",
    description:
      "The terms that apply when you use Self Score, including accounts, assessments, payments and acceptable use.",
    url: "https://www.selfscore.net/terms-conditions/",
  },
  alternates: {
    canonical: "https://www.selfscore.net/terms-conditions/",
  },
};

export default function TermsConditionsPage() {
  return <TermandConditions />;
}
