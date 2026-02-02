import type { Metadata } from "next";

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
        url: "https://selfscore.net/consultations/",
    },
    alternates: {
        canonical: "https://selfscore.net/consultations/",
    },
};

export default function ConsultationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
