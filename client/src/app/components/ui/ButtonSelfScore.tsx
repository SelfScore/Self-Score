import React from "react";

interface ButtonSelfScoreProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  maxWidth?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  padding?: string;
  gap?: number | string;
  background?: string;
  opacity?: number;
  style?: React.CSSProperties;
  text: string;
  textStyle?: React.CSSProperties;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const ButtonSelfScore: React.FC<ButtonSelfScoreProps> = ({
  maxWidth = 322,
  height = 40,
  borderRadius = 12,
  padding = "10px 32px",
  gap = 10,
  background = "#FF4F00",
  opacity = 1,
  style,
  text,
  textStyle,
  startIcon,
  endIcon,
  ...rest
}) => {
  return (
    <button
      style={{
        maxWidth,
        height,
        borderRadius,
        padding,
        gap,
        background,
        opacity,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "140px",
        fontSize: "clamp(14px, 2.5vw, 20px)",
        transition: "all 0.3s ease",
        ...style,
      }}
      {...rest}
    >
      {startIcon && <span style={{ marginRight: gap }}>{startIcon}</span>}
      <span
        style={{
          color: "#fff",
          fontWeight: 400,
          fontSize: "clamp(14px, 2.5vw, 20px)",
          fontFamily: "Source Sans Pro",
          ...textStyle,
        }}
      >
        {text}
      </span>
      {endIcon && <span style={{ marginLeft: gap }}>{endIcon}</span>}
    </button>
  );
};

export default ButtonSelfScore;
