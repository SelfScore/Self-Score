import type { Metadata } from "next";
import ContactUs from "../components/landing/ContactUs";
import FAQ from "../components/landing/FAQ";

export const metadata: Metadata = {
  title: "Contact Self Score | Reach Out for Support & Questions",
  description:
    "Have questions about Self Score, assessments, or how to begin your self-discovery journey? Reach our support team today. We're here to help you.",
  keywords: [
    "contact self score",
    "self score support",
    "personal development contact",
    "self improvement help",
  ],
  openGraph: {
    title: "Contact Self Score | Reach Out for Support & Questions",
    description:
      "Have questions about Self Score, assessments, or how to begin your self-discovery journey? Reach our support team today.",
    url: "https://www.selfscore.net/contact/",
  },
  alternates: {
    canonical: "https://www.selfscore.net/contact/",
  },
};
export default function ContactUsPage() {
  return (
    <>
      <ContactUs />
      <FAQ />
    </>
  );
}
