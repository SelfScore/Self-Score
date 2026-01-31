import React from "react";

interface ButtonSelfScoreProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string | React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  textStyle?: React.CSSProperties;
  iconGap?: number | string;
  // Style shortcuts (can be overridden by style prop)
  maxWidth?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  padding?: string;
  gap?: number | string;
  background?: string;
  opacity?: number;
  fullWidth?: boolean;
  fontSize?: string | number;
}

const ButtonSelfScore: React.FC<ButtonSelfScoreProps> = ({
  text,
  startIcon,
  endIcon,
  textStyle,
  iconGap,
  maxWidth = 322,
  height = 44,
  borderRadius = 12,
  padding = "10px 32px",
  gap = 5,
  background = "#FF4F00",
  opacity = 1,
  fullWidth = false,
  fontSize,
  style,
  ...rest
}) => {
  const defaultFontSize = fontSize || "18px";
  const actualIconGap = iconGap !== undefined ? iconGap : gap;

  // Default button styles - can be completely overridden by style prop
  const defaultStyles: React.CSSProperties = {
    maxWidth: fullWidth ? "100%" : maxWidth,
    width: fullWidth ? "100%" : undefined,
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
    minWidth: fullWidth ? undefined : "120px",
    fontSize: defaultFontSize,
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  };

  // Default text styles - can be completely overridden by textStyle prop
  const defaultTextStyles: React.CSSProperties = {
    color: "#fff",
    fontWeight: 400,
    fontSize: defaultFontSize,
    fontFamily: "Source Sans Pro",
    whiteSpace: "nowrap",
  };

  return (
    <button
      style={{
        ...defaultStyles,
        ...style, // Custom styles override defaults
      }}
      {...rest}
    >
      {startIcon && (
        <span
          style={{
            marginRight: actualIconGap,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {startIcon}
        </span>
      )}
      <span
        style={{
          ...defaultTextStyles,
          ...textStyle, // Custom text styles override defaults
          display: "flex",
          alignItems: "center",
        }}
      >
        {text}
      </span>
      {endIcon && (
        <span
          style={{
            marginLeft: actualIconGap,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {endIcon}
        </span>
      )}
    </button>
  );
};

export default ButtonSelfScore;
