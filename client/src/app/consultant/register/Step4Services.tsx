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
  Switch,
} from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import OutLineButton from "../../components/ui/OutLineButton";
import {
  consultantAuthService,
  Step4Data,
} from "../../../services/consultantAuthService";

interface Step4ServicesProps {
  consultantId: string;
  onComplete: (data: Omit<Step4Data, "consultantId">) => void;
  onPrevious: () => void;
  initialData?: Partial<Omit<Step4Data, "consultantId">>;
}

// Extended service type with price and isFree fields
interface ExtendedService {
  sessionType: "30min" | "60min" | "90min";
  duration: number;
  enabled: boolean;
  isFree: boolean;
  price: number;
}

const SESSION_TYPES: {
  type: "30min" | "60min" | "90min";
  duration: number;
  label: string;
  description: string;
  defaultPrice: number;
}[] = [
  {
    type: "30min",
    duration: 30,
    label: "Discovery Call (30 min)",
    description: "Quick introductory session to understand client needs",
    defaultPrice: 25,
  },
  {
    type: "60min",
    duration: 60,
    label: "Coaching Session (60 min)",
    description: "Standard one-on-one coaching session",
    defaultPrice: 75,
  },
  {
    type: "90min",
    duration: 90,
    label: "Intensive Session (90 min)",
    description: "Deep-dive coaching for complex goals",
    defaultPrice: 100,
  },
];

// Helper to extract YouTube video ID
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

export default function Step4Services({
  consultantId,
  onComplete,
  onPrevious,
  initialData,
}: Step4ServicesProps) {
  const [formData, setFormData] = useState<{
    services: ExtendedService[];
    introductionVideoLink: string;
  }>({
    services:
      (initialData?.services as ExtendedService[]) ||
      SESSION_TYPES.map((st) => ({
        sessionType: st.type,
        duration: st.duration,
        enabled: false,
        isFree: false,
        price: st.defaultPrice,
      })),
    introductionVideoLink: initialData?.introductionVideoLink || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Auto-save form data to sessionStorage whenever it changes
  useEffect(() => {
    // Only save if at least one service is configured
    const hasData =
      formData.services.some((s) => s.enabled) ||
      formData.introductionVideoLink;
    if (hasData) {
      sessionStorage.setItem("consultantStep4", JSON.stringify(formData));
    }
  }, [formData]);

  // Extract YouTube video info
  const youtubeVideoId = useMemo(
    () => extractYouTubeVideoId(formData.introductionVideoLink),
    [formData.introductionVideoLink]
  );

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

  const handleFreeToggle = (sessionType: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.sessionType === sessionType
          ? { ...service, isFree: !service.isFree }
          : service
      ),
    }));
  };

  const handlePriceChange = (sessionType: string, price: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.sessionType === sessionType ? { ...service, price } : service
      ),
    }));
    setErrors((prev) => ({ ...prev, [`price_${sessionType}`]: "" }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const enabledServices = formData.services.filter((s) => s.enabled);
    if (enabledServices.length === 0) {
      newErrors.services = "Please select at least one session type";
    }

    // Validate prices for paid services
    formData.services.forEach((service) => {
      if (service.enabled && !service.isFree && service.price <= 0) {
        newErrors[`price_${service.sessionType}`] =
          "Please enter a valid price";
      }
    });

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
      // Map services to the format expected by backend
      const servicesPayload = formData.services.map((s) => ({
        sessionType: s.sessionType,
        duration: s.duration,
        enabled: s.enabled,
        isFree: s.isFree,
        price: s.isFree ? 0 : s.price,
      }));

      const response = await consultantAuthService.completeRegistration({
        consultantId,
        hourlyRate: 0, // Deprecated, using per-service pricing
        services: servicesPayload as any,
        generalAvailability: "",
        introductionVideoLink: formData.introductionVideoLink,
      });

      if (response.success) {
        sessionStorage.removeItem("consultantStep1");
        sessionStorage.removeItem("consultantStep2");
        sessionStorage.removeItem("consultantStep3");
        sessionStorage.removeItem("consultantStep4");

        if (response.data?.consultant) {
          sessionStorage.setItem(
            "consultantData",
            JSON.stringify(response.data.consultant)
          );
        }

        setTimeout(() => {
          onComplete(formData as any);
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
        {/* Session Types with Individual Pricing */}
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
            Select the sessions you want to offer and set individual pricing
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {SESSION_TYPES.map((sessionType) => {
              const service = formData.services.find(
                (s) => s.sessionType === sessionType.type
              );
              const isEnabled = service?.enabled || false;
              const isFree = service?.isFree || false;
              const price = service?.price || sessionType.defaultPrice;

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
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Left side - Checkbox and label */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isEnabled}
                          onChange={() => handleServiceToggle(sessionType.type)}
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
                      sx={{ m: 0, flex: 1 }}
                    />

                    {/* Right side - Pricing controls (only when enabled) */}
                    {isEnabled && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          ml: 2,
                        }}
                      >
                        {/* Free/Paid Toggle */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: isFree ? "#4CAF50" : "#666",
                              fontWeight: isFree ? 600 : 400,
                            }}
                          >
                            Free
                          </Typography>
                          <Switch
                            checked={!isFree}
                            onChange={() => handleFreeToggle(sessionType.type)}
                            size="small"
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#005F73",
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  backgroundColor: "#005F73",
                                },
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: !isFree ? "#005F73" : "#666",
                              fontWeight: !isFree ? 600 : 400,
                            }}
                          >
                            Paid
                          </Typography>
                        </Box>

                        {/* Price Input (only when paid) */}
                        {!isFree && (
                          <TextField
                            type="number"
                            value={price}
                            onChange={(e) =>
                              handlePriceChange(
                                sessionType.type,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            error={!!errors[`price_${sessionType.type}`]}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            }}
                            inputProps={{ min: 0, step: 5 }}
                            sx={{
                              width: "120px",
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#FFF",
                                borderRadius: "8px",
                                height: "40px",
                                "& fieldset": {
                                  borderColor: errors[
                                    `price_${sessionType.type}`
                                  ]
                                    ? "#d32f2f"
                                    : "#3A3A3A4D",
                                },
                              },
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                  {errors[`price_${sessionType.type}`] && (
                    <Typography
                      sx={{
                        color: "#d32f2f",
                        fontSize: "12px",
                        mt: 1,
                        textAlign: "right",
                      }}
                    >
                      {errors[`price_${sessionType.type}`]}
                    </Typography>
                  )}
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
            placeholder="https://youtube.com/watch?v=..."
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
                backgroundColor: "#FFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              },
            }}
          />

          {/* YouTube Preview */}
          {youtubeVideoId && (
            <Paper
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#FFF",
                border: "1px solid #E0E0E0",
                borderRadius: "8px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  fontWeight: 600,
                  mb: 2,
                  color: "#1A1A1A",
                }}
              >
                Video Preview
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  component="img"
                  src={`https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  sx={{
                    width: 200,
                    height: 112,
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    YouTube Video
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "12px",
                      color: "#999",
                      mt: 0.5,
                    }}
                  >
                    Video ID: {youtubeVideoId}
                  </Typography>
                  <Typography
                    component="a"
                    href={formData.introductionVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#005F73",
                      textDecoration: "underline",
                      mt: 1,
                      display: "block",
                    }}
                  >
                    Watch on YouTube
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <OutLineButton
          onClick={onPrevious}
          sx={{ minWidth: "150px", height: "40px" }}
        >
          Previous
        </OutLineButton>
        <ButtonSelfScore
          text={loading ? "Submitting Application..." : "Next Step"}
          onClick={handleSubmit}
          disabled={loading}
          style={{ minWidth: "200px", height: "40px" }}
        />
      </Box>
    </Box>
  );
}
