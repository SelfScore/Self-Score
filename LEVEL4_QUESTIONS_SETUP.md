# Level 4 Questions - MongoDB Setup Guide

## Overview

Level 4 questions are now stored in MongoDB instead of being hardcoded. This allows for easier management and updates.

## Database Collection

- **Collection Name:** `level4questions`
- **Model:** `Level4Question` (server/src/models/level4Question.ts)

## Schema Structure

```typescript
{
  questionId: String,      // Unique identifier (e.g., "L4_Q1")
  questionText: String,    // The actual question text
  level: Number,           // Always 4
  order: Number,           // Display order (1-8)
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## How to Add Questions to MongoDB

### Option 1: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to your database
3. Find or create the `level4questions` collection
4. Click "Add Data" → "Insert Document"
5. Copy and paste the JSON below
6. Click "Insert"

### Option 2: Using MongoDB Shell

```bash
mongosh
use your_database_name
db.level4questions.insertMany([...paste JSON below...])
```

### Option 3: Using Studio 3T or Similar Tools

Import the JSON array directly into the `level4questions` collection.

---

## JSON Data to Insert

Copy this entire JSON array and insert it into your MongoDB:

```json
[
  {
    "questionId": "L4_Q1",
    "questionText": "Describe a recent challenging situation in your life. How did you identify and manage your emotions during this experience?",
    "level": 4,
    "order": 1
  },
  {
    "questionId": "L4_Q2",
    "questionText": "Tell me about a time when you had to make a difficult decision that significantly impacted your life. What was your decision-making process?",
    "level": 4,
    "order": 2
  },
  {
    "questionId": "L4_Q3",
    "questionText": "How do you currently balance different aspects of your life (work, relationships, personal growth, health)? What strategies do you use?",
    "level": 4,
    "order": 3
  },
  {
    "questionId": "L4_Q4",
    "questionText": "Describe your approach to setting and achieving long-term goals. Can you share an example of a goal you've successfully achieved?",
    "level": 4,
    "order": 4
  },
  {
    "questionId": "L4_Q5",
    "questionText": "How do you handle stress and prevent burnout in your daily life? What self-care practices do you follow?",
    "level": 4,
    "order": 5
  },
  {
    "questionId": "L4_Q6",
    "questionText": "Tell me about a relationship conflict you've experienced. How did you approach resolution and what did you learn from it?",
    "level": 4,
    "order": 6
  },
  {
    "questionId": "L4_Q7",
    "questionText": "What does emotional intelligence mean to you? How do you practice it in your daily interactions?",
    "level": 4,
    "order": 7
  },
  {
    "questionId": "L4_Q8",
    "questionText": "Describe a significant personal transformation or growth you've experienced. What triggered it and how did you navigate through it?",
    "level": 4,
    "order": 8
  }
]
```

---

## Verification

After inserting the questions, verify they were added correctly:

### Using MongoDB Compass

1. Navigate to the `level4questions` collection
2. You should see 8 documents
3. Verify each has the correct `order` (1-8) and `questionId` (L4_Q1 to L4_Q8)

### Using MongoDB Shell

```bash
db.level4questions.find({ level: 4 }).sort({ order: 1 })
```

You should see all 8 questions sorted by order.

---

## What Changed in the Code

### Files Created

1. **`server/src/models/level4Question.ts`** - New Mongoose model for Level 4 questions

### Files Modified

1. **`server/src/controllers/aiInterview.controller.ts`**
   - Removed hardcoded `LEVEL_4_QUESTIONS` array
   - Added `Level4QuestionModel` import
   - Updated `startInterview` function to fetch questions from database
   - Added validation to ensure questions exist before creating interview

### How It Works Now

1. User starts Level 4 test (text or voice mode)
2. Backend calls `Level4QuestionModel.find({ level: 4 }).sort({ order: 1 })`
3. Questions are fetched from MongoDB in correct order
4. Interview is created with these questions
5. If no questions found, user gets error message to contact admin

---

## Benefits of Database Storage

✅ Easy to update questions without code changes  
✅ Can add new questions or modify existing ones via MongoDB  
✅ Centralized question management  
✅ Can track question changes with timestamps  
✅ Can add more metadata to questions in the future

---

## Future Enhancements (Optional)

You can extend the schema to include:

- `category` - Question category (emotional intelligence, decision-making, etc.)
- `difficulty` - Question difficulty level
- `tags` - Array of tags for better organization
- `isActive` - Boolean to enable/disable questions
- `version` - Track question versions over time

---

## Troubleshooting

### Issue: "Level 4 questions not found in database"

**Solution:** Make sure you've inserted the 8 questions into MongoDB using the JSON above.

### Issue: Questions appear in wrong order

**Solution:** Check the `order` field in each document. Should be 1-8.

### Issue: Duplicate questionId error

**Solution:** The `questionId` field is unique. Make sure you're not inserting duplicate questions.

---

## Contact

If you encounter any issues, check:

1. MongoDB connection is working
2. All 8 questions are inserted
3. Each question has correct `level: 4` and `order: 1-8`
4. `questionId` values are unique (L4_Q1 through L4_Q8)
