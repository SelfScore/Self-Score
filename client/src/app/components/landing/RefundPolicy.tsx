"use client";

import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function RefundPolicy() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9F8F6",
        py: { xs: 4, md: 8 },
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            backgroundColor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 4, md: 6 },
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 2,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                fontFamily: "Faustina",
              }}
            >
              Refund Policy
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontFamily: "Source Sans Pro",
              }}
            >
              Last updated: September 30, 2025
            </Typography>
          </Box>

          <Divider sx={{ mb: 4, backgroundColor: "#E0E0E0" }} />

          {/* Introduction */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Our Commitment
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              At SelfScore, we are committed to your satisfaction and personal
              growth journey. We understand that investing in personal
              development is important, and we want you to feel confident in
              your decision to use our services.
            </Typography>
          </Box>

          {/* Refund Eligibility */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Refund Eligibility
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              You may be eligible for a refund under the following
              circumstances:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Request made within 30 days of purchase"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Technical issues preventing access to services"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Service not delivered as described"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Duplicate charges or billing errors"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
            </List>
          </Box>

          {/* Non-Refundable Items */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Non-Refundable Services
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              The following services are generally non-refundable:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Completed assessment reports and analyses"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• One-on-one coaching sessions that have been attended"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Digital downloads and resources accessed"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Services requested after 30-day period"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
            </List>
          </Box>

          {/* Refund Process */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              How to Request a Refund
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              To request a refund, please follow these steps:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="1. Contact our support team at refunds@selfscore.com"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="2. Provide your order number and account details"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="3. Explain the reason for your refund request"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="4. Allow 5-7 business days for review and processing"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
            </List>
          </Box>

          {/* Processing Time */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Processing Time
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Once your refund request is approved:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Credit card refunds: 5-10 business days"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• PayPal refunds: 3-5 business days"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Bank transfers: 7-14 business days"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
            </List>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mt: 2,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Please note that processing times may vary depending on your
              financial institution.
            </Typography>
          </Box>

          {/* Partial Refunds */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Partial Refunds
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              In some cases, we may offer partial refunds for:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Partially used subscription services"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Unused portions of coaching packages"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Services affected by technical issues"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: "Source Sans Pro",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      color: "#2B2B2B",
                    },
                  }}
                />
              </ListItem>
            </List>
          </Box>

          {/* Cancellation Policy */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Cancellation Policy
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              You can cancel your subscription or recurring services at any time
              through your account settings or by contacting our support team.
              Cancellations will take effect at the end of your current billing
              cycle.
            </Typography>
          </Box>

          {/* Exceptional Circumstances */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Exceptional Circumstances
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                mb: 3,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              We understand that life can present unexpected challenges. In
              cases of serious illness, financial hardship, or other exceptional
              circumstances, we encourage you to contact us to discuss your
              situation. We will review each case individually and may offer
              alternative solutions.
            </Typography>
          </Box>

          {/* Contact Information */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#005F73",
                mb: 3,
                fontFamily: "Faustina",
              }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                lineHeight: 1.7,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              For refund requests or questions about our refund policy, please
              contact us:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#E87A42",
                fontWeight: "600",
                mt: 2,
                fontFamily: "Source Sans Pro",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Email: refunds@selfscore.com
              <br />
              Phone: +1 (234) 567-8900
              <br />
              Address: 123 Personal Growth Ave, Suite 456, Development City, DC
              12345
              <br />
              Business Hours: Monday - Friday, 9:00 AM - 6:00 PM EST
            </Typography>
          </Box>

          <Divider sx={{ mb: 4, backgroundColor: "#E0E0E0" }} />

          <Typography
            variant="body2"
            sx={{
              color: "#2B2B2B",
              textAlign: "center",
              fontStyle: "italic",
              fontFamily: "Source Sans Pro",
            }}
          >
            This Refund Policy may be updated from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the "Last updated" date.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
