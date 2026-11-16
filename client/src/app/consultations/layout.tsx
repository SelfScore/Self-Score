import type { Metadata } from "next";
import { notFound } from "next/navigation";

// "Talk to Us" / consultations is hidden for now. Set to true to bring the pages back
// (and uncomment the links in Header.tsx, sitemap.ts, user/dashboard and user/bookings).
const CONSULTATIONS_ENABLED = false;

export const metadata: Metadata = {
    title: "Consultation | Personal Growth & Self Awareness Guidance",
    description:
        "Book a personalised consultation for deeper insight into your life goals. Get supportive guidance for self-reflection, inner balance, life purpose, and happiness.",
    keywords: [
        "self score consultation",
        "personal growth coaching",
        "self awareness guidance",
        "life purpose consultation",
    ],
    openGraph: {
        title: "Consultation | Personal Growth & Self Awareness Guidance",
        description:
            "Book a personalised consultation for deeper insight into your life goals. Get supportive guidance for self-reflection, inner balance, life purpose, and happiness.",
        url: "https://www.selfscore.net/consultations/",
    },
    alternates: {
        canonical: "https://www.selfscore.net/consultations/",
    },
};

export default function ConsultationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    if (!CONSULTATIONS_ENABLED) notFound();
    return <>{children}</>;
}
