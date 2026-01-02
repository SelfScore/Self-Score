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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import {
  Add,
  Delete,
  CloudUpload,
  InsertDriveFile,
  Check,
  Close,
  Description,
} from "@mui/icons-material";
import dayjs from "dayjs";
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

interface CertificationDraft {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  certificateFile: string;
  fileName?: string;
}

export default function Step3Certifications({
  consultantId,
  onNext,
  onPrevious,
  initialData,
}: Step3CertificationsProps) {
  // Added certifications (shown in table)
  const [certifications, setCertifications] = useState<Certification[]>(
    initialData?.certifications || []
  );

  // Draft certification being added
  const [showAddForm, setShowAddForm] = useState(false);
  const [draftCert, setDraftCert] = useState<CertificationDraft>({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    certificateFile: "",
    fileName: "",
  });
  const [draftErrors, setDraftErrors] = useState<{ [key: string]: string }>({});

  // Resume state
  const [resume, setResume] = useState<string>(initialData?.resume || "");
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [resumeFileSize, setResumeFileSize] = useState<string>("");

  // General state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("consultantStep3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.certifications) setCertifications(parsed.certifications);
        if (parsed.resume) setResume(parsed.resume);
        if (parsed.resumeFileName) setResumeFileName(parsed.resumeFileName);
        if (parsed.resumeFileSize) setResumeFileSize(parsed.resumeFileSize);
      } catch (e) {
        console.error("Error loading saved step 3 data", e);
      }
    }
  }, []);

  // Save to sessionStorage whenever certifications or resume changes
  useEffect(() => {
    sessionStorage.setItem(
      "consultantStep3",
      JSON.stringify({
        certifications,
        resume,
        resumeFileName,
        resumeFileSize,
      })
    );
  }, [certifications, resume, resumeFileName, resumeFileSize]);

  // Get today's date for max date validation
  const today = dayjs().format("YYYY-MM-DD");

  // Handle draft certification file upload
  const handleDraftFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      setDraftErrors((prev) => ({
        ...prev,
        certificateFile: "Only PDF and image files are allowed",
      }));
      return;
    }

    try {
      const base64 = await consultantAuthService.fileToBase64(file);

      if (!consultantAuthService.validateFileSize(base64, 1)) {
        setDraftErrors((prev) => ({
          ...prev,
          certificateFile: "File must be under 1MB",
        }));
        return;
      }

      setDraftCert((prev) => ({
        ...prev,
        certificateFile: base64,
        fileName: file.name,
      }));
      setDraftErrors((prev) => ({ ...prev, certificateFile: "" }));
    } catch (_error) {
      setDraftErrors((prev) => ({
        ...prev,
        certificateFile: "Failed to upload file",
      }));
    }
  };

  // Validate draft certification
  const validateDraft = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!draftCert.name.trim()) {
      newErrors.name = "Certification name is required";
    }
    if (!draftCert.issuingOrganization.trim()) {
      newErrors.issuingOrganization = "Issuing organization is required";
    }
    if (!draftCert.issueDate) {
      newErrors.issueDate = "Issue date is required";
    } else if (dayjs(draftCert.issueDate).isAfter(dayjs())) {
      newErrors.issueDate = "Issue date cannot be in the future";
    }
    if (!draftCert.certificateFile) {
      newErrors.certificateFile = "Certificate file is required";
    }

    setDraftErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add certification to list
  const handleAddCertification = () => {
    if (!validateDraft()) return;

    setCertifications([
      ...certifications,
      {
        name: draftCert.name,
        issuingOrganization: draftCert.issuingOrganization,
        issueDate: draftCert.issueDate,
        certificateFile: draftCert.certificateFile,
      },
    ]);

    // Reset draft
    setDraftCert({
      name: "",
      issuingOrganization: "",
      issueDate: "",
      certificateFile: "",
      fileName: "",
    });
    setDraftErrors({});
    setShowAddForm(false);
  };

  // Remove certification from list
  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Cancel adding certification
  const handleCancelAdd = () => {
    setDraftCert({
      name: "",
      issuingOrganization: "",
      issueDate: "",
      certificateFile: "",
      fileName: "",
    });
    setDraftErrors({});
    setShowAddForm(false);
  };

  // Handle resume upload
  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      if (!consultantAuthService.validateFileSize(base64, 1)) {
        setErrors((prev) => ({
          ...prev,
          resume: "Resume must be under 1MB",
        }));
        return;
      }

      setResume(base64);
      setResumeFileName(file.name);
      // Calculate file size
      const sizeInKB = Math.round(file.size / 1024);
      setResumeFileSize(
        sizeInKB >= 1024
          ? `${(sizeInKB / 1024).toFixed(1)} MB`
          : `${sizeInKB} KB`
      );
      setErrors((prev) => ({ ...prev, resume: "" }));
    } catch (_error) {
      setErrors((prev) => ({
        ...prev,
        resume: "Failed to upload resume",
      }));
    }
  };

  // Remove resume
  const handleRemoveResume = () => {
    setResume("");
    setResumeFileName("");
    setResumeFileSize("");
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!resume) {
      newErrors.resume = "Resume is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await consultantAuthService.updateCertifications({
        consultantId,
        certifications,
        resume,
      });

      if (response.success) {
        onNext({ certifications, resume });
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
          {!showAddForm && (
            <Button
              startIcon={<Add />}
              onClick={() => setShowAddForm(true)}
              sx={{
                color: "#005F73",
                fontFamily: "Source Sans Pro",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Add Certification
            </Button>
          )}
        </Box>

        {/* Added Certifications Table */}
        {certifications.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{
              mb: 3,
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>File</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 60 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certifications.map((cert, index) => (
                  <TableRow key={index}>
                    <TableCell>{cert.name}</TableCell>
                    <TableCell>{cert.issuingOrganization}</TableCell>
                    <TableCell>
                      {dayjs(cert.issueDate).format("MMM DD, YYYY")}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <InsertDriveFile
                          sx={{ fontSize: 16, color: "#005F73" }}
                        />
                        <Typography sx={{ fontSize: "12px" }}>
                          Uploaded
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveCertification(index)}
                        sx={{ color: "#d32f2f" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add Certification Form */}
        {showAddForm ? (
          <Paper
            sx={{
              p: 3,
              backgroundColor: "#FFF",
              borderRadius: "8px",
              border: "1px solid #005F73",
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
                Add New Certification
              </Typography>
              <IconButton size="small" onClick={handleCancelAdd}>
                <Close />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Certification Name *"
                  placeholder="e.g., Certified Life Coach"
                  value={draftCert.name}
                  onChange={(e) =>
                    setDraftCert((prev) => ({ ...prev, name: e.target.value }))
                  }
                  error={!!draftErrors.name}
                  helperText={draftErrors.name}
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
                  label="Issuing Organization *"
                  placeholder="e.g., ICF, NBHWC"
                  value={draftCert.issuingOrganization}
                  onChange={(e) =>
                    setDraftCert((prev) => ({
                      ...prev,
                      issuingOrganization: e.target.value,
                    }))
                  }
                  error={!!draftErrors.issuingOrganization}
                  helperText={draftErrors.issuingOrganization}
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
                  label="Issue Date *"
                  type="date"
                  value={draftCert.issueDate}
                  onChange={(e) =>
                    setDraftCert((prev) => ({
                      ...prev,
                      issueDate: e.target.value,
                    }))
                  }
                  error={!!draftErrors.issueDate}
                  helperText={draftErrors.issueDate}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: today }}
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
                  ref={certFileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDraftFileUpload}
                  style={{ display: "none" }}
                />
                <Button
                  onClick={() => certFileInputRef.current?.click()}
                  variant="outlined"
                  fullWidth
                  startIcon={
                    draftCert.certificateFile ? (
                      <InsertDriveFile />
                    ) : (
                      <CloudUpload />
                    )
                  }
                  sx={{
                    borderColor: draftErrors.certificateFile
                      ? "#d32f2f"
                      : draftCert.certificateFile
                        ? "#4CAF50"
                        : "#3A3A3A4D",
                    color: draftCert.certificateFile ? "#4CAF50" : "#666",
                    textTransform: "none",
                    fontFamily: "Source Sans Pro",
                    justifyContent: "flex-start",
                    backgroundColor: "#FFF",
                    borderRadius: "8px",
                    height: "48px",
                  }}
                >
                  {draftCert.certificateFile
                    ? draftCert.fileName || "Certificate Selected"
                    : "Upload Certificate *"}
                </Button>
                {draftErrors.certificateFile && (
                  <Typography
                    sx={{
                      color: "#d32f2f",
                      fontSize: "12px",
                      mt: 0.5,
                      ml: 1.5,
                    }}
                  >
                    {draftErrors.certificateFile}
                  </Typography>
                )}
              </Grid>
            </Grid>

            {/* Done Button */}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancelAdd}
                sx={{
                  borderColor: "#666",
                  color: "#666",
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddCertification}
                startIcon={<Check />}
                sx={{
                  backgroundColor: "#005F73",
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#004A5A" },
                }}
              >
                Done
              </Button>
            </Box>
          </Paper>
        ) : certifications.length === 0 ? (
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
              No certifications added yet (optional)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowAddForm(true)}
              sx={{
                borderColor: "#005F73",
                color: "#005F73",
                textTransform: "none",
                fontFamily: "Source Sans Pro",
                borderRadius: "8px",
              }}
            >
              Add Your First Certification
            </Button>
          </Paper>
        ) : null}
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

        {resume ? (
          // File uploaded state
          <Paper
            sx={{
              p: 3,
              backgroundColor: "#FFF",
              border: "1px solid #4CAF50",
              borderRadius: "8px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Description sx={{ fontSize: 40, color: "#005F73" }} />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1A1A1A",
                    }}
                  >
                    {resumeFileName || "Resume Uploaded"}
                  </Typography>
                  {resumeFileSize && (
                    <Typography
                      sx={{
                        fontFamily: "Source Sans Pro",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      {resumeFileSize}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => resumeInputRef.current?.click()}
                  sx={{
                    borderColor: "#005F73",
                    color: "#005F73",
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Change File
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRemoveResume}
                  sx={{
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          </Paper>
        ) : (
          // Upload state
          <Paper
            sx={{
              p: 3,
              backgroundColor: "#FFF",
              border: errors.resume
                ? "2px solid #d32f2f"
                : "1px solid #3A3A3A4D",
              borderRadius: "8px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#005F73",
                backgroundColor: "#F5F9FA",
              },
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
              Click to upload your resume
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
              }}
            >
              PDF, DOC, DOCX up to 1MB
            </Typography>
          </Paper>
        )}

        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeUpload}
          style={{ display: "none" }}
        />

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
