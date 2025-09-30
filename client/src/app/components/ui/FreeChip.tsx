import React from "react";

const chipStyle: React.CSSProperties = {
  width: 36,
  height: 10,
  position: "absolute",
  opacity: 1,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#278CA14D",
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#005F73F2",
  marginLeft: 82,
  zIndex: 10,
};

const textStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: 8,
  fontWeight: 600,
  letterSpacing: 1,
  lineHeight: 1,
};

const FreeChip: React.FC = () => (
  <div style={chipStyle}>
    <span style={textStyle}>FREE</span>
  </div>
);

export default FreeChip;
