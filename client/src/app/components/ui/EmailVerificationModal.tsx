import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import ButtonSelfScore from "./ButtonSelfScore";
import OutLineButton from "./OutLineButton";
import { Email, CheckCircle } from "@mui/icons-material";

interface EmailVerificationModalProps {
  open: boolean;
  newEmail: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
}

export default function EmailVerificationModal({
  open,
  newEmail,
  onClose,
  onVerify,
}: EmailVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onVerify(verificationCode);
      setVerificationCode("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVerificationCode("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #005F73 0%, #0A7A8F 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Email sx={{ color: "#fff", fontSize: "1.5rem" }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontFamily: "Faustina",
                color: "#1A1A1A",
              }}
            >
              Verify New Email
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontFamily: "Source Sans Pro",
              }}
            >
              Enter the code sent to your new email
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert
          severity="info"
          icon={<CheckCircle />}
          sx={{
            mb: 3,
            borderRadius: "12px",
            backgroundColor: "rgba(0, 95, 115, 0.08)",
            border: "1px solid rgba(0, 95, 115, 0.2)",
            fontFamily: "Source Sans Pro",
          }}
        >
          We've sent a 6-digit verification code to:
          <Typography
            component="div"
            sx={{
              fontWeight: 700,
              mt: 0.5,
              color: "#005F73",
            }}
          >
            {newEmail}
          </Typography>
        </Alert>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1,
            color: "#666",
            fontFamily: "Source Sans Pro",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Verification Code
        </Typography>

        <TextField
          fullWidth
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setVerificationCode(value);
            setError("");
          }}
          inputProps={{
            maxLength: 6,
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              letterSpacing: "0.5rem",
              fontWeight: 700,
              fontFamily: "Source Sans Pro",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#F8FAFB",
              "& fieldset": {
                borderColor: "rgba(0, 95, 115, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 95, 115, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#005F73",
                borderWidth: "2px",
              },
            },
          }}
        />

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              borderRadius: "12px",
              fontFamily: "Source Sans Pro",
            }}
          >
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <OutLineButton
          onClick={handleClose}
          disabled={loading}
          fullWidth
          sx={{
            height: "44px",
            fontFamily: "Source Sans Pro",
          }}
        >
          Cancel
        </OutLineButton>

        <ButtonSelfScore
          text={
            loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Verify Email"
            )
          }
          onClick={handleVerify}
          disabled={loading || verificationCode.length !== 6}
          fullWidth
          height={44}
          style={{
            borderRadius: "12px",
            fontFamily: "Source Sans Pro",
            opacity: loading || verificationCode.length !== 6 ? 0.6 : 1,
          }}
        />
      </DialogActions>
    </Dialog>
  );
}
