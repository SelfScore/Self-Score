"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Alert,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { adminService } from "@/services/adminService";

export default function ConsultantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const consultantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [consultant, setConsultant] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [verificationChecklist, setVerificationChecklist] = useState({
    identityVerified: false,
    credentialsVerified: false,
    backgroundCheck: false,
    interviewCompleted: false,
  });

  // Approve Dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  // Reject Dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Success/Error Message
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchConsultantDetails();
  }, [consultantId]);

  const fetchConsultantDetails = async () => {
    setLoading(true);
    try {
      const data = await adminService.getConsultantById(consultantId);
      console.log("Consultant data received:", data);
      setConsultant(data);
      setAdminNotes(data.adminNotes || "");
    } catch (error: any) {
      console.error("Error fetching consultant:", error);
      setAlertMessage({
        type: "error",
        text: error.message || "Failed to load consultant details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await adminService.approveConsultant(consultantId);
      setAlertMessage({
        type: "success",
        text: "Consultant approved successfully! Email notification sent.",
      });
      setApproveDialogOpen(false);
      setTimeout(() => {
        router.push("/admin/consultants");
      }, 2000);
    } catch (error: any) {
      setAlertMessage({
        type: "error",
        text: error.message || "Failed to approve consultant",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setAlertMessage({
        type: "error",
        text: "Please provide a reason for rejection",
      });
      return;
    }

    setProcessing(true);
    try {
      await adminService.rejectConsultant(consultantId, rejectionReason);
      setAlertMessage({
        type: "success",
        text: "Consultant rejected. Email notification sent.",
      });
      setRejectDialogOpen(false);
      setTimeout(() => {
        router.push("/admin/consultants");
      }, 2000);
    } catch (error: any) {
      setAlertMessage({
        type: "error",
        text: error.message || "Failed to reject consultant",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadResume = () => {
    if (consultant?.resume) {
      const link = document.createElement("a");
      link.href = consultant.resume;
      link.download = `${consultant.firstName}_${consultant.lastName}_Resume.pdf`;
      link.click();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#FFF3E0", color: "#FF9800" };
      case "approved":
        return { bg: "#E8F5E9", color: "#4CAF50" };
      case "rejected":
        return { bg: "#FFEBEE", color: "#F44336" };
      default:
        return { bg: "#F5F5F5", color: "#999" };
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#FF4F00" }} />
      </Box>
    );
  }

  if (!consultant) {
    return (
      <Container maxWidth="xl">
        <Typography>Consultant not found</Typography>
      </Container>
    );
  }

  const statusColors = getStatusColor(consultant.applicationStatus);

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => router.push("/admin/consultants")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Faustina",
              fontSize: "28px",
              fontWeight: 700,
              color: "#1A1A1A",
            }}
          >
            Consultant Application Review
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Review complete application and make a decision
          </Typography>
        </Box>
      </Box>

      {/* Alert Message */}
      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 3 }}
        >
          {alertMessage.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Consultant Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Profile Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <Avatar
                src={consultant.profilePhoto}
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: "#E87A42",
                  fontSize: "40px",
                }}
              >
                {consultant.firstName.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "Faustina",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#1A1A1A",
                    mb: 1,
                  }}
                >
                  {consultant.firstName} {consultant.lastName}
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <EmailIcon sx={{ fontSize: 16, color: "#666" }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {consultant.email}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <PhoneIcon sx={{ fontSize: 16, color: "#666" }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {consultant.countryCode} {consultant.phoneNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: "#666" }} />
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {consultant.location}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Professional Bio */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Professional Bio
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
                lineHeight: 1.8,
              }}
            >
              {consultant.professionalBio || "No bio provided"}
            </Typography>
          </Paper>

          {/* Specialties & Experience */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Coaching Specialties
            </Typography>
            {consultant.coachingSpecialties &&
            consultant.coachingSpecialties.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {consultant.coachingSpecialties.map((specialty: string) => (
                  <Chip
                    key={specialty}
                    label={specialty}
                    sx={{
                      backgroundColor: "#E8F4F8",
                      color: "#005F73",
                      fontFamily: "Source Sans Pro",
                      fontSize: "13px",
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#999",
                  fontStyle: "italic",
                  mb: 3,
                }}
              >
                No specialties specified
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 1,
              }}
            >
              Experience
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
              }}
            >
              {consultant.yearsOfExperience} years of professional experience
            </Typography>
          </Paper>

          {/* Languages */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Languages
            </Typography>
            {consultant.languagesSpoken &&
            consultant.languagesSpoken.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {consultant.languagesSpoken.map((language: string) => (
                  <Chip
                    key={language}
                    label={language}
                    sx={{
                      backgroundColor: "#F5F5F5",
                      color: "#666",
                      fontFamily: "Source Sans Pro",
                      fontSize: "13px",
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                No languages specified
              </Typography>
            )}
          </Paper>

          {/* Availability */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Availability
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                color: "#666",
              }}
            >
              {consultant.generalAvailability || "Not specified"}
            </Typography>
          </Paper>

          {/* Certifications */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Certifications
            </Typography>
            {consultant.certifications &&
            consultant.certifications.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {consultant.certifications.map((cert: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 2,
                      backgroundColor: "#F9FAFB",
                      borderRadius: "8px",
                    }}
                  >
                    <VerifiedIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "Source Sans Pro",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#1A1A1A",
                        }}
                      >
                        {cert.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Source Sans Pro",
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {cert.issuingOrganization} • Issued{" "}
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                No certifications provided
              </Typography>
            )}
          </Paper>

          {/* Resume */}
          {consultant.resume && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "12px",
                border: "1px solid #E0E0E0",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  mb: 2,
                }}
              >
                Resume/CV
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadResume}
                sx={{
                  textTransform: "none",
                  fontFamily: "Source Sans Pro",
                  borderColor: "#005F73",
                  color: "#005F73",
                  "&:hover": {
                    backgroundColor: "#E8F4F8",
                    borderColor: "#005F73",
                  },
                }}
              >
                Download Resume
              </Button>
            </Paper>
          )}

          {/* Services & Pricing */}
          {consultant.services &&
            consultant.services.length > 0 &&
            consultant.hourlyRate && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  border: "1px solid #E0E0E0",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Faustina",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1A1A1A",
                    mb: 2,
                  }}
                >
                  Services & Pricing
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: "Source Sans Pro",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Hourly Rate:{" "}
                    <strong style={{ color: "#FF4F00" }}>
                      ${consultant.hourlyRate}/hour
                    </strong>
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {consultant.services
                    .filter((service: any) => service.enabled)
                    .map((service: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          backgroundColor: "#F9FAFB",
                          borderRadius: "8px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "Source Sans Pro",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1A1A1A",
                            }}
                          >
                            {service.sessionType} Session
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Source Sans Pro",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#FF4F00",
                            }}
                          >
                            {service.duration} minutes
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: "Source Sans Pro",
                            fontSize: "13px",
                            color: "#666",
                          }}
                        >
                          Estimated cost: $
                          {(
                            (consultant.hourlyRate / 60) *
                            service.duration
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Paper>
            )}
        </Grid>

        {/* Right Column - Application Details & Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Application Details */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Application Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "12px",
                  color: "#999",
                  mb: 0.5,
                }}
              >
                Application Date
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#1A1A1A",
                }}
              >
                {new Date(
                  consultant.appliedAt || consultant.createdAt
                ).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "12px",
                  color: "#999",
                  mb: 0.5,
                }}
              >
                Status
              </Typography>
              <Chip
                label={consultant.applicationStatus.toUpperCase()}
                sx={{
                  backgroundColor: statusColors.bg,
                  color: statusColors.color,
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              />
            </Box>

            {consultant.rejectionReason && (
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "12px",
                    color: "#999",
                    mb: 0.5,
                  }}
                >
                  Rejection Reason
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                    color: "#F44336",
                    p: 2,
                    backgroundColor: "#FFEBEE",
                    borderRadius: "8px",
                  }}
                >
                  {consultant.rejectionReason}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Verification Checklist */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Verification Checklist
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationChecklist.identityVerified}
                    onChange={(e) =>
                      setVerificationChecklist({
                        ...verificationChecklist,
                        identityVerified: e.target.checked,
                      })
                    }
                  />
                }
                label="Identity Verified"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationChecklist.credentialsVerified}
                    onChange={(e) =>
                      setVerificationChecklist({
                        ...verificationChecklist,
                        credentialsVerified: e.target.checked,
                      })
                    }
                  />
                }
                label="Credentials Verified"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationChecklist.backgroundCheck}
                    onChange={(e) =>
                      setVerificationChecklist({
                        ...verificationChecklist,
                        backgroundCheck: e.target.checked,
                      })
                    }
                  />
                }
                label="Background Check Complete"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationChecklist.interviewCompleted}
                    onChange={(e) =>
                      setVerificationChecklist({
                        ...verificationChecklist,
                        interviewCompleted: e.target.checked,
                      })
                    }
                  />
                }
                label="Interview Completed"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontFamily: "Source Sans Pro",
                    fontSize: "14px",
                  },
                }}
              />
            </FormGroup>
          </Paper>

          {/* Admin Notes */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "12px",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Faustina",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1A1A1A",
                mb: 2,
              }}
            >
              Admin Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add internal notes about this application..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                },
              }}
            />
          </Paper>

          {/* Action Buttons */}
          {consultant.applicationStatus === "pending" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={() => setApproveDialogOpen(true)}
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  textTransform: "none",
                  fontFamily: "Source Sans Pro",
                  fontSize: "15px",
                  fontWeight: 600,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#45A049",
                  },
                }}
              >
                Approve Consultant
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setRejectDialogOpen(true)}
                sx={{
                  borderColor: "#F44336",
                  color: "#F44336",
                  textTransform: "none",
                  fontFamily: "Source Sans Pro",
                  fontSize: "15px",
                  fontWeight: 600,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#FFEBEE",
                    borderColor: "#F44336",
                  },
                }}
              >
                Reject Application
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => !processing && setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "Faustina",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Approve Consultant Application
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#666",
              mb: 2,
            }}
          >
            Are you sure you want to approve {consultant.firstName}{" "}
            {consultant.lastName}'s application? They will receive an email
            notification with instructions to access their consultant dashboard.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography
              sx={{ fontFamily: "Source Sans Pro", fontSize: "13px" }}
            >
              An approval email will be sent to:{" "}
              <strong>{consultant.email}</strong>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={processing}
            sx={{
              textTransform: "none",
              fontFamily: "Source Sans Pro",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            disabled={processing}
            sx={{
              textTransform: "none",
              fontFamily: "Source Sans Pro",
              backgroundColor: "#4CAF50",
              "&:hover": {
                backgroundColor: "#45A049",
              },
            }}
          >
            {processing ? <CircularProgress size={20} /> : "Confirm Approval"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => !processing && setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "Faustina",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Reject Consultant Application
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: "14px",
              color: "#666",
              mb: 2,
            }}
          >
            Please provide a reason for rejection. This will be included in the
            email notification sent to the applicant.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Explain why the application is being rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
              },
            }}
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography
              sx={{ fontFamily: "Source Sans Pro", fontSize: "13px" }}
            >
              A rejection email with your remarks will be sent to:{" "}
              <strong>{consultant.email}</strong>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            disabled={processing}
            sx={{
              textTransform: "none",
              fontFamily: "Source Sans Pro",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            disabled={processing || !rejectionReason.trim()}
            sx={{
              textTransform: "none",
              fontFamily: "Source Sans Pro",
              backgroundColor: "#F44336",
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
            }}
          >
            {processing ? <CircularProgress size={20} /> : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
