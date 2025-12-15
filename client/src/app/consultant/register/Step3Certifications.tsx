"use client";

import {
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  Button,
  IconButton,
  Paper,
} from "@mui/material";
import { useState, useRef } from "react";
import { Add, Delete, CloudUpload, InsertDriveFile } from "@mui/icons-material";
import ButtonSelfScore from "../../components/ui/ButtonSelfScore";
import OutLineButton from "../../components/ui/OutLineButton";
import {
  consultantAuthService,
  Step3Data,
  Certification,
} from "../../../services/consultantAuthService";

interface Step3CertificationsProps {
  consultantId: string;
  onNext: (data: Omit<Step3Data, "consultantId">) => void;
  onPrevious: () => void;
  initialData?: Partial<Omit<Step3Data, "consultantId">>;
}

export default function Step3Certifications({
  consultantId,
  onNext,
  onPrevious,
  initialData,
}: Step3CertificationsProps) {
  const [certifications, setCertifications] = useState<Certification[]>(
    initialData?.certifications || []
  );
  const [resume, setResume] = useState<string>(initialData?.resume || "");
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      {
        name: "",
        issuingOrganization: "",
        issueDate: "",
        certificateFile: "",
      },
    ]);
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleCertificationChange = (
    index: number,
    field: keyof Certification,
    value: string
  ) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const handleCertificateFileUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`cert_${index}`]: "Only PDF and image files are allowed",
      }));
      return;
    }

    try {
      const base64 = await consultantAuthService.fileToBase64(file);

      // Validate file size (1MB limit)
      if (!consultantAuthService.validateFileSize(base64, 1)) {
        setErrors((prev) => ({
          ...prev,
          [`cert_${index}`]: "File must be under 1MB",
        }));
        return;
      }

      handleCertificationChange(index, "certificateFile", base64);
      setErrors((prev) => ({ ...prev, [`cert_${index}`]: "" }));
    } catch (_error) {
      setErrors((prev) => ({
        ...prev,
        [`cert_${index}`]: "Failed to upload file",
      }));
    }
  };

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        resume: "Only PDF and Word documents are allowed",
      }));
      return;
    }

    try {
      const base64 = await consultantAuthService.fileToBase64(file);

      // Validate file size (1MB limit)
      if (!consultantAuthService.validateFileSize(base64, 1)) {
        setErrors((prev) => ({
          ...prev,
          resume: "Resume must be under 1MB",
        }));
        return;
      }

      setResume(base64);
      setResumeFileName(file.name);
      setErrors((prev) => ({ ...prev, resume: "" }));
    } catch (_error) {
      setErrors((prev) => ({
        ...prev,
        resume: "Failed to upload resume",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Resume is required
    if (!resume) {
      newErrors.resume = "Resume is required";
    }

    // Validate certifications if any are added
    certifications.forEach((cert, index) => {
      if (cert.name || cert.issuingOrganization || cert.issueDate) {
        // If any field is filled, all fields should be filled
        if (!cert.name) {
          newErrors[`cert_name_${index}`] = "Certification name is required";
        }
        if (!cert.issuingOrganization) {
          newErrors[`cert_org_${index}`] = "Issuing organization is required";
        }
        if (!cert.issueDate) {
          newErrors[`cert_date_${index}`] = "Issue date is required";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    // Filter out empty certifications
    const validCertifications = certifications.filter(
      (cert) => cert.name && cert.issuingOrganization && cert.issueDate
    );

    setLoading(true);
    try {
      const response = await consultantAuthService.updateCertifications({
        consultantId,
        certifications: validCertifications,
        resume,
      });

      if (response.success) {
        // Save to sessionStorage
        sessionStorage.setItem(
          "consultantStep3",
          JSON.stringify({ certifications: validCertifications, resume })
        );
        onNext({ certifications: validCertifications, resume });
      } else {
        setErrors({
          general: response.message || "Failed to save certifications",
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
          mb: 1,
          color: "#1A1A1A",
        }}
      >
        Certifications & Credentials
      </Typography>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}

      {/* Certifications Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "18px",
              fontWeight: 600,
              color: "#1A1A1A",
            }}
          >
            Certifications
          </Typography>
          <Button
            startIcon={<Add />}
            onClick={handleAddCertification}
            sx={{
              color: "#005F73",
              fontFamily: "Source Sans Pro",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Certification
          </Button>
        </Box>

        {certifications.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "#FFF",
              border: "1px solid #3A3A3A4D",
              borderRadius: "8px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
                mb: 2,
              }}
            >
              No certifications added yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddCertification}
              sx={{
                borderColor: "#005F73",
                color: "#005F73",
                textTransform: "none",
                fontFamily: "Source Sans Pro",
              }}
            >
              Add Your First Certification
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {certifications.map((cert, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  backgroundColor: "#FFF",
                  borderRadius: "8px",
                  border: "1px solid #E0E0E0",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                    }}
                  >
                    Certification #{index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => handleRemoveCertification(index)}
                    size="small"
                    sx={{ color: "#d32f2f" }}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Certification Name"
                      placeholder="e.g., Certified Life Coach"
                      value={cert.name}
                      onChange={(e) =>
                        handleCertificationChange(index, "name", e.target.value)
                      }
                      error={!!errors[`cert_name_${index}`]}
                      helperText={errors[`cert_name_${index}`]}
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

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Issuing Organization"
                      placeholder="e.g., ICF, NBHWC"
                      value={cert.issuingOrganization}
                      onChange={(e) =>
                        handleCertificationChange(
                          index,
                          "issuingOrganization",
                          e.target.value
                        )
                      }
                      error={!!errors[`cert_org_${index}`]}
                      helperText={errors[`cert_org_${index}`]}
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

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Issue Date"
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) =>
                        handleCertificationChange(
                          index,
                          "issueDate",
                          e.target.value
                        )
                      }
                      error={!!errors[`cert_date_${index}`]}
                      helperText={errors[`cert_date_${index}`]}
                      InputLabelProps={{ shrink: true }}
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

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleCertificateFileUpload(index, e)}
                      style={{ display: "none" }}
                      id={`cert-file-${index}`}
                    />
                    <label htmlFor={`cert-file-${index}`}>
                      <Button
                        component="span"
                        variant="outlined"
                        fullWidth
                        startIcon={
                          cert.certificateFile ? (
                            <InsertDriveFile />
                          ) : (
                            <CloudUpload />
                          )
                        }
                        sx={{
                          // height: "40px",
                          borderColor: errors[`cert_${index}`]
                            ? "#d32f2f"
                            : "#3A3A3A4D",
                          color: "#666",
                          textTransform: "none",
                          fontFamily: "Source Sans Pro",
                          // borderRadius: "8px",
                          justifyContent: "flex-start",
                          // backgroundColor: "#FFF",
                          backgroundColor: "#FFF",
                          borderRadius: "8px",
                          height: "48px",
                          "& fieldset": {
                            borderColor: "#3A3A3A4D",
                            borderWidth: "1px",
                          },
                        }}
                      >
                        {cert.certificateFile
                          ? "Certificate Uploaded"
                          : "Upload Certificate (Optional)"}
                      </Button>
                    </label>
                    {errors[`cert_${index}`] && (
                      <Typography
                        sx={{
                          color: "#d32f2f",
                          fontSize: "12px",
                          mt: 0.5,
                          ml: 1.5,
                        }}
                      >
                        {errors[`cert_${index}`]}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      {/* Resume Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "Source Sans Pro",
            fontSize: "18px",
            fontWeight: 600,
            mb: 2,
            color: "#1A1A1A",
          }}
        >
          Resume / CV <span style={{ color: "#E87A42" }}>*</span>
        </Typography>

        <Paper
          sx={{
            p: 3,
            backgroundColor: "#FFF",
            border: errors.resume ? "2px solid #d32f2f" : "1px solid #3A3A3A4D",
            borderRadius: "8px",
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => resumeInputRef.current?.click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: "#005F73", mb: 1 }} />
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "16px",
              fontWeight: 600,
              color: "#1A1A1A",
              mb: 1,
            }}
          >
            {resume ? "Resume Uploaded" : "Upload your resume"}
          </Typography>
          {resumeFileName && (
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
                mb: 1,
              }}
            >
              {resumeFileName}
            </Typography>
          )}
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#666",
            }}
          >
            PDF, DOC, DOCX up to 1MB
          </Typography>
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            style={{ display: "none" }}
          />
        </Paper>
        {errors.resume && (
          <Typography
            sx={{ color: "#d32f2f", fontSize: "12px", mt: 0.5, ml: 1.5 }}
          >
            {errors.resume}
          </Typography>
        )}
      </Box>

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
