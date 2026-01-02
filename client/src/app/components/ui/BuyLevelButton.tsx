"use client";

import { CircularProgress } from "@mui/material";
import { useState } from "react";
import { paymentService } from "../../../services/paymentService";
import { getLevelPrice, formatPrice } from "../../../lib/stripe";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useAuth } from "../../../hooks/useAuth";
import SignUpModal from "../../user/SignUpModal";
import ButtonSelfScore from "./ButtonSelfScore";

interface BuyLevelButtonProps {
  level: number;
  disabled?: boolean;
  fullWidth?: boolean;
}

// Helper to get bundle text
const getBundleText = (level: number): string => {
  switch (level) {
    case 2:
      return "Unlock Level 2";
    case 3:
      return "Unlock Levels 2 & 3";
    case 4:
      return "Unlock Levels 2, 3 & 4";
    default:
      return `Unlock Level ${level}`;
  }
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

  const handlePurchase = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowSignUpModal(true);
      return;
    }

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
      setError(
        err.response?.data?.message || "Failed to start purchase process"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!price) {
    return null;
  }

  const bundleText = getBundleText(level);

  return (
    <>
      {/* Sign Up Modal for non-authenticated users */}
      <SignUpModal
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSuccess={() => {
          setShowSignUpModal(false);
          // After successful sign up/login, attempt purchase again
          handlePurchase();
        }}
      />

      <ButtonSelfScore
        text={
          loading ? "Processing..." : `${bundleText} - ${formatPrice(price)}`
        }
        startIcon={
          loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            <LockOpenIcon sx={{color:"#FFF"}}/>
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
