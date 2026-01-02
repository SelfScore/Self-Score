"use client";

import {
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  Chip,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import OutLineButton from "../../components/ui/OutLineButton";
import {
  consultantAuthService,
  Step2Data,
} from "../../../services/consultantAuthService";

interface Step2ProfessionalProps {
  consultantId: string;
  onNext: (data: Omit<Step2Data, "consultantId">) => void;
  onPrevious: () => void;
  initialData?: Partial<Omit<Step2Data, "consultantId">>;
}

const COACHING_SPECIALTIES = [
  "Life & Career Coaching",
  "Wellness & Nutrition",
  "Mindfulness & Meditation",
  "Stress Management",
  "Relationship Coaching",
  "Executive & Leadership",
  "Fitness & Exercise",
  "Sleep & Recovery",
  "Mental Health Support",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Japanese",
  "Korean",
  "Portuguese",
  "Italian",
  "Arabic",
  "Hindi",
  "Russian",
];

export default function Step2Professional({
  consultantId,
  onNext,
  onPrevious,
  initialData,
}: Step2ProfessionalProps) {
  const [formData, setFormData] = useState({
    coachingSpecialties: initialData?.coachingSpecialties || [],
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    professionalBio: initialData?.professionalBio || "",
    languagesSpoken: initialData?.languagesSpoken || [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSpecialtiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      coachingSpecialties: typeof value === "string" ? value.split(",") : value,
    }));
    if (errors.coachingSpecialties) {
      setErrors((prev) => ({ ...prev, coachingSpecialties: "" }));
    }
  };

  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      languagesSpoken: typeof value === "string" ? value.split(",") : value,
    }));
    if (errors.languagesSpoken) {
      setErrors((prev) => ({ ...prev, languagesSpoken: "" }));
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

    if (formData.coachingSpecialties.length === 0) {
      newErrors.coachingSpecialties =
        "Please select at least one coaching specialty";
    }

    if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = "Please enter valid years of experience";
    }

    if (!formData.professionalBio.trim()) {
      newErrors.professionalBio = "Professional bio is required";
    } else if (formData.professionalBio.length > 250) {
      newErrors.professionalBio =
        "Professional bio cannot exceed 250 characters";
    }

    if (formData.languagesSpoken.length === 0) {
      newErrors.languagesSpoken = "Please select at least one language";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await consultantAuthService.updateProfessionalInfo({
        consultantId,
        ...formData,
      });

      if (response.success) {
        // Save to sessionStorage for resume capability
        sessionStorage.setItem("consultantStep2", JSON.stringify(formData));
        onNext(formData);
      } else {
        setErrors({
          general:
            response.message || "Failed to save professional information",
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
        Professional Information
      </Typography>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Coaching Specialties */}
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
            Coaching Specialties <span style={{ color: "#E87A42" }}>*</span>{" "}
            <span style={{ fontWeight: 400, fontSize: "12px", color: "#666" }}>
              (Select all that apply)
            </span>
          </Typography>
          <FormControl fullWidth error={!!errors.coachingSpecialties}>
            <Select
              multiple
              value={formData.coachingSpecialties}
              onChange={handleSpecialtiesChange}
              input={<OutlinedInput />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        backgroundColor: "#005F73",
                        color: "white",
                        fontFamily: "Source Sans Pro",
                      }}
                    />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 220,
                  },
                },
                disableScrollLock: true,
              }}
              sx={{
                backgroundColor: "#FFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              }}
            >
              {COACHING_SPECIALTIES.map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.coachingSpecialties && (
            <Typography
              sx={{ color: "#d32f2f", fontSize: "12px", mt: 0.5, ml: 1.5 }}
            >
              {errors.coachingSpecialties}
            </Typography>
          )}
        </Grid>

        {/* Years of Experience */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Years of Experience <span style={{ color: "#E87A42" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="Enter years of experience"
            value={formData.yearsOfExperience || ""}
            onChange={(e) =>
              handleInputChange(
                "yearsOfExperience",
                parseInt(e.target.value) || 0
              )
            }
            error={!!errors.yearsOfExperience}
            helperText={errors.yearsOfExperience}
            inputProps={{ min: 0, max: 50 }}
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
        </Grid>

        {/* Languages Spoken */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              fontWeight: 600,
              mb: 1,
              color: "#1A1A1A",
            }}
          >
            Languages Spoken <span style={{ color: "#E87A42" }}>*</span>{" "}
            <span style={{ fontWeight: 400, fontSize: "12px", color: "#666" }}>
              (Select all that apply)
            </span>
          </Typography>
          <FormControl fullWidth error={!!errors.languagesSpoken}>
            <Select
              multiple
              value={formData.languagesSpoken}
              onChange={handleLanguagesChange}
              input={<OutlinedInput />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{
                        backgroundColor: "#005F73",
                        color: "white",
                        fontFamily: "Source Sans Pro",
                      }}
                    />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 220,
                  },
                },
                disableScrollLock: true,
              }}
              sx={{
                backgroundColor: "#FFF",
                borderRadius: "8px",
                height: "48px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              }}
            >
              {LANGUAGES.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.languagesSpoken && (
            <Typography
              sx={{ color: "#d32f2f", fontSize: "12px", mt: 0.5, ml: 1.5 }}
            >
              {errors.languagesSpoken}
            </Typography>
          )}
        </Grid>

        {/* Professional Bio */}
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
            Professional Bio <span style={{ color: "#E87A42" }}>*</span> (Max
            250 characters)
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "12px",
              color: "#666",
              mb: 1,
            }}
          >
            Tell us about your coaching philosophy, approach, and what makes you
            unique...
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Tell us about your coaching philosophy, approach, and what makes you unique..."
            value={formData.professionalBio}
            onChange={(e) => {
              // Enforce max length
              if (e.target.value.length <= 250) {
                handleInputChange("professionalBio", e.target.value);
              }
            }}
            error={!!errors.professionalBio}
            helperText={errors.professionalBio}
            inputProps={{ maxLength: 250 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFF",
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: "#3A3A3A4D",
                  borderWidth: "1px",
                },
              },
            }}
          />
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "12px",
                color:
                  formData.professionalBio.length >= 250
                    ? "#d32f2f"
                    : formData.professionalBio.length >= 200
                      ? "#ED6C02"
                      : "#666",
                fontWeight: formData.professionalBio.length >= 250 ? 600 : 400,
              }}
            >
              {formData.professionalBio.length} / 250 characters
            </Typography>
          </Box>
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
          text={loading ? "Saving..." : "Next Step"}
          onClick={handleNext}
          disabled={loading}
          style={{ minWidth: "150px", height: "40px" }}
        />
      </Box>
    </Box>
  );
}
