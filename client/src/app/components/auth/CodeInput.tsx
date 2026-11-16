"use client";

import { useRef } from "react";
import { Box, TextField } from "@mui/material";

interface CodeInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  /** Called when all 6 digits are filled */
  onComplete?: (code: string) => void;
}

/** Six single-digit boxes with auto-advance, backspace and paste support */
export default function CodeInput({ value, onChange, disabled, onComplete }: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const update = (next: string[]) => {
    onChange(next);
    if (next.every((d) => d !== "")) onComplete?.(next.join(""));
  };

  const handleChange = (index: number, raw: string) => {
    // Some mobile keyboards autofill all digits into one box
    const digits = raw.replace(/\D/g, "");
    if (digits.length > 1) {
      const next = [...value];
      for (let i = 0; i < digits.length && index + i < 6; i++) next[index + i] = digits[i];
      update(next);
      refs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    if (raw && !/^\d$/.test(raw)) return;
    const next = [...value];
    next[index] = raw;
    update(next);
    if (raw && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    update(next);
    const nextEmpty = next.findIndex((d) => !d);
    refs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  return (
    <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, justifyContent: "center" }}>
      {value.map((digit, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          slotProps={{
            htmlInput: {
              maxLength: 6,
              inputMode: "numeric",
              autoComplete: index === 0 ? "one-time-code" : "off",
              "aria-label": `Digit ${index + 1}`,
              style: { textAlign: "center", fontSize: "22px", fontWeight: 600, padding: 0 },
            },
          }}
          sx={{
            width: { xs: 42, sm: 52 },
            "& .MuiOutlinedInput-root": {
              height: { xs: 48, sm: 56 },
              borderRadius: "8px",
              "& fieldset": { border: "1px solid #3A3A3A4D" },
              "&.Mui-focused fieldset": { border: "2px solid #FF5722" },
            },
          }}
        />
      ))}
    </Box>
  );
}
