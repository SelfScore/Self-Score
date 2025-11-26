"use client";

import Level4TextTest from "./Level4TextTest";

// ✅ Level 4 now directly uses Text Mode (no mode selection)
// Voice Mode code kept in Level4VoiceTest.tsx for future use (not imported)

export default function Level4Test() {
  // Directly render text test - no mode selection needed
  return <Level4TextTest />;
}
