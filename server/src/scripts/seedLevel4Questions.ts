import mongoose from "mongoose";
import dotenv from "dotenv";
import Level4QuestionModel from "../models/level4Question";

dotenv.config();

/**
 * Seed 25 questions for Level 4 Realtime Voice Interview
 * Focus: Mental health, emotional intelligence, life management
 */
const level4Questions = [
  {
    questionId: "L4_Q1",
    questionText:
      "Tell me about a recent moment when you felt truly happy. What contributed to that feeling?",
    level: 4,
    order: 1,
  },
  {
    questionId: "L4_Q2",
    questionText:
      "Describe a challenging situation you've faced in the past month. How did you handle your emotions during that time?",
    level: 4,
    order: 2,
  },
  {
    questionId: "L4_Q3",
    questionText:
      "When you feel overwhelmed or stressed, what strategies do you typically use to calm yourself down?",
    level: 4,
    order: 3,
  },
  {
    questionId: "L4_Q4",
    questionText:
      "Can you share an example of a time when you successfully resolved a conflict with someone? What approach did you take?",
    level: 4,
    order: 4,
  },
  {
    questionId: "L4_Q5",
    questionText:
      "How do you maintain work-life balance? What does a healthy balance look like for you?",
    level: 4,
    order: 5,
  },
  {
    questionId: "L4_Q6",
    questionText:
      "Tell me about a personal goal you're currently working toward. What motivates you to pursue it?",
    level: 4,
    order: 6,
  },
  {
    questionId: "L4_Q7",
    questionText:
      "Describe your relationship with self-care. What activities help you recharge and feel your best?",
    level: 4,
    order: 7,
  },
  {
    questionId: "L4_Q8",
    questionText:
      "Think about a mistake or failure you've experienced. What did you learn from it, and how did it shape you?",
    level: 4,
    order: 8,
  },
  {
    questionId: "L4_Q9",
    questionText:
      "How do you typically respond when someone close to you is going through a difficult time?",
    level: 4,
    order: 9,
  },
  {
    questionId: "L4_Q10",
    questionText:
      "What role does physical health and wellness play in your daily life? How do you prioritize it?",
    level: 4,
    order: 10,
  },
  {
    questionId: "L4_Q11",
    questionText:
      "Describe a time when you had to make a difficult decision. What factors did you consider?",
    level: 4,
    order: 11,
  },
  {
    questionId: "L4_Q12",
    questionText:
      "How would you describe your emotional awareness? Can you give an example of recognizing and naming your emotions?",
    level: 4,
    order: 12,
  },
  {
    questionId: "L4_Q13",
    questionText:
      "Tell me about your support system. Who do you turn to when you need help or guidance?",
    level: 4,
    order: 13,
  },
  {
    questionId: "L4_Q14",
    questionText:
      "What does resilience mean to you? Can you share an experience where you demonstrated resilience?",
    level: 4,
    order: 14,
  },
  {
    questionId: "L4_Q15",
    questionText:
      "How do you handle criticism or negative feedback from others?",
    level: 4,
    order: 15,
  },
  {
    questionId: "L4_Q16",
    questionText:
      "Describe your sleeping patterns and how they affect your emotional well-being.",
    level: 4,
    order: 16,
  },
  {
    questionId: "L4_Q17",
    questionText:
      "What brings meaning and purpose to your life? How do you stay connected to that purpose?",
    level: 4,
    order: 17,
  },
  {
    questionId: "L4_Q18",
    questionText:
      "Tell me about a relationship in your life that you value deeply. What makes it meaningful to you?",
    level: 4,
    order: 18,
  },
  {
    questionId: "L4_Q19",
    questionText:
      "How do you deal with uncertainty or situations that are beyond your control?",
    level: 4,
    order: 19,
  },
  {
    questionId: "L4_Q20",
    questionText:
      "Describe your relationship with technology and social media. How does it impact your mental health?",
    level: 4,
    order: 20,
  },
  {
    questionId: "L4_Q21",
    questionText:
      "What are your thoughts on asking for help? Do you find it easy or difficult, and why?",
    level: 4,
    order: 21,
  },
  {
    questionId: "L4_Q22",
    questionText: "How do you celebrate your achievements, both big and small?",
    level: 4,
    order: 22,
  },
  {
    questionId: "L4_Q23",
    questionText:
      "Tell me about a time when you practiced forgiveness - either forgiving yourself or someone else.",
    level: 4,
    order: 23,
  },
  {
    questionId: "L4_Q24",
    questionText:
      "What habits or patterns in your life would you like to change? What's holding you back?",
    level: 4,
    order: 24,
  },
  {
    questionId: "L4_Q25",
    questionText:
      "Looking ahead, what does emotional well-being and life fulfillment mean to you?",
    level: 4,
    order: 25,
  },
];

async function seedLevel4Questions() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing Level 4 questions
    const deleteResult = await Level4QuestionModel.deleteMany({ level: 4 });
    console.log(
      `🗑️  Deleted ${deleteResult.deletedCount} existing Level 4 questions`
    );

    // Insert new 25 questions
    const insertResult = await Level4QuestionModel.insertMany(level4Questions);
    console.log(
      `✅ Successfully inserted ${insertResult.length} Level 4 questions`
    );

    // Verify insertion
    const count = await Level4QuestionModel.countDocuments({ level: 4 });
    console.log(`📊 Total Level 4 questions in database: ${count}`);

    // Display questions
    console.log("\n📋 Inserted Questions:");
    level4Questions.forEach((q, index) => {
      console.log(
        `${index + 1}. [${q.questionId}] ${q.questionText.substring(0, 60)}...`
      );
    });

    console.log("\n✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding Level 4 questions:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seed function
seedLevel4Questions();
