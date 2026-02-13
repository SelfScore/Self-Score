"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Box,
  Container,
  Paper,
  LinearProgress,
  Typography,
  Chip,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import Step1PersonalInfo from "./Step1PersonalInfo";
import Step2Professional from "./Step2Professional";
import Step3Certifications from "./Step3Certifications";
import Step4Services from "./Step4Services";
import Step5Calendar from "./Step5Calendar";
import {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  consultantAuthService,
} from "../../../services/consultantAuthService";

const STEPS = [
  { number: 1, label: "Personal Info", color: "#005F73" },
  { number: 2, label: "Professional", color: "#005F73" },
  { number: 3, label: "Certifications", color: "#005F73" },
  { number: 4, label: "Services", color: "#005F73" },
  { number: 5, label: "Calendar", color: "#005F73" },
];

function ConsultantRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [consultantId, setConsultantId] = useState<string>("");

  // Store data from each step
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Omit<
    Step2Data,
    "consultantId"
  > | null>(null);
  const [step3Data, setStep3Data] = useState<Omit<
    Step3Data,
    "consultantId"
  > | null>(null);
  const [step4Data, setStep4Data] = useState<Omit<
    Step4Data,
    "consultantId"
  > | null>(null);

  // Set mounted flag on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved progress from sessionStorage and URL params (client-side only)
  useEffect(() => {
    if (!mounted) return;

    // First, check URL query params
    const stepParam = searchParams.get("step");
    const savedConsultantId = sessionStorage.getItem("consultantId");

    if (stepParam) {
      const stepNumber = parseInt(stepParam);
      if (stepNumber >= 1 && stepNumber <= 5) {
        setCurrentStep(stepNumber);
        sessionStorage.setItem("consultantCurrentStep", stepParam);
      }
    } else {
      // Fallback to sessionStorage if no URL param
      const savedStep = sessionStorage.getItem("consultantCurrentStep");
      if (savedStep) {
        setCurrentStep(parseInt(savedStep));
      }
    }

    if (savedConsultantId) {
      setConsultantId(savedConsultantId);
    }

    // Load saved data from each step
    const saved1 = sessionStorage.getItem("consultantStep1");
    const saved2 = sessionStorage.getItem("consultantStep2");
    const saved3 = sessionStorage.getItem("consultantStep3");
    const saved4 = sessionStorage.getItem("consultantStep4");

    if (saved1) setStep1Data(JSON.parse(saved1));
    if (saved2) setStep2Data(JSON.parse(saved2));
    if (saved3) setStep3Data(JSON.parse(saved3));
    if (saved4) setStep4Data(JSON.parse(saved4));
  }, [mounted, searchParams]);

  // Fetch consultant data from database if sessionStorage is empty (returning user)
  useEffect(() => {
    if (!mounted || !consultantId) return;

    // Check if we already have data in sessionStorage
    const hasSessionData = sessionStorage.getItem("consultantStep1");

    // If no session data, fetch from database
    if (!hasSessionData) {
      fetchConsultantDataFromDatabase();
    }
  }, [mounted, consultantId]);

  const fetchConsultantDataFromDatabase = async () => {
    try {
      const response = await consultantAuthService.getCurrentConsultant();

      if (response.success && response.data) {
        const transformed = consultantAuthService.transformConsultantDataToSteps(
          response.data
        );

        // Set state for each step
        setStep1Data(transformed.step1Data);
        setStep2Data(transformed.step2Data);
        setStep3Data(transformed.step3Data);
        setStep4Data(transformed.step4Data);

        // Save to sessionStorage for future navigation
        sessionStorage.setItem(
          "consultantStep1",
          JSON.stringify(transformed.step1Data)
        );
        sessionStorage.setItem(
          "consultantStep2",
          JSON.stringify(transformed.step2Data)
        );
        sessionStorage.setItem(
          "consultantStep3",
          JSON.stringify(transformed.step3Data)
        );
        sessionStorage.setItem(
          "consultantStep4",
          JSON.stringify(transformed.step4Data)
        );
      }
    } catch (error) {
      console.error("Failed to fetch consultant data from database:", error);
      // Don't show error to user - they can still proceed with empty forms
    }
  };

  // Update URL when step changes
  useEffect(() => {
    if (!mounted) return;

    sessionStorage.setItem("consultantCurrentStep", currentStep.toString());
    router.replace(`/consultant/register?step=${currentStep}`, {
      scroll: false,
    });
  }, [currentStep, router, mounted]);

  const handleStep1Complete = (data: Step1Data, newConsultantId: string) => {
    setStep1Data(data);
    setConsultantId(newConsultantId);
    sessionStorage.setItem("consultantId", newConsultantId);
    sessionStorage.setItem("consultantStep1", JSON.stringify(data));
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: Omit<Step2Data, "consultantId">) => {
    setStep2Data(data);
    sessionStorage.setItem("consultantStep2", JSON.stringify(data));
    setCurrentStep(3);
  };

  const handleStep3Complete = (data: Omit<Step3Data, "consultantId">) => {
    setStep3Data(data);
    sessionStorage.setItem("consultantStep3", JSON.stringify(data));
    setCurrentStep(4);
  };

  const handleStep4Complete = (data: Omit<Step4Data, "consultantId">) => {
    // Save Step 4 data to sessionStorage
    sessionStorage.setItem("consultantStep4", JSON.stringify(data));
    // Move to Step 5 (Calendar)
    setCurrentStep(5);
  };

  const handleCalendarComplete = () => {
    // Clear registration session storage
    sessionStorage.removeItem("consultantCurrentStep");
    sessionStorage.removeItem("consultantId");
    sessionStorage.removeItem("consultantStep1");
    sessionStorage.removeItem("consultantStep2");
    sessionStorage.removeItem("consultantStep3");
    sessionStorage.removeItem("consultantStep4");

    // Show success state briefly before redirecting
    setCurrentStep(6); // Use step 6 to show success message

    // Redirect to consultant dashboard after a longer delay to ensure cookie is set
    setTimeout(() => {
      router.push("/consultant/dashboard");
    }, 2500);
  };

  const handlePrevious = (step: number) => {
    setCurrentStep(step - 1);
  };

  const progressPercentage = ((currentStep - 1) / 5) * 100;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9F9F9",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Faustina",
              fontSize: { xs: "28px", md: "36px" },
              fontWeight: 700,
              color: "#1A1A1A",
              mb: 1,
              mt: 8,
            }}
          >
            Become a SelfScore Coach
          </Typography>
          <Typography
            sx={{
              fontFamily: "Source Sans Pro",
              fontSize: { xs: "14px", md: "16px" },
              color: "#666",
            }}
          >
            Join our community of certified wellness coaches and help others
            achieve their goals
          </Typography>
        </Box>

        {/* Progress Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #E0E0E0",
          }}
        >
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
                fontSize: "14px",
                fontWeight: 600,
                color: "#666",
              }}
            >
              Step {currentStep <= 5 ? currentStep : 5} of 5
            </Typography>
            <Typography
              sx={{
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                fontWeight: 600,
                color: "#005F73",
              }}
            >
              {progressPercentage.toFixed(0)}% Complete
            </Typography>
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#E0E0E0",
              mb: 3,
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#005F73",
                borderRadius: 4,
              },
            }}
          />

          {/* Step Labels */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {STEPS.map((step) => (
              <Chip
                key={step.number}
                label={step.label}
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: { xs: "11px", sm: "13px" },
                  fontWeight: currentStep === step.number ? 600 : 400,
                  backgroundColor:
                    currentStep === step.number
                      ? "#005F73"
                      : currentStep > step.number
                        ? "#E8F4F8"
                        : "#F5F5F5",
                  color:
                    currentStep === step.number
                      ? "white"
                      : currentStep > step.number
                        ? "#005F73"
                        : "#999",
                  border:
                    currentStep === step.number
                      ? "none"
                      : currentStep > step.number
                        ? "1px solid #005F73"
                        : "1px solid #E0E0E0",
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Step Content */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #E0E0E0",
          }}
        >
          {currentStep === 1 && (
            <Step1PersonalInfo
              onNext={handleStep1Complete}
              initialData={step1Data || undefined}
            />
          )}

          {currentStep === 2 && consultantId && (
            <Step2Professional
              consultantId={consultantId}
              onNext={handleStep2Complete}
              onPrevious={() => handlePrevious(2)}
              initialData={step2Data || undefined}
            />
          )}

          {currentStep === 3 && consultantId && (
            <Step3Certifications
              consultantId={consultantId}
              onNext={handleStep3Complete}
              onPrevious={() => handlePrevious(3)}
              initialData={step3Data || undefined}
            />
          )}

          {currentStep === 4 && consultantId && (
            <Step4Services
              consultantId={consultantId}
              onComplete={handleStep4Complete}
              onPrevious={() => handlePrevious(4)}
              initialData={step4Data || undefined}
            />
          )}

          {currentStep === 5 && consultantId && (
            <Step5Calendar
              consultantId={consultantId}
              onComplete={handleCalendarComplete}
              onPrevious={() => handlePrevious(5)}
            />
          )}

          {currentStep === 6 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#E8F5E9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Typography sx={{ fontSize: "48px" }}>✓</Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Faustina",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  mb: 2,
                }}
              >
                Registration Complete!
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "16px",
                  color: "#666",
                  mb: 1,
                }}
              >
                Thank you for applying to become a wellness coach.
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  color: "#999",
                }}
              >
                Redirecting to your dashboard...
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default function ConsultantRegisterPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F9F9F9",
          }}
        >
          <LinearProgress sx={{ width: "300px" }} />
        </Box>
      }
    >
      <ConsultantRegisterContent />
    </Suspense>
  );
}
