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
        fontSize: { xs: "1rem", md: "20px" },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default OutLineButton;
