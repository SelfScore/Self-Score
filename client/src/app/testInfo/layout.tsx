import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Self Score Test | Personal Growth & Life Awareness Assessment",
    description:
        "Find your personal happiness score, inner peace level, and growth path with guided reflective questions designed for deep insight.",
    keywords: [
        "self score test",
        "personal growth assessment",
        "personality test",
        "happiness test",
        "self awareness score",
        "life score",
    ],
    openGraph: {
        title: "Self Score Test | Personal Growth & Life Awareness Assessment",
        description:
            "Find your personal happiness score, inner peace level, and growth path with guided reflective questions designed for deep insight.",
        url: "https://selfscore.net/testInfo/",
    },
    alternates: {
        canonical: "https://selfscore.net/testInfo/",
    },
};

export default function TestInfoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
