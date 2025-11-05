import { Box, Typography } from "@mui/material";
import React, { useState, useRef } from "react";
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
  // Initialize to midpoint so users can select min value (0) immediately
  const [internalValue, setInternalValue] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Use external value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (_event: Event, newValue: number | number[]) => {
    const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;

    // Update internal state if no external onChange is provided
    if (value === undefined) {
      setInternalValue(singleValue);
    }

    // Call external onChange if provided
    onChange?.(singleValue);
  };

  // Handle clicks on the rail to allow selecting any value including current one
  const handleRailClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;

    // Calculate the value based on click position
    let clickedValue = min + percentage * (max - min);

    // Round to nearest step
    clickedValue = Math.round(clickedValue / step) * step;

    // Clamp to min/max
    clickedValue = Math.max(min, Math.min(max, clickedValue));

    // Update internal state if no external onChange is provided
    if (value === undefined) {
      setInternalValue(clickedValue);
    }

    // Always call onChange, even if value hasn't changed
    onChange?.(clickedValue);
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
        ref={sliderRef}
        onClick={handleRailClick}
        sx={{
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          px: 2,
          position: "relative",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <SliderTab
          value={currentValue}
          onChange={handleChange}
          getAriaValueText={valuetext}
          valueLabelDisplay="on"
          step={step}
          marks={Array.from(
            { length: Math.floor((max - min) / step) + 1 },
            (_, i) => {
              const value = min + i * step;
              return {
                value: value,
                label: value.toString(),
              };
            }
          )}
          min={min}
          max={max}
          disabled={disabled}
          sx={{
            color: "#005F73",
            height: 8,
            pointerEvents: "none", // Disable default slider interaction
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
              pointerEvents: "auto", // Re-enable for thumb dragging
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
              pointerEvents: "auto", // Re-enable for label clicking
              cursor: disabled ? "default" : "pointer",
              "&:hover": {
                color: disabled ? "#666" : "#005F73",
                fontWeight: 600,
              },
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

        {/* Descriptive labels below 0, 5, and 10 */}
        <Box
          sx={{
            position: "relative",
            mt: 2,
            width: "100%",
          }}
        >
          {/* Label at 0 - Never / Not at all */}
          <Box
            sx={{
              position: "absolute",
              left: "0%",
              transform: "translateX(-60%)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#888",
                fontSize: "0.7rem",
                fontWeight: 400,
                display: "block",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              Never
            </Typography>
          </Box>

          {/* Label at 5 - Sometimes / Neutral */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#888",
                fontSize: "0.7rem",
                fontWeight: 400,
                display: "block",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              Sometimes
            </Typography>
          </Box>

          {/* Label at 10 - Always / Fully */}
          <Box
            sx={{
              position: "absolute",
              right: "0%",
              transform: "translateX(60%)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#888",
                fontSize: "0.7rem",
                fontWeight: 400,
                display: "block",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                textAlign: "right",
              }}
            >
              Always
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Slider;
