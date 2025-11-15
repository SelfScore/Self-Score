# Level 4 AI Interview Integration - Setup Guide

## 🎯 Overview

This guide covers the complete implementation of the Level 4 Mastery Test with AI-powered interviews. The system supports both **Text Mode** (written responses) and **Voice Mode** (AI voice interview) for comprehensive life management assessment.

---

## ✅ What Has Been Implemented

### 1. **Backend (Server)**

#### MongoDB Models

- **`aiInterview.ts`** - Stores interview sessions with questions, answers, and transcripts
- **`aiFeedback.ts`** - Stores AI-generated feedback with category scores and recommendations

#### API Routes (`/api/ai-interview`)

- `POST /start` - Start new interview or resume existing
- `POST /submit-answer` - Submit text answer
- `POST /add-transcript` - Add voice transcript entry
- `POST /complete` - Complete interview and generate feedback
- `GET /feedback/:interviewId` - Get feedback for completed interview
- `GET /:interviewId` - Get interview details
- `GET /history/all` - Get user's interview history

#### Controllers

- **`aiInterview.controller.ts`** - All interview logic, Gemini AI integration, feedback generation
- Automatic progress tracking (marks Level 4 as completed)
- Calculates and stores test score in user profile

### 2. **Frontend (Client)**

#### Components

- **`Level4Test.tsx`** - Mode selection UI (Text vs Voice)
- **`Level4TextTest.tsx`** - Text-based interview with 8 subjective questions
- **`Level4VoiceTest.tsx`** - Voice-based interview using Web Speech API
- **`feedback/page.tsx`** - Comprehensive feedback display with categories, scores, and recommendations

#### Services

- **`aiInterviewService.ts`** - API client for all AI interview operations

#### Features

- Auto-save functionality for text answers
- Real-time voice recognition and transcription
- Browser-based text-to-speech (no external API needed)
- Progress tracking with visual indicators
- Detailed feedback with 5 assessment categories

### 3. **AI Integration**

#### Google Gemini AI

- Question generation (8 subjective questions)
- Response analysis (both text and voice)
- Feedback generation with structured output
- 5 assessment categories:
  1. Emotional Intelligence
  2. Decision-Making Skills
  3. Life Balance & Management
  4. Self-Awareness & Growth
  5. Resilience & Stress Management

---

## 🚀 Setup Instructions

### 1. **Install Dependencies**

Already completed ✅

```bash
# Server
cd server
npm install @google/generative-ai

# Client
cd client
npm install @elevenlabs/client  # Optional - not currently used
```

### 2. **Configure Environment Variables**

#### Server (`.env`)

Add your Google Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get Gemini API Key:**

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key or use existing one
3. Copy and paste into `.env` file

#### Client (`.env.local`)

No additional variables needed! Voice functionality uses browser APIs.

### 3. **Start the Servers**

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

---

## 📋 Testing the Flow

### Test Scenario 1: Text Mode

1. **Login** as a user who has:

   - Purchased Level 4 ($25 bundle)
   - Completed Level 3

2. **Navigate** to Test Page:

   ```
   http://localhost:3000/user/test?level=4
   ```

3. **Select** "Text Mode"

4. **Answer** the 8 subjective questions:

   - Each question appears one at a time
   - Answers auto-save as you navigate
   - Minimum 50 characters recommended per answer
   - Can navigate back/forth between questions

5. **Submit** when all questions answered

6. **View Feedback**:
   - Overall score (0-100)
   - 5 category breakdowns
   - Strengths (3+)
   - Areas for improvement (3+)
   - Personalized recommendations (4+)

### Test Scenario 2: Voice Mode

1. **Ensure** you're using **Chrome or Edge** browser (best Web Speech API support)

2. **Allow** microphone access when prompted

3. **Select** "Voice Mode"

4. **Click** "Start Voice Interview"

5. **Listen** to AI reading questions (uses browser TTS)

6. **Speak** your answers when the microphone icon appears

7. **Wait** for AI to process and ask next question

8. **Complete** all 8 questions

9. **View** the same comprehensive feedback

---

## 🎨 User Experience Flow

```
Level 4 Test Access (paid)
         ↓
   Mode Selection
    ↙         ↘
Text Mode    Voice Mode
    ↓            ↓
8 Questions   AI Interview
    ↓            ↓
   Complete ← Complete
         ↓
    AI Analysis
         ↓
  Feedback Report
         ↓
  Progress Updated
```

---

## 🔧 Technical Architecture

### Text Mode Flow

```
User → Frontend → API (submit-answer) → MongoDB (save)
                                              ↓
User completes all → API (complete) → Gemini AI → Feedback
                                              ↓
                                         Update Progress
```

### Voice Mode Flow

```
User speaks → Web Speech API → Transcript → API (add-transcript) → MongoDB
                                                                        ↓
All questions done → API (complete) → Gemini AI → Feedback
                                                      ↓
                                                Update Progress
```

---

## 📊 Database Schema

### AIInterview Collection

```javascript
{
  userId: ObjectId,
  level: 4,
  mode: "TEXT" | "VOICE",
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED",
  questions: [{
    questionId: String,
    questionText: String,
    questionOrder: Number
  }],
  answers: [{
    questionId: String,
    answerText: String,
    timestamp: Date
  }],
  transcript: [{ // Voice mode only
    role: "user" | "assistant",
    content: String,
    timestamp: Date
  }],
  startedAt: Date,
  completedAt: Date,
  feedbackId: ObjectId
}
```

### AIFeedback Collection

```javascript
{
  userId: ObjectId,
  interviewId: ObjectId,
  level: 4,
  totalScore: Number, // 0-100
  categoryScores: [{
    name: String,
    score: Number,
    comment: String
  }],
  strengths: [String],
  areasForImprovement: [String],
  finalAssessment: String,
  recommendations: [String],
  createdAt: Date
}
```

---

## 🛠️ Customization Guide

### Modify Questions

Edit `server/src/controllers/aiInterview.controller.ts`:

```typescript
const LEVEL_4_QUESTIONS = [
  {
    questionId: "L4_Q1",
    questionText: "Your custom question here?",
    questionOrder: 1,
  },
  // Add or modify questions
];
```

### Adjust AI Prompt

Modify the feedback generation prompt in `generateFeedback()` function:

```typescript
const prompt = `
You are an expert life coach...
[Customize the AI's evaluation approach]
`;
```

### Change Assessment Categories

Update both:

1. Controller prompt (what categories to evaluate)
2. Frontend display (feedback page rendering)

---

## 🐛 Troubleshooting

### Voice Mode Issues

**Problem:** "Speech recognition not supported"

- **Solution:** Use Chrome, Edge, or Safari (not Firefox)

**Problem:** Microphone not working

- **Solution:** Check browser permissions, ensure HTTPS in production

**Problem:** AI voice not speaking

- **Solution:** Check browser sound settings, may need user interaction first

### API Issues

**Problem:** "Failed to generate feedback"

- **Solution:** Check Gemini API key is valid and has quota

**Problem:** Interview not saving

- **Solution:** Check MongoDB connection, user authentication

### Progress Not Updating

**Problem:** Level 4 still shows as not completed

- **Solution:** Check user progress update logic in controller, verify Level 3 completion

---

## 🔐 Security Considerations

1. **Authentication:** All routes protected with `authMiddleware`
2. **User Verification:** Interview belongs to authenticated user
3. **Data Validation:** All inputs validated before processing
4. **API Key:** Gemini key stored server-side only
5. **MongoDB:** User data properly scoped and validated

---

## 📈 Performance Optimization

- Answers auto-save to prevent data loss
- Feedback generated asynchronously
- Transcript entries batched for voice mode
- Progress updates don't block response

---

## 🎯 Next Steps / Enhancements

### Potential Improvements:

1. **ElevenLabs Integration** - Replace browser TTS with high-quality AI voices
2. **Multi-language Support** - Support interviews in multiple languages
3. **Interview Analytics** - Admin dashboard to view interview completion rates
4. **Custom Question Sets** - Allow admins to create custom question sets
5. **Interview Scheduling** - Allow users to schedule interview sessions
6. **Video Recording** - Optional video recording for deeper analysis
7. **Peer Comparison** - Compare scores with anonymized peer data
8. **Follow-up Interviews** - Periodic re-assessment to track growth

---

## 📞 Support

For issues or questions:

1. Check console logs (browser & server)
2. Verify environment variables
3. Check MongoDB connection
4. Verify Gemini API quota
5. Test with simple questions first

---

## ✨ Success!

Your Level 4 AI Interview system is now fully operational! Users can:

- ✅ Choose between text and voice modes
- ✅ Complete comprehensive life mastery assessment
- ✅ Receive detailed AI-powered feedback
- ✅ Track progress and scores
- ✅ View personalized recommendations

**Happy Testing! 🚀**
