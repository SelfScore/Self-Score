"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  //   Divider,
  Alert,
  IconButton,
  Stack,
  Snackbar,
  CircularProgress,
  Chip,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import {
  Edit,
  Save,
  Cancel,
  Dashboard,
  Logout,
  Email,
  LocationOn,
  PhotoCamera,
  Add,
  Delete,
  InsertDriveFile,
  CheckCircle,
  Person,
  Work,
  School,
  AttachMoney,
  CalendarToday,
} from "@mui/icons-material";
import ButtonSelfScore from "@/app/components/ui/ButtonSelfScore";
import OutLineButton from "@/app/components/ui/OutLineButton";
import EmailVerificationModal from "@/app/components/ui/EmailVerificationModal";
import LogoutConfirmationModal from "@/app/components/ui/LogoutConfirmationModal";
import {
  consultantAuthService,
  Service,
} from "@/services/consultantAuthService";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import TimezoneSelect from "react-timezone-select";

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

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface AvailabilitySlot {
  dayOfWeek: number;
  timeRanges: TimeRange[];
  isAvailable: boolean;
}

export default function ConsultantProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultant, setConsultant] = useState<any>(null);
  const [error, setError] = useState("");

  // Editing states for each section
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(false);
  const [editingServices, setEditingServices] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(false);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, _setPendingEmail] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const profilePhotoRef = useRef<HTMLInputElement>(null);

  // Form data for Personal Info
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+1",
    phoneNumber: "",
    location: "",
    profilePhoto: "",
  });

  const [originalPersonalData, setOriginalPersonalData] =
    useState(personalData);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");

  // Form data for Professional Details
  const [professionalData, setProfessionalData] = useState({
    coachingSpecialties: [] as string[],
    yearsOfExperience: 0,
    professionalBio: "",
    languagesSpoken: [] as string[],
  });

  const [originalProfessionalData, setOriginalProfessionalData] =
    useState(professionalData);

  // Services data
  const [servicesData, setServicesData] = useState({
    hourlyRate: 75,
    services: [] as Service[],
    introductionVideoLink: "",
  });

  const [originalServicesData, setOriginalServicesData] =
    useState(servicesData);

  // Availability data
  const [availabilityData, setAvailabilityData] = useState({
    availability: [] as AvailabilitySlot[],
    bufferBetweenSessions: 10,
    minAdvanceBookingHours: 3,
    maxAdvanceBookingMonths: 6,
    autoCreateMeetLink: true,
    meetingLocation: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [originalAvailabilityData, setOriginalAvailabilityData] =
    useState(availabilityData);

  useEffect(() => {
    fetchConsultantData();
  }, []);

  const fetchConsultantData = async () => {
    try {
      setLoading(true);
      const response = await consultantAuthService.getCurrentConsultant();

      if (response.success && response.data) {
        const data = response.data;
        setConsultant(data);

        // Set personal data
        const personal = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          countryCode: data.countryCode || "+1",
          phoneNumber: data.phoneNumber || "",
          location: data.location || "",
          profilePhoto: data.profilePhoto || "",
        };
        setPersonalData(personal);
        setOriginalPersonalData(personal);
        setProfilePhotoPreview(data.profilePhoto || "");

        // Set professional data
        const professional = {
          coachingSpecialties: data.coachingSpecialties || [],
          yearsOfExperience: data.yearsOfExperience || 0,
          professionalBio: data.professionalBio || "",
          languagesSpoken: data.languagesSpoken || [],
        };
        setProfessionalData(professional);
        setOriginalProfessionalData(professional);

        // Set services data
        const services = {
          hourlyRate: data.hourlyRate || 75,
          services: data.services || [],
          introductionVideoLink: data.introductionVideoLink || "",
        };
        setServicesData(services);
        setOriginalServicesData(services);

        // Set availability data
        if (data.bookingSettings) {
          const availability = {
            availability: data.bookingSettings.availability || [],
            bufferBetweenSessions:
              data.bookingSettings.bufferBetweenSessions || 10,
            minAdvanceBookingHours:
              data.bookingSettings.minAdvanceBookingHours || 3,
            maxAdvanceBookingMonths:
              data.bookingSettings.maxAdvanceBookingMonths || 6,
            autoCreateMeetLink:
              data.bookingSettings.autoCreateMeetLink !== false,
            meetingLocation: data.bookingSettings.meetingLocation || "",
            timezone:
              data.bookingSettings.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          setAvailabilityData(availability);
          setOriginalAvailabilityData(availability);
        }
      }
    } catch (err: any) {
      setError("Failed to load profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Personal Info handlers
  const handlePersonalInputChange = (field: string, value: string) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (phone: string, country: any) => {
    setPersonalData((prev) => ({
      ...prev,
      phoneNumber: phone.slice(country.dialCode.length),
      countryCode: `+${country.dialCode}`,
    }));
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    try {
      const base64 = await consultantAuthService.fileToBase64(file);
      if (!consultantAuthService.validateFileSize(base64, 1)) {
        setError("Image must be under 1MB");
        return;
      }

      setProfilePhotoPreview(base64);
      setPersonalData((prev) => ({ ...prev, profilePhoto: base64 }));
    } catch (err) {
      setError("Failed to upload image");
    }
  };

  const handleSavePersonal = async () => {
    try {
      setSaveLoading(true);
      setError("");

      // Update fields (email is not editable)
      const response = await consultantAuthService.updatePersonalInfo({
        consultantId: consultant._id,
        ...personalData,
      });

      if (response.success) {
        setOriginalPersonalData(personalData);
        setEditingPersonal(false);
        setSuccessMessage("Personal information updated successfully!");
        setShowSuccessMessage(true);
        fetchConsultantData();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update personal information"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleVerifyEmail = async (code: string) => {
    try {
      await consultantAuthService.verifyEmailUpdate({
        email: pendingEmail,
        verifyCode: code,
      });

      const newData = { ...personalData, email: pendingEmail };
      setPersonalData(newData);
      setOriginalPersonalData(newData);
      setShowEmailVerification(false);
      setEditingPersonal(false);
      setSuccessMessage("Email updated successfully!");
      setShowSuccessMessage(true);
      fetchConsultantData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Email verification failed");
    }
  };

  // Professional Details handlers
  const handleProfessionalInputChange = (field: string, value: any) => {
    setProfessionalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecialtiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setProfessionalData((prev) => ({
      ...prev,
      coachingSpecialties: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setProfessionalData((prev) => ({
      ...prev,
      languagesSpoken: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSaveProfessional = async () => {
    try {
      setSaveLoading(true);
      setError("");

      const response = await consultantAuthService.updateProfessionalInfo({
        consultantId: consultant._id,
        ...professionalData,
      });

      if (response.success) {
        setOriginalProfessionalData(professionalData);
        setEditingProfessional(false);
        setSuccessMessage("Professional details updated successfully!");
        setShowSuccessMessage(true);
        fetchConsultantData();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update professional details"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // Services handlers
  const handleServiceToggle = (sessionType: string) => {
    setServicesData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.sessionType === sessionType
          ? { ...service, enabled: !service.enabled }
          : service
      ),
    }));
  };

  const handleSaveServices = async () => {
    try {
      setSaveLoading(true);
      setError("");

      const response = await consultantAuthService.completeRegistration({
        consultantId: consultant._id,
        ...servicesData,
        generalAvailability: "", // Not used in profile edit
      });

      if (response.success) {
        setOriginalServicesData(servicesData);
        setEditingServices(false);
        setSuccessMessage("Services & pricing updated successfully!");
        setShowSuccessMessage(true);
        fetchConsultantData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update services");
    } finally {
      setSaveLoading(false);
    }
  };

  // Availability handlers
  const handleAvailabilityChange = (
    dayOfWeek: number,
    field: string,
    value: any
  ) => {
    setAvailabilityData((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const handleAddTimeRange = (dayOfWeek: number) => {
    setAvailabilityData((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? {
              ...slot,
              timeRanges: [
                ...slot.timeRanges,
                { startTime: "09:00", endTime: "17:00" },
              ],
            }
          : slot
      ),
    }));
  };

  const handleRemoveTimeRange = (dayOfWeek: number, index: number) => {
    setAvailabilityData((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? {
              ...slot,
              timeRanges: slot.timeRanges.filter((_, i) => i !== index),
            }
          : slot
      ),
    }));
  };

  const handleTimeRangeChange = (
    dayOfWeek: number,
    index: number,
    field: string,
    value: string
  ) => {
    setAvailabilityData((prev) => ({
      ...prev,
      availability: prev.availability.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? {
              ...slot,
              timeRanges: slot.timeRanges.map((range, i) =>
                i === index ? { ...range, [field]: value } : range
              ),
            }
          : slot
      ),
    }));
  };

  const handleSaveAvailability = async () => {
    try {
      setSaveLoading(true);
      setError("");

      const response = await consultantAuthService.updateAvailability({
        consultantId: consultant._id,
        bookingSettings: availabilityData,
      });

      if (response.success) {
        setOriginalAvailabilityData(availabilityData);
        setEditingAvailability(false);
        setSuccessMessage("Availability settings updated successfully!");
        setShowSuccessMessage(true);
        fetchConsultantData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update availability");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!consultant) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Failed to load consultant profile</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F8FAFB 0%, #EEF2F5 100%)",
        py: { xs: 4, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#005F73",
              fontFamily: "Faustina",
              fontSize: { xs: "2rem", md: "2.5rem" },
              mb: 1,
            }}
          >
            Profile Settings
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            Manage your consultant profile and preferences
          </Typography>
        </Box>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Card
              sx={{
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 95, 115, 0.12)",
                background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFB 100%)",
                border: "1px solid rgba(0, 95, 115, 0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 4,
                    alignItems: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {/* Left Section - Profile Photo and Status */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      width: { xs: "100%", sm: "50%" },
                    }}
                  >
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <Avatar
                        src={profilePhotoPreview || undefined}
                        sx={{
                          width: { xs: 100, md: 120 },
                          height: { xs: 100, md: 120 },
                          background: profilePhotoPreview
                            ? "transparent"
                            : "linear-gradient(135deg, #FF4F00 0%, #E87A42 100%)",
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                          border: "4px solid #fff",
                          boxShadow: "0 8px 24px rgba(232, 122, 66, 0.3)",
                        }}
                      >
                        {!profilePhotoPreview &&
                          (personalData.firstName?.charAt(0)?.toUpperCase() ||
                            "C")}
                      </Avatar>
                      {editingPersonal && (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            ref={profilePhotoRef}
                            style={{ display: "none" }}
                            onChange={handlePhotoUpload}
                          />
                          <IconButton
                            onClick={() => profilePhotoRef.current?.click()}
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              right: -8,
                              backgroundColor: "#FF4F00",
                              color: "#fff",
                              width: 36,
                              height: 36,
                              border: "3px solid #fff",
                              "&:hover": { backgroundColor: "#E87A42" },
                            }}
                          >
                            <PhotoCamera sx={{ fontSize: "1rem" }} />
                          </IconButton>
                        </>
                      )}
                    </Box>

                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666",
                          fontFamily: "Source Sans Pro",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Application Status
                      </Typography>
                      <Chip
                        label={
                          consultant.applicationStatus?.toUpperCase() ||
                          "PENDING"
                        }
                        color={
                          consultant.applicationStatus === "approved"
                            ? "success"
                            : "warning"
                        }
                        sx={{
                          fontFamily: "Source Sans Pro",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Right Section - Name, Email and Buttons */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      width: { xs: "100%", sm: "50%" },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: "#1A1A1A",
                          fontFamily: "Faustina",
                        }}
                      >
                        {personalData.firstName} {personalData.lastName}
                      </Typography>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 2 }}
                      >
                        <Email sx={{ fontSize: "1rem", color: "#666" }} />
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", fontFamily: "Source Sans Pro" }}
                        >
                          {personalData.email}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Quick Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: "auto",
                        width: { xs: "100%", sm: "50%" },
                      }}
                    >
                      <ButtonSelfScore
                        text="Go to Dashboard"
                        onClick={() => router.push("/consultant/dashboard")}
                        startIcon={<Dashboard />}
                        fullWidth
                        height={44}
                        background="#005F73"
                        style={{
                          borderRadius: "12px",
                          fontFamily: "Source Sans Pro",
                        }}
                      />

                      <OutLineButton
                        onClick={() => setShowLogoutModal(true)}
                        startIcon={<Logout />}
                        fullWidth
                        sx={{
                          height: "44px",
                          borderColor: "#D32F2F",
                          color: "#D32F2F",
                          fontFamily: "Source Sans Pro",
                          "&:hover": {
                            borderColor: "#B71C1C",
                            backgroundColor: "rgba(211, 47, 47, 0.04)",
                          },
                        }}
                      >
                        Sign Out
                      </OutLineButton>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content Area */}
          <Grid size={{ xs: 12, md: 12 }}>
            {/* Personal Information */}
            <Card
              sx={{
                mb: 3,
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 95, 115, 0.12)",
                background: "#FFFFFF",
                border: "1px solid rgba(0, 95, 115, 0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person sx={{ color: "#005F73" }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A1A",
                        fontFamily: "Faustina",
                      }}
                    >
                      Personal Information
                    </Typography>
                  </Box>

                  {!editingPersonal && (
                    <IconButton
                      onClick={() => setEditingPersonal(true)}
                      sx={{
                        backgroundColor: "#FF4F00",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#E87A42" },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      FIRST NAME
                    </Typography>
                    <TextField
                      fullWidth
                      value={personalData.firstName}
                      onChange={(e) =>
                        handlePersonalInputChange("firstName", e.target.value)
                      }
                      disabled={!editingPersonal}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: editingPersonal ? "#fff" : "#F8FAFB",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      LAST NAME
                    </Typography>
                    <TextField
                      fullWidth
                      value={personalData.lastName}
                      onChange={(e) =>
                        handlePersonalInputChange("lastName", e.target.value)
                      }
                      disabled={!editingPersonal}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: editingPersonal ? "#fff" : "#F8FAFB",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "#666",
                          fontWeight: 600,
                        }}
                      >
                        EMAIL ADDRESS
                      </Typography>
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: "0.9rem" }} />}
                        label="Verified"
                        size="small"
                        sx={{
                          backgroundColor: "#E8F5E9",
                          color: "#4CAF50",
                          fontWeight: 600,
                          height: "20px",
                          "& .MuiChip-icon": {
                            color: "#4CAF50",
                          },
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      type="email"
                      value={personalData.email}
                      disabled={true}
                      InputProps={{
                        startAdornment: (
                          <Email
                            sx={{ mr: 1, color: "#005F73", opacity: 0.7 }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "#F8FAFB",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      PHONE NUMBER
                    </Typography>
                    <PhoneInput
                      country={"us"}
                      value={
                        personalData.countryCode + personalData.phoneNumber
                      }
                      onChange={handlePhoneChange}
                      disabled={!editingPersonal}
                      containerStyle={{ width: "100%" }}
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: editingPersonal ? "#fff" : "#F8FAFB",
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      LOCATION
                    </Typography>
                    <TextField
                      fullWidth
                      value={personalData.location}
                      onChange={(e) =>
                        handlePersonalInputChange("location", e.target.value)
                      }
                      disabled={!editingPersonal}
                      placeholder="City, State/Country"
                      InputProps={{
                        startAdornment: (
                          <LocationOn
                            sx={{ mr: 1, color: "#005F73", opacity: 0.7 }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: editingPersonal ? "#fff" : "#F8FAFB",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {editingPersonal && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <ButtonSelfScore
                      text={
                        saveLoading ? (
                          <CircularProgress size={20} sx={{ color: "#fff" }} />
                        ) : (
                          "Save Changes"
                        )
                      }
                      onClick={handleSavePersonal}
                      startIcon={
                        !saveLoading ? (
                          <Save sx={{ color: "#FFF" }} />
                        ) : undefined
                      }
                      disabled={saveLoading}
                      fullWidth
                      height={44}
                      style={{ borderRadius: "12px" }}
                    />
                    <OutLineButton
                      onClick={() => {
                        setPersonalData(originalPersonalData);
                        setProfilePhotoPreview(
                          originalPersonalData.profilePhoto
                        );
                        setEditingPersonal(false);
                      }}
                      startIcon={<Cancel />}
                      fullWidth
                      sx={{ height: "44px" }}
                    >
                      Cancel
                    </OutLineButton>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card
              sx={{
                mb: 3,
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 95, 115, 0.12)",
                background: "#FFFFFF",
                border: "1px solid rgba(0, 95, 115, 0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Work sx={{ color: "#005F73" }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A1A",
                        fontFamily: "Faustina",
                      }}
                    >
                      Professional Details
                    </Typography>
                  </Box>

                  {!editingProfessional && (
                    <IconButton
                      onClick={() => setEditingProfessional(true)}
                      sx={{
                        backgroundColor: "#FF4F00",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#E87A42" },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      COACHING SPECIALTIES
                    </Typography>
                    <FormControl fullWidth disabled={!editingProfessional}>
                      <Select
                        multiple
                        value={professionalData.coachingSpecialties}
                        onChange={handleSpecialtiesChange}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                        sx={{
                          borderRadius: "12px",
                          backgroundColor: editingProfessional
                            ? "#fff"
                            : "#F8FAFB",
                        }}
                      >
                        {COACHING_SPECIALTIES.map((specialty) => (
                          <MenuItem key={specialty} value={specialty}>
                            {specialty}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      YEARS OF EXPERIENCE
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={professionalData.yearsOfExperience}
                      onChange={(e) =>
                        handleProfessionalInputChange(
                          "yearsOfExperience",
                          parseInt(e.target.value)
                        )
                      }
                      disabled={!editingProfessional}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: editingProfessional
                            ? "#fff"
                            : "#F8FAFB",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      LANGUAGES SPOKEN
                    </Typography>
                    <FormControl fullWidth disabled={!editingProfessional}>
                      <Select
                        multiple
                        value={professionalData.languagesSpoken}
                        onChange={handleLanguagesChange}
                        input={<OutlinedInput />}
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "12px",
                          backgroundColor: editingProfessional
                            ? "#fff"
                            : "#F8FAFB",
                        }}
                      >
                        {LANGUAGES.map((lang) => (
                          <MenuItem key={lang} value={lang}>
                            {lang}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      PROFESSIONAL BIO
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={professionalData.professionalBio}
                      onChange={(e) =>
                        handleProfessionalInputChange(
                          "professionalBio",
                          e.target.value
                        )
                      }
                      disabled={!editingProfessional}
                      placeholder="Tell us about your coaching approach and experience..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: editingProfessional
                            ? "#fff"
                            : "#F8FAFB",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {editingProfessional && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <ButtonSelfScore
                      text={
                        saveLoading ? (
                          <CircularProgress size={20} sx={{ color: "#fff" }} />
                        ) : (
                          "Save Changes"
                        )
                      }
                      onClick={handleSaveProfessional}
                      startIcon={
                        !saveLoading ? (
                          <Save sx={{ color: "#FFF" }} />
                        ) : undefined
                      }
                      disabled={saveLoading}
                      fullWidth
                      height={44}
                      style={{ borderRadius: "12px" }}
                    />
                    <OutLineButton
                      onClick={() => {
                        setProfessionalData(originalProfessionalData);
                        setEditingProfessional(false);
                      }}
                      startIcon={<Cancel />}
                      fullWidth
                      sx={{ height: "44px" }}
                    >
                      Cancel
                    </OutLineButton>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Certifications & Credentials - View Only with Admin Approval Notice */}
            <Card
              sx={{
                mb: 3,
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 95, 115, 0.12)",
                background: "#FFFFFF",
                border: "1px solid rgba(0, 95, 115, 0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <School sx={{ color: "#005F73" }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1A1A1A",
                      fontFamily: "Faustina",
                    }}
                  >
                    Certifications & Credentials
                  </Typography>
                </Box>

                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    borderRadius: "12px",
                    backgroundColor: "rgba(0, 95, 115, 0.08)",
                  }}
                >
                  Changes to certifications require admin approval. Please
                  contact support to update your credentials.
                </Alert>

                {consultant.certifications &&
                consultant.certifications.length > 0 ? (
                  <Stack spacing={2}>
                    {consultant.certifications.map(
                      (cert: any, index: number) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            backgroundColor: "#F8FAFB",
                            borderRadius: "12px",
                            border: "1px solid rgba(0, 95, 115, 0.1)",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, color: "#1A1A1A", mb: 0.5 }}
                          >
                            {cert.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#666", mb: 0.5 }}
                          >
                            {cert.issuingOrganization}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            Issued:{" "}
                            {new Date(cert.issueDate).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      )
                    )}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", textAlign: "center", py: 3 }}
                  >
                    No certifications added yet
                  </Typography>
                )}

                {consultant.resume && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      backgroundColor: "#F8FAFB",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      UPLOADED DOCUMENTS
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <InsertDriveFile sx={{ color: "#005F73" }} />
                      <Typography variant="body2" sx={{ color: "#1A1A1A" }}>
                        Resume/CV
                      </Typography>
                      <CheckCircle
                        sx={{
                          color: "#4CAF50",
                          ml: "auto",
                          fontSize: "1.2rem",
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Services & Pricing */}
            <Card
              sx={{
                mb: 3,
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 95, 115, 0.12)",
                background: "#FFFFFF",
                border: "1px solid rgba(0, 95, 115, 0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachMoney sx={{ color: "#005F73" }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A1A",
                        fontFamily: "Faustina",
                      }}
                    >
                      Services & Pricing
                    </Typography>
                  </Box>

                  {!editingServices && (
                    <IconButton
                      onClick={() => setEditingServices(true)}
                      sx={{
                        backgroundColor: "#FF4F00",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#E87A42" },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 1,
                      color: "#666",
                      fontWeight: 600,
                    }}
                  >
                    HOURLY RATE
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={servicesData.hourlyRate}
                    onChange={(e) =>
                      setServicesData((prev) => ({
                        ...prev,
                        hourlyRate: parseInt(e.target.value),
                      }))
                    }
                    disabled={!editingServices}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      endAdornment: (
                        <Typography sx={{ ml: 1, color: "#666" }}>
                          USD/hour
                        </Typography>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: editingServices ? "#fff" : "#F8FAFB",
                      },
                    }}
                  />
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mb: 2,
                    color: "#666",
                    fontWeight: 600,
                  }}
                >
                  SESSION TYPES OFFERED
                </Typography>

                <Stack spacing={2}>
                  {servicesData.services.map((service, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        backgroundColor: service.enabled
                          ? "#E8F5E9"
                          : "#F8FAFB",
                        borderRadius: "12px",
                        border: `1px solid ${
                          service.enabled ? "#4CAF50" : "rgba(0, 95, 115, 0.1)"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#1A1A1A" }}
                        >
                          {service.sessionType === "30min" && "Quick Check-in"}
                          {service.sessionType === "60min" &&
                            "Standard Session"}
                          {service.sessionType === "90min" &&
                            "In-depth Session"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          {service.duration} minutes
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "#FF4F00", mr: 2 }}
                        >
                          {service.duration} min
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={service.enabled}
                              onChange={() =>
                                handleServiceToggle(service.sessionType)
                              }
                              disabled={!editingServices}
                              sx={{
                                color: "#005F73",
                                "&.Mui-checked": { color: "#4CAF50" },
                              }}
                            />
                          }
                          label=""
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 1,
                      color: "#666",
                      fontWeight: 600,
                    }}
                  >
                    INTRODUCTION VIDEO
                  </Typography>
                  <TextField
                    fullWidth
                    value={servicesData.introductionVideoLink}
                    onChange={(e) =>
                      setServicesData((prev) => ({
                        ...prev,
                        introductionVideoLink: e.target.value,
                      }))
                    }
                    disabled={!editingServices}
                    placeholder="https://vimeo.com/your-video"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: editingServices ? "#fff" : "#F8FAFB",
                      },
                    }}
                  />
                </Box>

                {editingServices && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <ButtonSelfScore
                      text={
                        saveLoading ? (
                          <CircularProgress size={20} sx={{ color: "#fff" }} />
                        ) : (
                          "Save Changes"
                        )
                      }
                      onClick={handleSaveServices}
                      startIcon={
                        !saveLoading ? (
                          <Save sx={{ color: "#FFF" }} />
                        ) : undefined
                      }
                      disabled={saveLoading}
                      fullWidth
                      height={44}
                      style={{ borderRadius: "12px" }}
                    />
                    <OutLineButton
                      onClick={() => {
                        setServicesData(originalServicesData);
                        setEditingServices(false);
                      }}
                      startIcon={<Cancel />}
                      fullWidth
                      sx={{ height: "44px" }}
                    >
                      Cancel
                    </OutLineButton>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Calendar & Availability */}
            <Card
              sx={{
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 95, 115, 0.12)",
                background: "#FFFFFF",
                border: "1px solid rgba(0, 95, 115, 0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday sx={{ color: "#005F73" }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1A1A1A",
                        fontFamily: "Faustina",
                      }}
                    >
                      Calendar & Availability
                    </Typography>
                  </Box>

                  {!editingAvailability && (
                    <IconButton
                      onClick={() => setEditingAvailability(true)}
                      sx={{
                        backgroundColor: "#FF4F00",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#E87A42" },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </Box>

                {/* Google Calendar Connection Status */}
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: "#F8FAFB",
                    borderRadius: "12px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Connected Calendar
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Google Calendar
                        </Typography>
                        {consultant.googleCalendar?.isConnected && (
                          <CheckCircle
                            sx={{ color: "#4CAF50", fontSize: "1.2rem" }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: "#666" }}
                      >
                        Timezone
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {availabilityData.timezone}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Timezone Selection */}
                {editingAvailability && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      TIMEZONE
                    </Typography>
                    <TimezoneSelect
                      value={availabilityData.timezone}
                      onChange={(tz: any) =>
                        setAvailabilityData((prev) => ({
                          ...prev,
                          timezone: tz.value,
                        }))
                      }
                      styles={{
                        control: (base: any) => ({
                          ...base,
                          borderRadius: "12px",
                          minHeight: "48px",
                        }),
                      }}
                    />
                  </Box>
                )}

                {/* Weekly Availability */}
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mb: 2,
                    color: "#666",
                    fontWeight: 600,
                  }}
                >
                  WEEKLY AVAILABILITY
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack spacing={2}>
                    {availabilityData.availability.map((daySlot) => {
                      const dayInfo = DAYS_OF_WEEK.find(
                        (d) => d.value === daySlot.dayOfWeek
                      );
                      return (
                        <Paper
                          key={daySlot.dayOfWeek}
                          sx={{
                            p: 2,
                            backgroundColor: daySlot.isAvailable
                              ? "#fff"
                              : "#F5F5F5",
                            borderRadius: "12px",
                            border: "1px solid rgba(0, 95, 115, 0.1)",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600, minWidth: "100px" }}
                            >
                              {dayInfo?.label}
                            </Typography>

                            {editingAvailability && (
                              <Checkbox
                                checked={daySlot.isAvailable}
                                onChange={(e) =>
                                  handleAvailabilityChange(
                                    daySlot.dayOfWeek,
                                    "isAvailable",
                                    e.target.checked
                                  )
                                }
                                sx={{
                                  color: "#005F73",
                                  "&.Mui-checked": { color: "#4CAF50" },
                                }}
                              />
                            )}

                            {!editingAvailability && !daySlot.isAvailable && (
                              <Typography
                                variant="body2"
                                sx={{ color: "#999", fontStyle: "italic" }}
                              >
                                Unavailable
                              </Typography>
                            )}
                          </Box>

                          {daySlot.isAvailable && !editingAvailability && (
                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {daySlot.timeRanges.map((range, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${range.startTime} - ${range.endTime}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#E8F5E9",
                                    color: "#1A1A1A",
                                  }}
                                />
                              ))}
                            </Box>
                          )}

                          {daySlot.isAvailable && editingAvailability && (
                            <Stack spacing={1}>
                              {daySlot.timeRanges.map((range, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <TimePicker
                                    label="Start"
                                    value={dayjs(
                                      `2000-01-01T${range.startTime}`
                                    )}
                                    onChange={(newValue: Dayjs | null) => {
                                      if (newValue) {
                                        handleTimeRangeChange(
                                          daySlot.dayOfWeek,
                                          idx,
                                          "startTime",
                                          newValue.format("HH:mm")
                                        );
                                      }
                                    }}
                                    slotProps={{
                                      textField: {
                                        size: "small",
                                        sx: { flex: 1 },
                                      },
                                    }}
                                  />
                                  <Typography>-</Typography>
                                  <TimePicker
                                    label="End"
                                    value={dayjs(`2000-01-01T${range.endTime}`)}
                                    onChange={(newValue: Dayjs | null) => {
                                      if (newValue) {
                                        handleTimeRangeChange(
                                          daySlot.dayOfWeek,
                                          idx,
                                          "endTime",
                                          newValue.format("HH:mm")
                                        );
                                      }
                                    }}
                                    slotProps={{
                                      textField: {
                                        size: "small",
                                        sx: { flex: 1 },
                                      },
                                    }}
                                  />
                                  {daySlot.timeRanges.length > 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleRemoveTimeRange(
                                          daySlot.dayOfWeek,
                                          idx
                                        )
                                      }
                                      sx={{ color: "#F44336" }}
                                    >
                                      <Delete />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}

                              <Button
                                startIcon={<Add />}
                                onClick={() =>
                                  handleAddTimeRange(daySlot.dayOfWeek)
                                }
                                sx={{
                                  color: "#005F73",
                                  textTransform: "none",
                                  justifyContent: "flex-start",
                                }}
                              >
                                Add Time Range
                              </Button>
                            </Stack>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                </LocalizationProvider>

                {editingAvailability && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <ButtonSelfScore
                      text={
                        saveLoading ? (
                          <CircularProgress size={20} sx={{ color: "#fff" }} />
                        ) : (
                          "Save Changes"
                        )
                      }
                      onClick={handleSaveAvailability}
                      startIcon={
                        !saveLoading ? (
                          <Save sx={{ color: "#FFF" }} />
                        ) : undefined
                      }
                      disabled={saveLoading}
                      fullWidth
                      height={44}
                      style={{ borderRadius: "12px" }}
                    />
                    <OutLineButton
                      onClick={() => {
                        setAvailabilityData(originalAvailabilityData);
                        setEditingAvailability(false);
                      }}
                      startIcon={<Cancel />}
                      fullWidth
                      sx={{ height: "44px" }}
                    >
                      Cancel
                    </OutLineButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Email Verification Modal */}
        <EmailVerificationModal
          open={showEmailVerification}
          newEmail={pendingEmail}
          onClose={() => setShowEmailVerification(false)}
          onVerify={handleVerifyEmail}
        />

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={3000}
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSuccessMessage(false)}
            severity="success"
            sx={{ borderRadius: "12px" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setError("")}
            severity="error"
            sx={{ borderRadius: "12px" }}
          >
            {error}
          </Alert>
        </Snackbar>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmationModal
          open={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={async () => {
            setLogoutLoading(true);
            try {
              await consultantAuthService.logout();
              router.push("/consultant/login");
            } finally {
              setLogoutLoading(false);
              setShowLogoutModal(false);
            }
          }}
          loading={logoutLoading}
        />
      </Container>
    </Box>
  );
}
