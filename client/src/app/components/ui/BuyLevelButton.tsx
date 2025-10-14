"use client";

import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { paymentService } from "../../../services/paymentService";
import { getLevelPrice, formatPrice } from "../../../lib/stripe";
import LockOpenIcon from "@mui/icons-material/LockOpen";

interface BuyLevelButtonProps {
  level: number;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "contained" | "outlined" | "text";
}

export default function BuyLevelButton({
  level,
  disabled = false,
  fullWidth = false,
  variant = "contained",
}: BuyLevelButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const price = getLevelPrice(level);

  const handlePurchase = async () => {
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

  return (
    <>
      <Button
        variant={variant}
        onClick={handlePurchase}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        startIcon={loading ? <CircularProgress size={20} /> : <LockOpenIcon />}
        sx={{
          bgcolor: variant === "contained" ? "#E87A42" : undefined,
          "&:hover": {
            bgcolor: variant === "contained" ? "#D16A35" : undefined,
          },
        }}
      >
        {loading
          ? "Processing..."
          : `Buy Level ${level} - ${formatPrice(price)}`}
      </Button>
      {error && (
        <div style={{ color: "red", fontSize: "14px", marginTop: "8px" }}>
          {error}
        </div>
      )}
    </>
  );
}
