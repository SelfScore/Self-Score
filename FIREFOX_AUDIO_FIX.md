# Firefox Audio Compatibility Fix

## Issue

When using **Firefox**, the Level 4 voice-to-text (text mode) and Level 5 real-time voice interview would crash with:

```
DOMException: AudioContext.createMediaStreamSource: Connecting AudioNodes from
AudioContexts with different sample-rate is currently not supported.
```

**Chrome and Safari** worked fine. Additionally, even after fixing the crash, Firefox exhibited **voice breaking and overlapping** during AI audio playback in Level 5.

---

## Root Cause

### 1. Microphone Capture Crash

The code created an `AudioContext` with a hardcoded sample rate of `16000` Hz and then connected the microphone stream to it via `createMediaStreamSource()`. Firefox's microphone hardware runs at a native rate (typically `48000` Hz). Firefox **does not support** connecting a `MediaStreamSource` (at 48000 Hz) to an `AudioContext` at a different rate (16000 Hz), unlike Chrome/Safari which handle this transparently.

### 2. AI Voice Playback Quality (Level 5)

The AI playback `AudioContext` was originally at `{ sampleRate: 24000 }` (matching Gemini's output). When we initially changed it to the native rate for Firefox compatibility, it introduced resampling that caused chunk scheduling jitter — resulting in breaks and overlapping audio.

---

## Solution

### Files Modified

| File | Change |
|------|--------|
| `client/src/app/user/test/Level4VoiceTest.tsx` | Mic capture fix + AI playback fix + audio compatibility check |
| `client/src/app/user/test/Level4TextTest.tsx` | Mic capture fix (voice-to-text) |

### Fix 1: Microphone Capture (Both Files)

- Removed `sampleRate: 16000` from `getUserMedia()` and `AudioContext` constructor
- `AudioContext` now uses the **hardware's native sample rate** (e.g., 48000 Hz)
- Added **JavaScript-based downsampling** (linear interpolation) from native → 16000 Hz inside `onaudioprocess` before sending PCM to the backend
- Backend still receives 16000 Hz PCM — **zero backend changes needed**

### Fix 2: AI Audio Playback (Level4VoiceTest.tsx only)

- Kept `AudioContext({ sampleRate: 24000 })` for the AI playback context — this is safe because it only uses `createBufferSource()`, not `createMediaStreamSource()`
- This means Gemini's 24000 Hz PCM chunks play at their native rate with **no resampling**, ensuring gapless scheduling
- The Firefox `DOMException` only applies to `createMediaStreamSource`, not `createBufferSource`

### Fix 3: Audio Compatibility Warning (Level4VoiceTest.tsx only)

Since Firefox still has minor voice quality issues (scheduling jitter) that can't be fully eliminated without a major audio pipeline rewrite, an **audio compatibility check** was added:

- Before the interview session starts, the component tests if `createMediaStreamSource()` works on a cross-rate `AudioContext`
- **Chrome/Safari**: Test passes → interview starts immediately
- **Firefox**: Test throws → a warning dialog appears with:
  - Message explaining potential audio quality issues
  - Recommendation to use Chrome or Safari
  - **"Go Back"** button to return
  - **"Continue Anyway"** button to proceed despite the warning

---

## Architecture Summary

```
Microphone (native rate, e.g. 48000 Hz)
    │
    ▼
AudioContext (native rate) ──► createMediaStreamSource ✅ (no cross-rate issue)
    │
    ▼
ScriptProcessor (onaudioprocess)
    │  ↓ JS downsample: 48000 → 16000 Hz
    ▼
WebSocket ──► Backend (receives 16000 Hz PCM)


Gemini AI Response (24000 Hz PCM)
    │
    ▼
AudioContext ({ sampleRate: 24000 }) ──► createBufferSource ✅ (no cross-rate issue)
    │  ↓ No resampling needed (rates match)
    ▼
Speaker output (24000 Hz, gapless)
```

---

## Browser Compatibility Result

| Feature | Chrome | Safari | Firefox |
|---------|--------|--------|---------|
| Level 4 Text Mode (voice-to-text) | ✅ | ✅ | ✅ |
| Level 5 Voice Interview (mic) | ✅ | ✅ | ✅ |
| Level 5 AI Voice Playback | ✅ Perfect | ✅ Perfect | ⚠️ Minor quality issues (warning shown) |
