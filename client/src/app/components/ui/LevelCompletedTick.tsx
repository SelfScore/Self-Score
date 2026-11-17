import CheckIcon from "@mui/icons-material/Check";

/**
 * Plain tick shown on a level tab once that level is completed. Sits where the
 * lock icon goes and is styled the same way (same size, inherits the tab colour).
 */
export default function LevelCompletedTick() {
  return (
    <CheckIcon
      aria-label="Completed"
      sx={{
        fontSize: { xs: "16px", md: "20px" },
        color: "inherit",
      }}
    />
  );
}
