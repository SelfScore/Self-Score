import mongoose from "mongoose";
import Level5QuestionModel from "../models/level5Question";
import dbConnect from "../lib/dbConnect";

const LEVEL_5_QUESTIONS = [
  {
    questionId: "L5_Q1",
    questionText:
      "Tell me about a time when you had to make an important life decision under pressure. How did you handle it?",
    level: 5,
    order: 1,
  },
  {
    questionId: "L5_Q2",
    questionText:
      "Describe your current approach to maintaining work-life balance. What strategies work best for you?",
    level: 5,
    order: 2,
  },
  {
    questionId: "L5_Q3",
    questionText:
      "How do you typically respond when someone criticizes you? Can you share a specific example?",
    level: 5,
    order: 3,
  },
  {
    questionId: "L5_Q4",
    questionText:
      "What does emotional intelligence mean to you, and how do you practice it in your daily life?",
    level: 5,
    order: 4,
  },
  {
    questionId: "L5_Q5",
    questionText:
      "Tell me about a relationship conflict you've experienced recently. How did you work toward resolution?",
    level: 5,
    order: 5,
  },
  {
    questionId: "L5_Q6",
    questionText:
      "Describe a situation where you had to adapt to unexpected change. What was your process?",
    level: 5,
    order: 6,
  },
  {
    questionId: "L5_Q7",
    questionText:
      "How do you identify and manage stress in your life? What techniques do you find most effective?",
    level: 5,
    order: 7,
  },
  {
    questionId: "L5_Q8",
    questionText:
      "Tell me about a personal goal you're currently working toward. What's your strategy for achieving it?",
    level: 5,
    order: 8,
  },
  {
    questionId: "L5_Q9",
    questionText:
      "Describe a time when you felt overwhelmed. How did you recognize it and what did you do about it?",
    level: 5,
    order: 9,
  },
  {
    questionId: "L5_Q10",
    questionText:
      "How do you maintain your mental health and well-being? What practices are non-negotiable for you?",
    level: 5,
    order: 10,
  },
  {
    questionId: "L5_Q11",
    questionText:
      "Tell me about a time when you had to set boundaries with someone. How did that conversation go?",
    level: 5,
    order: 11,
  },
  {
    questionId: "L5_Q12",
    questionText:
      "Describe your relationship with failure. Can you share a recent failure and what you learned from it?",
    level: 5,
    order: 12,
  },
  {
    questionId: "L5_Q13",
    questionText:
      "How do you handle situations when your values conflict with others? Give me an example.",
    level: 5,
    order: 13,
  },
  {
    questionId: "L5_Q14",
    questionText:
      "Tell me about a time when you had to advocate for yourself. What made you speak up?",
    level: 5,
    order: 14,
  },
  {
    questionId: "L5_Q15",
    questionText:
      "Describe your process for making important decisions. What factors do you consider most?",
    level: 5,
    order: 15,
  },
  {
    questionId: "L5_Q16",
    questionText:
      "How do you nurture your important relationships? What do you do to maintain strong connections?",
    level: 5,
    order: 16,
  },
  {
    questionId: "L5_Q17",
    questionText:
      "Tell me about a belief or perspective you've changed in the past few years. What led to that shift?",
    level: 5,
    order: 17,
  },
  {
    questionId: "L5_Q18",
    questionText:
      "Describe how you handle disappointment. Can you share a recent example?",
    level: 5,
    order: 18,
  },
  {
    questionId: "L5_Q19",
    questionText:
      "What role does self-reflection play in your life? How often do you engage in it and what form does it take?",
    level: 5,
    order: 19,
  },
  {
    questionId: "L5_Q20",
    questionText:
      "Tell me about a time when you had to support someone through a difficult situation. How did you approach it?",
    level: 5,
    order: 20,
  },
  {
    questionId: "L5_Q21",
    questionText:
      "Describe a situation where you had to admit you were wrong. How did that feel and what did you learn?",
    level: 5,
    order: 21,
  },
  {
    questionId: "L5_Q22",
    questionText:
      "How do you define success in your life? Has this definition changed over time?",
    level: 5,
    order: 22,
  },
  {
    questionId: "L5_Q23",
    questionText:
      "Tell me about a time when you felt truly proud of yourself. What had you accomplished?",
    level: 5,
    order: 23,
  },
  {
    questionId: "L5_Q24",
    questionText:
      "Describe your approach to personal growth. What areas are you actively working on developing?",
    level: 5,
    order: 24,
  },
  {
    questionId: "L5_Q25",
    questionText:
      "Looking at your life holistically, what brings you the most meaning and fulfillment? Why?",
    level: 5,
    order: 25,
  },
];

async function seedLevel5Questions() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await dbConnect();

    console.log("🗑️  Clearing existing Level 5 questions...");
    await Level5QuestionModel.deleteMany({ level: 5 });

    console.log("📝 Inserting Level 5 questions...");
    await Level5QuestionModel.insertMany(LEVEL_5_QUESTIONS);

    console.log("✅ Successfully seeded 25 Level 5 questions!");

    // Verify
    const count = await Level5QuestionModel.countDocuments({ level: 5 });
    console.log(`✅ Verified: ${count} questions in database`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Level 5 questions:", error);
    process.exit(1);
  }
}

seedLevel5Questions();
