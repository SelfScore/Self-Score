"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import ButtonSelfScore from "./ButtonSelfScore";
import OutLineButton from "./OutLineButton";

interface TestCardProps {
  level: number;
  levelName: string;
  status: "unlocked" | "locked" | "completed";
  isFree?: boolean;
  score?: number;
  maxScore?: number;
  onStartTest: () => void;
  onRetakeTest?: () => void;
  onUnlock?: () => void;
  // Level 4 pay-per-use specific props
  isPayPerUse?: boolean;
  remainingAttempts?: number;
  hasUsedAttempts?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({
  level,
  levelName,
  status,
  isFree = false,
  score,
  maxScore = 900,
  onStartTest,
  onRetakeTest,
  onUnlock,
  isPayPerUse = false,
  remainingAttempts = 0,
  hasUsedAttempts = false,
}) => {
  // Background colors based on status
  const getBackgroundColor = () => {
    if (status === "completed") return "#F0FFF6";
    if (status === "unlocked") return "#F0FFF6";
    return "#FFEBE4";
  };

  // Calculate percentage for circular progress
  // Score range is 0-900
  const percentage = score ? (score / maxScore) * 100 : 0;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "260px",
        height: "306px",
        borderRadius: "16px",
        padding: "24px",
        background: getBackgroundColor(),
        border:
          status === "completed" ? "2px solid #4BD17C" : "2px solid #FFD1C1",
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        position: "relative",
      }}
    >
      {/* Header with Level and Badge */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontWeight: 600,
            fontSize: "20px",
            color: "#111827",
          }}
        >
          Level {level}
        </Typography>

        {/* Badge */}
        {status === "unlocked" && isFree && (
          <Box
            sx={{
              backgroundColor: "transparent",
              color: "#16A34A",
              borderRadius: "12px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "Source Sans Pro",
            }}
          >
            FREE
          </Box>
        )}

        {status === "locked" && (
          <Box
            sx={{
              backgroundColor: "#FFFFFF66",
              border: "1px solid #3A3A3A4D",
              color: "#000000",
              borderRadius: "12px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "Source Sans Pro",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <LockIcon sx={{ fontSize: "14px" }} />
            Locked
          </Box>
        )}

        {status === "completed" && (
          <Box
            sx={{
              backgroundColor: "transparent",
              color: "#16A34A",
              borderRadius: "12px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "Source Sans Pro",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: "14px" }} />
            Completed
          </Box>
        )}
      </Box>

      {/* Icon or Score Circle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          my: 2,
        }}
      >
        {status === "completed" && score !== undefined ? (
          // Circular Progress for Completed
          <Box
            sx={{
              position: "relative",
              width: "120px",
              height: "120px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Background Circle */}
            <svg width="120" height="120" style={{ position: "absolute" }}>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray={`${(percentage / 100) * 314.16} 314.16`}
                strokeDashoffset="0"
                transform="rotate(-90 60 60)"
                strokeLinecap="round"
              />
            </svg>
            {/* Score Text */}
            <Box sx={{ textAlign: "center", zIndex: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 700,
                  fontSize: "24px",
                  color: "#1F2937",
                  lineHeight: 1,
                }}
              >
                {score}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontWeight: 400,
                  fontSize: "12px",
                  color: "#6B7280",
                  mt: 0.5,
                }}
              >
                out of {maxScore}
              </Typography>
            </Box>
          </Box>
        ) : (
          // Icon for Unlocked/Locked
          <Box
            sx={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "transparent",
              border: `8px solid ${status === "locked" ? "#E1D3CE" : "#A8FFC8"
                }`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {status === "locked" ? (
              <LockIcon sx={{ fontSize: "24px", color: "#9C9C9C" }} />
            ) : (
              <UnlockIcon sx={{ fontSize: "24px", color: "#00D54F" }} />
            )}
          </Box>
        )}
      </Box>

      {/* Level Name */}
      <Typography
        sx={{
          fontFamily: "Source Sans Pro",
          fontWeight: 400,
          fontSize: "14px",
          color: "#111827",
          textAlign: "center",
          mt: status === "completed" ? -1.5 : 0,
        }}
      >
        {levelName}
      </Typography>

      {/* Spacer to push button to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Action Button */}
      <Box sx={{ mt: 0, mb: 1 }}>
        {/* Pay-per-use Level 4: Show Buy Again when attempts are used (but NOT completed) */}
        {isPayPerUse && hasUsedAttempts && remainingAttempts === 0 && status !== "completed" && (
          <ButtonSelfScore
            text="Buy Again"
            fullWidth
            fontSize={"14px"}
            onClick={onUnlock}
          />
        )}

        {/* Pay-per-use Level 4: Show Start Test with attempts count when has attempts */}
        {isPayPerUse && remainingAttempts > 0 && status !== "completed" && (
          <ButtonSelfScore
            text={`Start Test (${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} left)`}
            fullWidth
            fontSize={"14px"}
            onClick={onStartTest}
          />
        )}

        {/* Non pay-per-use: Standard unlocked button */}
        {status === "unlocked" && !isPayPerUse && (
          <ButtonSelfScore
            text="Start Test"
            fullWidth
            fontSize={"14px"}
            onClick={onStartTest}
          />
        )}

        {/* Standard locked button (only for non pay-per-use or first purchase) */}
        {status === "locked" && (!isPayPerUse || (!hasUsedAttempts && remainingAttempts === 0)) && (
          <ButtonSelfScore
            text="Unlock with Premium"
            fullWidth
            fontSize={"14px"}
            onClick={onUnlock}
          />
        )}

        {/* Completed status: Show retake for non pay-per-use, or start if pay-per-use has attempts */}
        {status === "completed" && !isPayPerUse && (
          <OutLineButton
            fullWidth
            onClick={onRetakeTest}
            sx={{
              padding: "6.75px 14px",
              fontSize: "14px",
              borderRadius: "12px",
            }}
          >
            Retake Test
          </OutLineButton>
        )}

        {/* Completed + pay-per-use: Show Buy Again if no attempts, otherwise Start Test */}
        {status === "completed" && isPayPerUse && remainingAttempts === 0 && (
          <ButtonSelfScore
            text="Buy Again"
            fullWidth
            fontSize={"14px"}
            onClick={onUnlock}
          />
        )}

        {status === "completed" && isPayPerUse && remainingAttempts > 0 && (
          <ButtonSelfScore
            text={`Start Test `}
            fullWidth
            fontSize={"14px"}
            onClick={onStartTest}
          />
        )}
      </Box>
    </Box>
  );
};

export default TestCard;
