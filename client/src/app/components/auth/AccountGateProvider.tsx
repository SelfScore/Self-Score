"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { store } from "../../../store";
import { authService } from "../../../services/authService";
import { ACCOUNT_GATE_EVENT } from "../../../lib/api";
import AccountGateModal, { GateStep } from "./AccountGateModal";

interface AccountGateContextValue {
  /**
   * Resolves true when the signed-in user has a verified email and a complete
   * profile — opening the gate modal first if needed. Resolves false if the
   * user closes the modal, or isn't signed in (callers handle sign-in).
   */
  ensureAccountReady: (options?: { reason?: string }) => Promise<boolean>;
  /** Open specific steps (e.g. from the reminder banner) */
  openGate: (steps: GateStep[], options?: { reason?: string }) => Promise<boolean>;
}

const AccountGateContext = createContext<AccountGateContextValue | null>(null);

const missingSteps = (): GateStep[] => {
  const user = store.getState().auth.user;
  if (!user) return [];
  const steps: GateStep[] = [];
  if (!user.isVerified) steps.push("verify");
  if (!user.isProfileComplete) steps.push("profile");
  return steps;
};

export function AccountGateProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<GateStep[] | null>(null);
  const [reason, setReason] = useState<string | undefined>();
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const open = useCallback((nextSteps: GateStep[], options?: { reason?: string }) => {
    return new Promise<boolean>((resolve) => {
      // Only one gate at a time: settle any previous caller as cancelled
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setReason(options?.reason);
      setSteps(nextSteps);
    });
  }, []);

  const ensureAccountReady = useCallback(
    async (options?: { reason?: string }) => {
      if (!store.getState().auth.isAuthenticated) return false;
      const needed = missingSteps();
      if (needed.length === 0) return true;
      return open(needed, options);
    },
    [open]
  );

  const finish = useCallback((ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setSteps(null);
  }, []);

  // The server rejected a request with EMAIL_UNVERIFIED / PROFILE_INCOMPLETE:
  // refresh our copy of the user (it may be stale) and open the gate.
  useEffect(() => {
    const handler = async () => {
      if (resolverRef.current) return; // already open
      await authService.getCurrentUser();
      const needed = missingSteps();
      if (needed.length > 0) void open(needed);
    };
    window.addEventListener(ACCOUNT_GATE_EVENT, handler);
    return () => window.removeEventListener(ACCOUNT_GATE_EVENT, handler);
  }, [open]);

  return (
    <AccountGateContext.Provider value={{ ensureAccountReady, openGate: open }}>
      {children}
      {steps && steps.length > 0 && (
        <AccountGateModal
          open
          steps={steps}
          reason={reason}
          onDone={() => finish(true)}
          onClose={() => finish(false)}
        />
      )}
    </AccountGateContext.Provider>
  );
}

export const useAccountGate = (): AccountGateContextValue => {
  const ctx = useContext(AccountGateContext);
  if (!ctx) throw new Error("useAccountGate must be used inside AccountGateProvider");
  return ctx;
};
