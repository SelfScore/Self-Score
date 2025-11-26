"use client";

import {
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  Paper,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import OutLineButton from "../../components/ui/OutLineButton";
import {
  consultantAuthService,
  Step4Data,
  Service,
} from "../../../services/consultantAuthService";

interface Step4ServicesProps {
  consultantId: string;
  onComplete: (data: Omit<Step4Data, "consultantId">) => void;
  onPrevious: () => void;
  initialData?: Partial<Omit<Step4Data, "consultantId">>;
}

const SESSION_TYPES: {
  type: "30min" | "60min" | "90min";
  duration: number;
  label: string;
  description: string;
}[] = [
  {
    type: "30min",
    duration: 30,
    label: "Individual Sessions (30 min)",
    description: "Quick check-in coaching sessions",
  },
  {
    type: "60min",
    duration: 60,
    label: "Individual Sessions (60 min)",
    description: "Standard one-on-one coaching sessions",
  },
  {
    type: "90min",
    duration: 90,
    label: "Individual Sessions (90 min)",
    description: "In-depth coaching sessions",
  },
];

export default function Step4Services({
  consultantId,
  onComplete,
  onPrevious,
  initialData,
}: Step4ServicesProps) {
  const [formData, setFormData] = useState({
    hourlyRate: initialData?.hourlyRate || 75,
    services:
      initialData?.services ||
      (SESSION_TYPES.map((st) => ({
        sessionType: st.type,
        duration: st.duration,
        enabled: false,
      })) as Service[]),
    generalAvailability: initialData?.generalAvailability || "",
    introductionVideoLink: initialData?.introductionVideoLink || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleServiceToggle = (sessionType: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.sessionType === sessionType
          ? { ...service, enabled: !service.enabled }
          : service
      ),
    }));
    if (errors.services) {
      setErrors((prev) => ({ ...prev, services: "" }));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.hourlyRate || formData.hourlyRate < 0) {
      newErrors.hourlyRate = "Please enter a valid hourly rate";
    } else if (formData.hourlyRate < 50) {
      newErrors.hourlyRate =
        "We recommend rates between $50-$150 per hour based on experience";
    }

    const enabledServices = formData.services.filter((s) => s.enabled);
    if (enabledServices.length === 0) {
      newErrors.services = "Please select at least one session type";
    }

    if (
      formData.introductionVideoLink &&
      !isValidUrl(formData.introductionVideoLink)
    ) {
      newErrors.introductionVideoLink =
        "Please enter a valid URL (YouTube or Vimeo)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await consultantAuthService.completeRegistration({
        consultantId,
        hourlyRate: formData.hourlyRate,
        services: formData.services,
        generalAvailability: formData.generalAvailability,
        introductionVideoLink: formData.introductionVideoLink,
      });

      if (response.success) {
        // Clear sessionStorage
        sessionStorage.removeItem("consultantStep1");
        sessionStorage.removeItem("consultantStep2");
        sessionStorage.removeItem("consultantStep3");
        sessionStorage.removeItem("consultantStep4");

        // Store consultant data in sessionStorage for dashboard
        if (response.data?.consultant) {
          sessionStorage.setItem(
            "consultantData",
            JSON.stringify(response.data.consultant)
          );
        }

        // Longer delay to ensure cookie is set before redirect
        setTimeout(() => {
          onComplete(formData);
        }, 1000);
      } else {
        setErrors({
          general: response.message || "Failed to complete registration",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "An error occurred";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Faustina",
          fontSize: "24px",
          fontWeight: 600,
          mb: 3,
          color: "#1A1A1A",
        }}
      >
        Service Details
      </Typography>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Hourly Rate */}
        <Grid size={{ xs: 12 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Hourly Rate (USD) <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="75"
            value={formData.hourlyRate}
            onChange={(e) =>
              handleInputChange("hourlyRate", parseFloat(e.target.value) || 0)
            }
            error={!!errors.hourlyRate}
            helperText={
              errors.hourlyRate ||
              "We recommend rates between $50-$150 per hour based on experience"
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            inputProps={{ min: 0, step: 5 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
          />
        </Grid>

        {/* Session Types */}
        <Grid size={{ xs: 12 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Session Types Offered <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "12px",
              color: "#666",
              mb: 2,
            }}
          >
            (Select all that apply)
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {SESSION_TYPES.map((sessionType) => {
              const service = formData.services.find(
                (s) => s.sessionType === sessionType.type
              );
              const isEnabled = service?.enabled || false;

              return (
                <Paper
                  key={sessionType.type}
                  sx={{
                    p: 2,
                    backgroundColor: isEnabled ? "#E8F4F8" : "#F5F5F5",
                    border: isEnabled
                      ? "2px solid #005F73"
                      : "1px solid #E0E0E0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#005F73",
                      backgroundColor: "#E8F4F8",
                    },
                  }}
                  onClick={() => handleServiceToggle(sessionType.type)}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isEnabled}
                        sx={{
                          color: "#005F73",
                          "&.Mui-checked": {
                            color: "#005F73",
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#1A1A1A",
                          }}
                        >
                          {sessionType.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          {sessionType.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: "100%", m: 0 }}
                  />
                </Paper>
              );
            })}
          </Box>

          {errors.services && (
            <Typography
              sx={{ color: "#d32f2f", fontSize: "12px", mt: 1, ml: 1.5 }}
            >
              {errors.services}
            </Typography>
          )}
        </Grid>

        {/* General Availability */}
        <Grid size={{ xs: 12 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            General Availability
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., Weekdays 9 AM - 5 PM EST, Some weekend availability"
            value={formData.generalAvailability}
            onChange={(e) =>
              handleInputChange("generalAvailability", e.target.value)
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
            helperText="You'll be able to set specific availability in your coach portal"
          />
        </Grid>

        {/* Introduction Video Link */}
        <Grid size={{ xs: 12 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Introduction Video Link (Optional)
          </Typography>
          <TextField
            fullWidth
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            value={formData.introductionVideoLink}
            onChange={(e) =>
              handleInputChange("introductionVideoLink", e.target.value)
            }
            error={!!errors.introductionVideoLink}
            helperText={
              errors.introductionVideoLink ||
              "A short video introducing yourself helps clients connect with you"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F5F5",
                borderRadius: "8px",
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <OutLineButton onClick={onPrevious} sx={{ minWidth: "150px" }}>
          Previous
        </OutLineButton>
        <ButtonSelfScore
          text={loading ? "Submitting Application..." : "Submit Application"}
          onClick={handleSubmit}
          disabled={loading}
          style={{ minWidth: "200px" }}
        />
      </Box>
    </Box>
  );
}
