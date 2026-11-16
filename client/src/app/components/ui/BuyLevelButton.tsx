"use client";

import { CircularProgress } from "@mui/material";
import { useState } from "react";
import { paymentService } from "../../../services/paymentService";
import { getLevelPrice } from "../../../lib/stripe";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useAuth } from "../../../hooks/useAuth";
import { useAccountGate } from "../auth/AccountGateProvider";
import { store } from "../../../store";
import SignUpModal from "../../user/SignUpModal";
import ButtonSelfScore from "./ButtonSelfScore";

interface BuyLevelButtonProps {
  level: number;
  disabled?: boolean;
  fullWidth?: boolean;
}

// Simple button text - price shown separately in UI
const getButtonText = (): string => {
  return "Unlock with Premium";
};

export default function BuyLevelButton({
  level,
  disabled = false,
  fullWidth = false,
}: BuyLevelButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const price = getLevelPrice(level);

  const { ensureAccountReady } = useAccountGate();

  // Reads auth state from the store (not this render's closure) so it also
  // works right after signing in through the modal.
  const startCheckout = async () => {
    if (!store.getState().auth.isAuthenticated) {
      setShowSignUpModal(true);
      return;
    }

    // Payments need a verified email and a complete profile
    const ready = await ensureAccountReady({
      reason: "Before you unlock Level 4, please verify your email and complete your profile. It only takes a minute.",
    });
    if (!ready) return;

    setLoading(true);
    setError("");

    try {
      const response = await paymentService.createCheckoutSession(level);

      if (response.success && response.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        setError(response.message || "Failed to create checkout session");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      // EMAIL_UNVERIFIED / PROFILE_INCOMPLETE already open the gate modal
      const code = err.response?.data?.code;
      if (code !== "EMAIL_UNVERIFIED" && code !== "PROFILE_INCOMPLETE") {
        setError(err.response?.data?.message || "Failed to start purchase process");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      setShowSignUpModal(true);
      return;
    }
    void startCheckout();
  };

  if (!price) {
    return null;
  }

  const buttonText = getButtonText();

  return (
    <>
      {/* Sign Up Modal for non-authenticated users */}
      <SignUpModal
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSuccess={() => {
          setShowSignUpModal(false);
          // After sign up / sign in, continue to checkout
          void startCheckout();
        }}
      />

      <ButtonSelfScore
        text={
          loading ? "Processing..." : buttonText
        }
        startIcon={
          loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            <LockOpenIcon sx={{ color: "#FFF" }} />
          )
        }
        onClick={handlePurchase}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        background="#FF4F00"
        style={{
          opacity: disabled || loading ? 0.6 : 1,
          cursor: disabled || loading ? "not-allowed" : "pointer",
        }}
      />
      {error && (
        <div style={{ color: "red", fontSize: "14px", marginTop: "8px" }}>
          {error}
        </div>
      )}
    </>
  );
}
