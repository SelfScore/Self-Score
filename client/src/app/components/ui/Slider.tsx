import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import SliderTab from "@mui/material/Slider";

function valuetext(value: number) {
  return `${value}`;
}

interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label = "",
  disabled = false,
}) => {
  // Internal state for when no external value is provided
  const [internalValue, setInternalValue] = useState<number>(5);

  // Use external value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (event: Event, newValue: number | number[]) => {
    const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;

    // Update internal state if no external onChange is provided
    if (value === undefined) {
      setInternalValue(singleValue);
    }

    // Call external onChange if provided
    onChange?.(singleValue);
  };

  return (
    <Box
      sx={{
        my: 3,
        px: 2,
        py: 4,
        backgroundColor: "#fff",
        borderRadius: "15px",
        boxShadow: "0 2px 8px rgba(0, 95, 115, 0.1)",
        border: "1px solid #E5E7EB",
      }}
    >
      {label && (
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: "#005F73",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {label}
        </Typography>
      )}

    <Box
      sx={{
        width: "100%",
        maxWidth: 500,
        mx: "auto",
        px: 2,
      }}
    >
      <SliderTab
        value={currentValue}
        onChange={handleChange}
        getAriaValueText={valuetext}
        valueLabelDisplay="on"
        step={step}
        marks={Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => ({
        value: min + i * step,
        label: (min + i * step).toString(),
        }))}
        min={min}
        max={max}
        disabled={disabled}
        sx={{
        color: "#005F73",
        height: 8,
        "& .MuiSlider-track": {
          backgroundColor: "#005F73",
          border: "none",
          height: 8,
          borderRadius: 4,
        },
        "& .MuiSlider-rail": {
          backgroundColor: "#E5E7EB",
          height: 8,
          borderRadius: 4,
        },
        "& .MuiSlider-thumb": {
          backgroundColor: "#005F73",
          border: "3px solid #fff",
          boxShadow: "0 2px 8px rgba(0, 95, 115, 0.3)",
          width: 24,
          height: 24,
          "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
            boxShadow: "0 0 0 8px rgba(0, 95, 115, 0.16)",
            backgroundColor: "#005F73",
          },
          "&:before": {
            display: "none",
          },
        },
        "& .MuiSlider-valueLabel": {
          backgroundColor: "#005F73",
          borderRadius: "8px",
          padding: "4px 8px",
          fontSize: "0.875rem",
          fontWeight: 600,
          "&:before": {
            borderTop: "8px solid #005F73",
          },
        },
        "& .MuiSlider-mark": {
          backgroundColor: "#005F73",
          height: 12,
          width: 3,
          borderRadius: 1,
          "&.MuiSlider-markActive": {
            backgroundColor: "#fff",
          },
        },
        "& .MuiSlider-markLabel": {
          color: "#666",
          fontSize: "0.875rem",
          fontWeight: 500,
          marginTop: 2,
        },
        "&.Mui-disabled": {
          color: "#ccc",
          "& .MuiSlider-track": {
            backgroundColor: "#ccc",
          },
          "& .MuiSlider-thumb": {
            backgroundColor: "#ccc",
            border: "3px solid #fff",
          },
        },
        }}
      />
    </Box>

      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          px: 2,
          color: "#666",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        <Typography variant="caption" sx={{ color: "#666" }}>
          Strongly Disagree
        </Typography>
        <Typography variant="caption" sx={{ color: "#666" }}>
          Strongly Agree
        </Typography>
      </Box> */}
    </Box>
  );
};

export default Slider;
