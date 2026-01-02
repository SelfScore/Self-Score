"use client";

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    IconButton,
} from "@mui/material";
import { Close, Logout } from "@mui/icons-material";
import ButtonSelfScore from "./ButtonSelfScore";
import OutLineButton from "./OutLineButton";

interface LogoutConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    title?: string;
    message?: string;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = "Confirm Logout",
    message = "Are you sure you want to log out of your account?",
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(0, 95, 115, 0.15)",
                    background: "#FFFFFF",
                    border: "1px solid rgba(0, 95, 115, 0.08)",
                    p: 1,
                },
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    color: "#666",
                    "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                }}
            >
                <Close />
            </IconButton>

            {/* Icon and Title */}
            <DialogTitle sx={{ textAlign: "center", pt: 4, pb: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Logout sx={{ fontSize: 32, color: "#D32F2F" }} />
                    </Box>
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: "#1A1A1A",
                        fontFamily: "Faustina",
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                >
                    {title}
                </Typography>
            </DialogTitle>

            {/* Message */}
            <DialogContent sx={{ textAlign: "center", pb: 2 }}>
                <Typography
                    variant="body1"
                    sx={{
                        color: "#666",
                        fontFamily: "Source Sans Pro",
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                    }}
                >
                    {message}
                </Typography>
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    justifyContent: "center",
                    gap: 2,
                    px: 3,
                    pb: 3,
                    flexDirection: { xs: "column", sm: "row" },
                }}
            >
                <OutLineButton
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        minWidth: { xs: "100%", sm: 140 },
                        height: "44px",
                        fontFamily: "Source Sans Pro",
                        fontSize: "1rem",
                    }}
                >
                    Cancel
                </OutLineButton>

                <ButtonSelfScore
                    text={loading ? "Logging out..." : "Logout"}
                    onClick={onConfirm}
                    disabled={loading}
                    startIcon={!loading ? <Logout sx={{ color: "#FFF" }} /> : undefined}
                    fullWidth={false}
                    height={44}
                    background="#D32F2F"
                    style={{
                        minWidth: 140,
                        borderRadius: "12px",
                        fontFamily: "Source Sans Pro",
                        fontSize: "1rem",
                        opacity: loading ? 0.7 : 1,
                    }}
                />
            </DialogActions>
        </Dialog>
    );
};

export default LogoutConfirmationModal;
