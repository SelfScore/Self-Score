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

export default function TermandConditions() {
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
              Terms and Conditions
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
              Welcome to SelfScore
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
              These Terms and Conditions ("Terms") govern your use of the
              SelfScore website and services operated by SelfScore ("us", "we",
              or "our"). By accessing or using our service, you agree to be
              bound by these Terms.
            </Typography>
          </Box>

          {/* Acceptance of Terms */}
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
              Acceptance of Terms
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
              By accessing and using SelfScore, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree
              to abide by the above, please do not use this service.
            </Typography>
          </Box>

          {/* Use License */}
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
              Use License
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
              Permission is granted to temporarily download one copy of
              SelfScore materials for personal, non-commercial transitory
              viewing only. This is the grant of a license, not a transfer of
              title, and under this license you may not:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Modify or copy the materials"
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
                  primary="• Use the materials for any commercial purpose or for any public display"
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
                  primary="• Attempt to reverse engineer any software contained on the website"
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
                  primary="• Remove any copyright or other proprietary notations from the materials"
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

          {/* User Accounts */}
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
              User Accounts
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
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. You are
              responsible for:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Safeguarding your password and account information"
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
                  primary="• All activities that occur under your account"
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
                  primary="• Notifying us immediately of any unauthorized use"
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

          {/* Service Usage */}
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
              Service Usage
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
              Our life scoring assessments are designed for personal development
              purposes. You agree to:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• Provide honest and accurate responses to assessments"
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
                  primary="• Use the service for personal development only"
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
                  primary="• Not share your account credentials with others"
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
                  primary="• Respect the intellectual property rights of our content"
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

          {/* Prohibited Uses */}
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
              Prohibited Uses
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
              You may not use our service:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary="• For any unlawful purpose or to solicit others to perform unlawful acts"
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
                  primary="• To violate any international, federal, provincial, or state regulations or laws"
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
                  primary="• To transmit or procure the sending of any advertising or promotional material"
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
                  primary="• To impersonate or attempt to impersonate the company, employees, or other users"
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

          {/* Disclaimer */}
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
              Disclaimer
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
              The information on this website is provided on an "as is" basis.
              To the fullest extent permitted by law, this Company excludes all
              representations, warranties, conditions and terms related to our
              website and the use of this website.
            </Typography>
          </Box>

          {/* Limitations */}
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
              Limitations
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
              In no event shall SelfScore or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use SelfScore materials, even if SelfScore or an
              authorized representative has been notified orally or in writing
              of the possibility of such damage.
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
              Contact Information
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
              If you have any questions about these Terms and Conditions, please
              contact us at:
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
            These Terms and Conditions may be updated from time to time. We will
            notify you of any changes by posting the new Terms and Conditions on
            this page.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
