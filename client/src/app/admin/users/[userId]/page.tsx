"use client";

import { Box, Typography, Container, Paper, Grid, Chip } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  TrendingUp,
  Assessment as AssessmentIcon,
  Layers,
} from "@mui/icons-material";
import { PaymentHistory } from "../../../../services/paymentService";
import OutLineButton from "@/app/components/ui/OutLineButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileUploadIcon from "@mui/icons-material/FileUploadOutlined";
import DownloadReportButton from "@/app/components/ui/DownloadReportButton";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  adminService,
  UserDetailResponse,
} from "../../../../services/adminService";

interface TestHistoryItem {
  _id: string;
  level: number;
  score: number;
  date: string;
  timeSpent?: string;
  attemptNumber?: number;
}

export default function AdminUserDetail() {
  const params = useParams();
  const userId = params.userId as string;

  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<
    PaymentHistory[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUserById(userId);
      setUserDetail(response);

      // Transform test history
      if (response.testHistory) {
        const history: TestHistoryItem[] = response.testHistory.map(
          (item: any, index: number) => {
            return {
              _id: item._id || `${userId}-level-${item.level}-${index}`,
              level: item.level,
              score: item.score,
              date: new Date(item.submittedAt).toLocaleDateString(),
              timeSpent: item.timeSpent
                ? `${Math.floor(item.timeSpent / 60)}m ${item.timeSpent % 60}s`
                : "N/A",
            };
          }
        );
        setTestHistory(history);
      }

      // Set transaction history
      if (response.paymentHistory) {
        const completedTransactions = response.paymentHistory.filter(
          (payment: any) => payment.status === "completed"
        );
        setTransactionHistory(completedTransactions);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userDetail) {
    return (
      <Container maxWidth="xl" sx={{ backgroundColor: "#ffffff", py: 14 }}>
        <Typography sx={{ textAlign: "center", color: "#6B7280" }}>
          Loading user details...
        </Typography>
      </Container>
    );
  }

  const user = userDetail.user;
  const completedLevels = user.progress?.completedLevels || [];
  const totalLevels = 4;

  // Get last test information
  const lastTest = testHistory.length > 0 ? testHistory[0] : null;
  const lastCompletedLevel =
    lastTest?.level || completedLevels[completedLevels.length - 1] || 1;
  const lastTestScore =
    lastTest?.score ||
    user.progress?.testScores?.[
      `level${lastCompletedLevel}` as keyof typeof user.progress.testScores
    ] ||
    0;
  const lastTestDate = lastTest?.date || new Date().toLocaleDateString();
  const scorePercentage = Math.round((lastTestScore / 900) * 100);

  // Format total revenue
  const totalRevenue = `$${(userDetail.totalRevenue / 100).toFixed(2)}`;

  return (
    <Container maxWidth="xl" sx={{ backgroundColor: "#ffffff", py: 4 }}>
      <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
        {/* Header Section - User Details */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            backgroundColor: "#FFF",
            borderRadius: "16px",
            border: "1px solid #3A3A3A4D",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: "#2B2B2B",
              fontSize: "24px",
              fontFamily: "Faustina",
              mb: 2,
            }}
          >
            User Details
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{ fontSize: "14px", color: "#6B7280", mb: 0.5 }}
                >
                  Username
                </Typography>
                <Typography
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#2B2B2B" }}
                >
                  {user.username}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{ fontSize: "14px", color: "#6B7280", mb: 0.5 }}
                >
                  Email
                </Typography>
                <Typography
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#2B2B2B" }}
                >
                  {user.email}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{ fontSize: "14px", color: "#6B7280", mb: 0.5 }}
                >
                  Phone Number
                </Typography>
                <Typography
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#2B2B2B" }}
                >
                  +{user.countryCode} {user.phoneNumber}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{ fontSize: "14px", color: "#6B7280", mb: 0.5 }}
                >
                  Registration Date
                </Typography>
                <Typography
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#2B2B2B" }}
                >
                  {new Date(user.createdAt || "").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{ fontSize: "14px", color: "#6B7280", mb: 0.5 }}
                >
                  Last Active
                </Typography>
                <Typography
                  sx={{ fontSize: "16px", fontWeight: 500, color: "#2B2B2B" }}
                >
                  {new Date(user.lastActive).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{ fontSize: "14px", color: "#6B7280", mb: 0.5 }}
                >
                  Status
                </Typography>
                <Chip
                  label={user.isVerified ? "Verified" : "Pending"}
                  sx={{
                    backgroundColor: user.isVerified
                      ? "#51BB0020"
                      : "#FFA50020",
                    color: user.isVerified ? "#51BB00" : "#FFA500",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Total Revenue Card (replaces Start Assessment) */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              sx={{
                p: 4,
                height: "100%",
                maxHeight: "204px",
                background: "#51BB00",
                color: "white",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 400, fontSize: "20px" }}
              >
                Total Revenue
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: "28px" }}
              >
                {totalRevenue}
              </Typography>
            </Paper>
          </Grid>

          {/* Levels Completed Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box
              sx={{
                p: 4,
                backgroundColor: "#F7F7F7",
                border: "1px solid #3A3A3A4D",
                height: "100%",
                maxHeight: "204px",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#FF4F00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 1,
                }}
              >
                <Layers sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 400, color: "#2B2B2B", fontSize: "20px" }}
              >
                Levels Completed ({completedLevels.length}/{totalLevels})
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                {[1, 2, 3, 4].map((level) => (
                  <Box
                    key={level}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {completedLevels.includes(level) ? (
                      <CheckCircle sx={{ fontSize: 40, color: "#51BB00E5" }} />
                    ) : (
                      <CheckCircle sx={{ fontSize: 40, color: "#D9D9D9" }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Last Test Score Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 4,
                height: "100%",
                maxHeight: "204px",
                borderRadius: 4,
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                border: "1px solid #3A3A3A4D",
                backgroundColor: "#F7F7F7",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 1, color: "#1e293b" }}
                >
                  Last Test Score
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 4, mb: 4 }}
                >
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Test Date: {lastTestDate}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AssessmentIcon sx={{ color: "#64748b", fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Level {lastCompletedLevel}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    mt: "auto",
                  }}
                >
                  <DownloadReportButton
                    userData={{
                      username: user.username,
                      email: user.email,
                      phoneNumber: user.phoneNumber || "",
                      reportDate: lastTestDate,
                      level: lastCompletedLevel,
                      score: lastTestScore,
                      maxScore: 900,
                    }}
                  />
                  <OutLineButton
                    startIcon={<RefreshIcon />}
                    style={{
                      background: "transparent",
                      color: "#374151",
                      border: "1px solid #939393",
                      borderRadius: "16px",
                      padding: "3.5px 14px",
                      fontWeight: 400,
                      fontSize: "18px",
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                    disabled
                  >
                    Retake
                  </OutLineButton>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ml: 4,
                }}
              >
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <Box
                    sx={{
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      background: `conic-gradient(#508B28 ${
                        scorePercentage * 3.6
                      }deg, #e5e7eb 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        backgroundColor: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: "#1e293b",
                          fontSize: "32px",
                        }}
                      >
                        {lastTestScore}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        out of 900
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Test History Section */}
        <Box
          sx={{
            p: 4,
            mt: 4,
            borderRadius: 4,
            border: "1px solid #3A3A3A4D",
            backgroundColor: "#FFF",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: "28px",
              color: "#000",
              fontFamily: "Faustina",
            }}
          >
            Test History
          </Typography>

          {testHistory.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                No test history yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {testHistory.map((test) => {
                const testScorePercentage = Math.round(
                  (test.score / 900) * 100
                );
                return (
                  <Box
                    key={test._id}
                    sx={{
                      display: "flex",
                      borderBottom: "1px solid #E0E0E0",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 3,
                      backgroundColor: "#FFF",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          backgroundColor: "#005F73",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 28, color: "white" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 400,
                            fontSize: "20px",
                            fontFamily: "Source Sans Pro",
                            color: "#3B3B3B",
                          }}
                        >
                          Level {test.level} Assessment
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: "14px",
                            fontFamily: "source Sans Pro",
                          }}
                        >
                          {test.date}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: "#3B3B3B4D",
                        mx: 10,
                      }}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography
                          sx={{
                            color: "#FF4F00",
                            fontWeight: 400,
                            mb: 0.5,
                            fontSize: "20px",
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Score: {test.score}/900 ({testScorePercentage}%)
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: "14px",
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Time: {test.timeSpent}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: "1px",
                          height: "40px",
                          backgroundColor: "#3B3B3B4D",
                          mx: 2,
                        }}
                      />

                      <Box
                        sx={{
                          width: 100,
                          height: 8,
                          backgroundColor: "#e2e8f0",
                          borderRadius: 4,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${testScorePercentage}%`,
                            height: "100%",
                            backgroundColor: "#FF4F00",
                            borderRadius: 4,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <DownloadReportButton
                          userData={{
                            username: user.username,
                            email: user.email,
                            phoneNumber: user.phoneNumber || "",
                            reportDate: test.date,
                            level: test.level,
                            score: test.score,
                            maxScore: 900,
                          }}
                        />
                        <OutLineButton
                          startIcon={<FileUploadIcon />}
                          style={{
                            background: "transparent",
                            color: "#FF4F00",
                            border: "1px solid #FF4F00",
                            borderRadius: "16px",
                            padding: "3.5px 14px",
                            fontWeight: 400,
                            fontSize: "18px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          Share
                        </OutLineButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Transaction History Section */}
        {transactionHistory.length > 0 && (
          <Box
            sx={{
              p: 4,
              mt: 4,
              borderRadius: 4,
              border: "1px solid #3A3A3A4D",
              backgroundColor: "#FFF",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: "28px",
                color: "#000",
                fontFamily: "Faustina",
              }}
            >
              Transaction History
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {transactionHistory.map((transaction) => {
                const transactionDate = new Date(transaction.createdAt);
                const formattedDate = transactionDate.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                );
                const formattedTime = transactionDate.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                );
                const fullDateTime = `${formattedDate}, ${formattedTime}`;
                const formattedAmount = `$${(transaction.amount / 100).toFixed(
                  2
                )}`;

                let levelsUnlocked = "";
                if (transaction.level === 2) {
                  levelsUnlocked = "Level 2";
                } else if (transaction.level === 3) {
                  levelsUnlocked = "Levels 2 & 3";
                } else if (transaction.level === 4) {
                  levelsUnlocked = "Levels 2, 3 & 4";
                }

                return (
                  <Box
                    key={transaction._id}
                    sx={{
                      display: "flex",
                      borderBottom: "1px solid #E0E0E0",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 3,
                      backgroundColor: "#FFF",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          backgroundColor: "#0C677A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PaymentIcon sx={{ fontSize: 28, color: "white" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: "20px",
                              fontFamily: "Source Sans Pro",
                              color: "#3B3B3B",
                            }}
                          >
                            {levelsUnlocked} Purchase
                          </Typography>
                          <Chip
                            label="PAID"
                            size="small"
                            sx={{
                              backgroundColor: "#51BB0020",
                              color: "#51BB00",
                              fontWeight: 600,
                              fontSize: "12px",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: "14px",
                            fontFamily: "source Sans Pro",
                          }}
                        >
                          {fullDateTime}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: "#3B3B3B4D",
                        mx: 10,
                      }}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Box sx={{ minWidth: 120 }}>
                        <Typography
                          sx={{
                            color: "#0C677A",
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: "20px",
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          {formattedAmount}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#3B3B3B99",
                            fontWeight: 400,
                            fontSize: "14px",
                            fontFamily: "Source Sans Pro",
                          }}
                        >
                          Transaction ID: {transaction._id.slice(-8)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: "1px",
                          height: "40px",
                          backgroundColor: "#3B3B3B4D",
                          mx: 2,
                        }}
                      />

                      <OutLineButton
                        startIcon={<ReceiptIcon />}
                        style={{
                          background: "transparent",
                          color: "#0C677A",
                          border: "1px solid #0C677A",
                          borderRadius: "16px",
                          padding: "3.5px 14px",
                          fontWeight: 400,
                          fontSize: "18px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onClick={() => {
                          if (transaction.receiptUrl) {
                            window.open(transaction.receiptUrl, "_blank");
                          } else {
                            alert("Receipt not available");
                          }
                        }}
                      >
                        Receipt
                      </OutLineButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}
