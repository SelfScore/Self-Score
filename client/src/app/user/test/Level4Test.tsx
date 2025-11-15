"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import Level4TextTest from "./Level4TextTest";
import Level4VoiceTest from "./Level4VoiceTest";

type TestMode = "TEXT" | "VOICE" | null;

export default function Level4Test() {
  const searchParams = useSearchParams();
  const [selectedMode, setSelectedMode] = useState<TestMode>(null);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [targetMode, setTargetMode] = useState<"TEXT" | "VOICE" | null>(null);

  // ✅ Read mode from URL on mount
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam) {
      const mode = modeParam.toUpperCase();
      if (mode === "TEXT" || mode === "VOICE") {
        setSelectedMode(mode as TestMode);
        console.log(`🔄 Resuming Level 4 in ${mode} mode from URL`);
      }
    }
  }, [searchParams]);

  const handleSwitchMode = (newMode: "TEXT" | "VOICE") => {
    setTargetMode(newMode);
    setShowSwitchDialog(true);
  };

  const confirmSwitchMode = () => {
    if (targetMode) {
      setSelectedMode(targetMode);
      setShowSwitchDialog(false);
      setTargetMode(null);
    }
  };

  const cancelSwitchMode = () => {
    setShowSwitchDialog(false);
    setTargetMode(null);
  };

  if (selectedMode === "TEXT") {
    return (
      <>
        <Level4TextTest
          onBack={() => setSelectedMode(null)}
          onSwitchMode={() => handleSwitchMode("VOICE")}
        />

        {/* Switch Mode Confirmation Dialog */}
        <Dialog open={showSwitchDialog} onClose={cancelSwitchMode}>
          <DialogTitle sx={{ fontWeight: 600, color: "#005F73" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SwapHorizIcon />
              Switch to Voice Mode?
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              You are about to switch from Text Mode to Voice Mode.
            </Typography>
            <Typography sx={{ color: "#666", fontSize: "14px" }}>
              ✓ Your answered questions will be preserved
              <br />
              ✓ You'll continue with remaining questions in Voice Mode
              <br />✓ You can switch back anytime
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={cancelSwitchMode} sx={{ color: "#666" }}>
              Cancel
            </Button>
            <ButtonSelfScore
              text="Switch Mode"
              onClick={confirmSwitchMode}
              background="#E65100"
              padding="8px 24px"
              borderRadius="8px"
            />
          </DialogActions>
        </Dialog>
      </>
    );
  }

  if (selectedMode === "VOICE") {
    return (
      <>
        <Level4VoiceTest
          onBack={() => setSelectedMode(null)}
          onSwitchMode={() => handleSwitchMode("TEXT")}
        />

        {/* Switch Mode Confirmation Dialog */}
        <Dialog open={showSwitchDialog} onClose={cancelSwitchMode}>
          <DialogTitle sx={{ fontWeight: 600, color: "#E65100" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SwapHorizIcon />
              Switch to Text Mode?
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              You are about to switch from Voice Mode to Text Mode.
            </Typography>
            <Typography sx={{ color: "#666", fontSize: "14px" }}>
              ✓ Your answered questions will be preserved
              <br />
              ✓ You'll continue with remaining questions in Text Mode
              <br />✓ You can switch back anytime
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={cancelSwitchMode} sx={{ color: "#666" }}>
              Cancel
            </Button>
            <ButtonSelfScore
              text="Switch Mode"
              onClick={confirmSwitchMode}
              background="#005F73"
              padding="8px 24px"
              borderRadius="8px"
            />
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        p: 4,
      }}
    >
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            color: "#005F73",
            fontWeight: 700,
            mb: 2,
          }}
        >
          Level 4: Mastery Test
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#666",
            mb: 1,
          }}
        >
          Choose Your Test Mode
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#666",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          This comprehensive assessment evaluates your mastery of life
          management, emotional intelligence, and decision-making skills through
          subjective questions.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Text Mode Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: "100%",
              border: "2px solid #E0E0E0",
              borderRadius: "16px",
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                border: "2px solid #005F73",
                boxShadow: "0 8px 24px rgba(0, 95, 115, 0.15)",
                transform: "translateY(-4px)",
              },
            }}
            onClick={() => setSelectedMode("TEXT")}
          >
            <CardContent
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#E8F4F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <EditNoteIcon
                  sx={{
                    fontSize: 40,
                    color: "#005F73",
                  }}
                />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  color: "#005F73",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Text Mode
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mb: 3,
                  flexGrow: 1,
                }}
              >
                Type your answers to subjective questions at your own pace.
                Perfect for thoughtful, detailed responses.
              </Typography>

              <Box
                component="ul"
                sx={{
                  textAlign: "left",
                  color: "#666",
                  mb: 3,
                  pl: 2,
                }}
              >
                <li>8 comprehensive questions</li>
                <li>Write detailed responses</li>
                <li>Edit and refine your answers</li>
                <li>Save progress as you go</li>
              </Box>

              <ButtonSelfScore
                text="Start Text Test"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Voice Mode Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: "100%",
              border: "2px solid #E0E0E0",
              borderRadius: "16px",
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                border: "2px solid #005F73",
                boxShadow: "0 8px 24px rgba(0, 95, 115, 0.15)",
                transform: "translateY(-4px)",
              },
            }}
            onClick={() => setSelectedMode("VOICE")}
          >
            <CardContent
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#FFF3E0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <MicIcon
                  sx={{
                    fontSize: 40,
                    color: "#E65100",
                  }}
                />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  color: "#005F73",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Voice Mode
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mb: 3,
                  flexGrow: 1,
                }}
              >
                Have a conversation with our AI interviewer. More natural and
                interactive experience.
              </Typography>

              <Box
                component="ul"
                sx={{
                  textAlign: "left",
                  color: "#666",
                  mb: 3,
                  pl: 2,
                }}
              >
                <li>AI voice interview</li>
                <li>Natural conversation flow</li>
                <li>Real-time interaction</li>
                <li>Immediate feedback</li>
              </Box>

              <ButtonSelfScore
                text="Start Voice Interview"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #E65100 0%, #FF6F00 100%)",
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{
            color: "#999",
            fontStyle: "italic",
          }}
        >
          💡 Tip: Choose the mode that best suits your communication style. Both
          modes provide equally comprehensive assessment.
        </Typography>
      </Box>
    </Box>
  );
}
