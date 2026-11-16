"use client";

import { Box, CircularProgress } from "@mui/material";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import AuthPageLayout from "../components/auth/AuthPageLayout";
import ProfileDetailsForm from "../components/auth/ProfileDetailsForm";
import { authCardSx, safeNextPath } from "../components/auth/authStyles";

/** Shown once right after sign-up: country, gender, age group — skippable */
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const { user, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(
        `/auth/signin?next=${encodeURIComponent(`/onboarding?next=${encodeURIComponent(next)}`)}`
      );
    }
  }, [isInitialized, isAuthenticated, router, next]);

  if (!isInitialized || !user) {
    return (
      <AuthPageLayout title="Tell us a little about you">
        <CircularProgress sx={{ color: "#FF5722" }} />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title={`Welcome, ${user.username.split(" ")[0]}!`}
      subtitle="A few details help us put your results in context. You can skip this for now — you'll need it before Level 4 or a consultation."
    >
      <Box sx={authCardSx}>
        <ProfileDetailsForm
          initial={{ country: user.country, gender: user.gender, ageGroup: user.ageGroup }}
          onSaved={() => router.replace(next)}
          onSkip={() => router.replace(next)}
          submitText="Continue"
        />
      </Box>
    </AuthPageLayout>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
