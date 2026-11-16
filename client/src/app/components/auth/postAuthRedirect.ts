import type { UserData } from "../../../services/authService";
import { safeNextPath } from "./authStyles";

/**
 * Where to send someone right after they sign in / sign up.
 * New or never-onboarded users with an incomplete profile see the onboarding
 * step once (they can skip it); everyone else goes to `next` or the dashboard.
 */
export const getPostAuthPath = (user: UserData, next?: string | null): string => {
  const destination = safeNextPath(next);
  if (!user.isProfileComplete && !user.onboardingSkipped) {
    return `/onboarding?next=${encodeURIComponent(destination)}`;
  }
  return destination;
};
