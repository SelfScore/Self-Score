"use client";

import { useState, useEffect, useRef } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import { placesService, PlaceSuggestion } from "@/services/placesService";

interface GooglePlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    sx?: any;
}

export default function GooglePlacesAutocomplete({
    value,
    onChange,
    error,
    placeholder = "Search for your location",
    disabled = false,
    sx = {},
}: GooglePlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const [options, setOptions] = useState<PlaceSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Debounced autocomplete search
    useEffect(() => {
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Don't search if input is too short
        if (inputValue.length < 2) {
            setOptions([]);
            return;
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await placesService.autocomplete(inputValue);
                if (response.success && response.data) {
                    setOptions(response.data);
                } else {
                    setOptions([]);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [inputValue]);

    return (
        <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(option) =>
                typeof option === "string" ? option : option.description
            }
            value={value}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
                onChange(newInputValue);
            }}
            onChange={(_, newValue) => {
                if (typeof newValue === "string") {
                    onChange(newValue);
                } else if (newValue) {
                    onChange(newValue.description);
                }
            }}
            loading={loading}
            disabled={disabled}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={placeholder}
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            backgroundColor: disabled ? "#F5F5F5" : "#FFF",
                            borderRadius: "8px",
                            height: "48px",
                            "& fieldset": {
                                borderColor: "#3A3A3A4D",
                                borderWidth: "1px",
                            },
                        },
                        ...sx,
                    }}
                />
            )}
        />
    );
}
