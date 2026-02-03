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

export default function PrivacyPolicy() {
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
              Privacy Policy
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2B2B2B",
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontFamily: "Source Sans Pro",
              }}
            >
              Last updated: November 13, 2025
            </Typography>
          </Box>

          <Divider sx={{ mb: 4, backgroundColor: "#E0E0E0" }} />

          {/* Content */}
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
              Introduction
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
              At SelfScore, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website and use our services.
            </Typography>
          </Box>

          {/* Information We Collect */}
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
              Information We Collect
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "600",
                color: "#2B2B2B",
                mb: 2,
                fontFamily: "Faustina",
              }}
            >
              Personal Information
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
              We may collect the following personal information:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Name, email address, and contact information"
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
                  primary="• Assessment responses and life scoring data"
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
                  primary="• Usage data and analytics information"
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
                  primary="• Device information and IP addresses"
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

          {/* How We Use Your Information */}
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
              How We Use Your Information
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
              We use your information for the following purposes:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• To provide and maintain our life scoring services"
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
                  primary="• To personalize your experience and recommendations"
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
                  primary="• To communicate with you about our services"
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
                  primary="• To improve our website and services"
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
                  primary="• To comply with legal obligations"
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
                  primary="• To read calendar availability and schedule consultation events on behalf of users who explicitly connect their Google Calendar"
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

          {/* Data Sharing and Disclosure */}
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
              Data Sharing and Disclosure
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
              SelfScore accesses Google Calendar event data only after explicit
              user consent for the purpose of:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Displaying availability for consultation booking"
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
                  primary="• Creating and managing consultation events on the consultant's calendar"
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
              We do not access calendar settings, contacts, emails, or other
              Google services.
            </Typography>
          </Box>

          {/* Data Security */}
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
              Data Security
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
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. These measures
              include:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Encryption of data in transit and at rest"
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
                  primary="• Regular security assessments and updates"
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
                  primary="• Access controls and authentication measures"
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
                  primary="• Secure data storage and backup procedures"
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

          {/* Your Rights */}
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
              Your Rights
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
              You have the following rights regarding your personal information:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Right to access your personal data"
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
                  primary="• Right to rectify inaccurate information"
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
                  primary="• Right to delete your personal data"
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
                  primary="• Right to restrict processing"
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
                  primary="• Right to data portability"
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
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
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
              Email: info@selfscore.net
              <br />
              Phone: +1 (561) 430-0610
              <br />
              Address: Charlottesville, Virginia, United States
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
            This Privacy Policy may be updated from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
