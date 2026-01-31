import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

const OutLineButton: React.FC<ButtonProps> = ({ children, sx, ...props }) => {
  return (
    <Button
      variant="outlined"
      sx={{
        borderRadius: "12px",
        border: "1px solid #FF4F00",
        color: "#FF4F00",
        fontWeight: 400,
        textTransform: "none",
        fontSize: "18px",
        height: "44px",
        minHeight: "44px",
        padding: "10px 32px",
        minWidth: { xs: "100px", md: "120px" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        "& .MuiButton-startIcon": {
          margin: 0,
          display: "flex",
          alignItems: "center",
        },
        "& .MuiButton-endIcon": {
          margin: 0,
          display: "flex",
          alignItems: "center",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default OutLineButton;
