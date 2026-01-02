"use client";

import { useSearchParams } from "next/navigation";
import Level4TextTest from "./Level4TextTest";
import Level4VoiceTest from "./Level4VoiceTest";

// Level 5: AI Voice Interview (realtime voice interaction)
// Level 4: Text-based Mastery Test (coming soon)
// This component currently routes to Level 5 voice test
export default function Level4Test() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  // If mode=voice in URL, render voice test
  if (mode === "voice") {
    return <Level4VoiceTest />;
  }

  // Default to text mode
  return <Level4TextTest />;
}
