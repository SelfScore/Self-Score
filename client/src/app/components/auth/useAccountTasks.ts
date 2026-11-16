"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { useAccountGate } from "./AccountGateProvider";

export type AccountTaskKey = "verify" | "profile" | "password";

export interface AccountTask {
  key: AccountTaskKey;
  label: string;
  description: string;
  run: () => void;
}

/**
 * Outstanding account to-dos for the signed-in user, used by the navbar dot,
 * the profile menu and the dashboard banner.
 */
export const useAccountTasks = (): AccountTask[] => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { openGate } = useAccountGate();

  if (!isAuthenticated || !user) return [];

  const tasks: AccountTask[] = [];
  if (!user.isVerified) {
    tasks.push({
      key: "verify",
      label: "Verify your email",
      description: "Needed before Level 4, consultations and payments.",
      run: () => void openGate(["verify"]),
    });
  }
  if (!user.isProfileComplete) {
    tasks.push({
      key: "profile",
      label: "Complete your profile",
      description: "Add your country, gender and age group.",
      run: () => void openGate(["profile"]),
    });
  }
  // Accounts from before passwords existed (Google-only accounts can add one too, but aren't nagged)
  if (user.hasPassword === false && !(user.authProviders || []).includes("google")) {
    tasks.push({
      key: "password",
      label: "Set a password",
      description: "So you can sign in without waiting for an email code.",
      run: () => router.push("/user/profile#password"),
    });
  }
  return tasks;
};
