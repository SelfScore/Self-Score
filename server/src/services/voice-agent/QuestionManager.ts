/**
 * Question Manager
 * Manages interview questions storage and access
 */

import { InterviewQuestion } from './types';

/**
 * Default interview questions (25 questions)
 * These can be loaded from database or config file
 */
const DEFAULT_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
    {
        id: 'q1',
        order: 1,
        text: 'Can you tell me about yourself and what brings you here today?',
        category: 'introduction',
        expectedAspects: ['background', 'motivation', 'current situation']
    },
    {
        id: 'q2',
        order: 2,
        text: 'How would you describe your overall mood and emotional state over the past few weeks?',
        category: 'emotional_state',
        expectedAspects: ['mood description', 'duration', 'fluctuations']
    },
    {
        id: 'q3',
        order: 3,
        text: 'What are the main challenges or difficulties you are currently facing in your life?',
        category: 'challenges',
        expectedAspects: ['specific challenges', 'impact', 'duration']
    },
    {
        id: 'q4',
        order: 4,
        text: 'How has your sleep been lately? Can you describe your typical sleep patterns?',
        category: 'sleep',
        expectedAspects: ['sleep quality', 'duration', 'issues']
    },
    {
        id: 'q5',
        order: 5,
        text: 'How would you describe your energy levels throughout the day?',
        category: 'energy',
        expectedAspects: ['energy description', 'variations', 'impact on activities']
    },
    {
        id: 'q6',
        order: 6,
        text: 'Can you tell me about your eating habits and appetite recently?',
        category: 'appetite',
        expectedAspects: ['eating patterns', 'appetite changes', 'concerns']
    },
    {
        id: 'q7',
        order: 7,
        text: 'How would you describe your relationships with family members?',
        category: 'relationships',
        expectedAspects: ['family dynamics', 'quality of relationships', 'any conflicts']
    },
    {
        id: 'q8',
        order: 8,
        text: 'Tell me about your social life and friendships. How connected do you feel to others?',
        category: 'social',
        expectedAspects: ['social activities', 'friendship quality', 'sense of connection']
    },
    {
        id: 'q9',
        order: 9,
        text: 'How do you typically handle stress or difficult situations?',
        category: 'coping',
        expectedAspects: ['coping strategies', 'effectiveness', 'healthy vs unhealthy']
    },
    {
        id: 'q10',
        order: 10,
        text: 'What activities or hobbies do you enjoy? How often do you engage in them?',
        category: 'interests',
        expectedAspects: ['specific activities', 'frequency', 'enjoyment level']
    },
    {
        id: 'q11',
        order: 11,
        text: 'How would you describe your work or academic life currently?',
        category: 'work_academic',
        expectedAspects: ['current situation', 'satisfaction', 'challenges']
    },
    {
        id: 'q12',
        order: 12,
        text: 'Can you tell me about any significant life events that have happened recently?',
        category: 'life_events',
        expectedAspects: ['specific events', 'emotional impact', 'coping']
    },
    {
        id: 'q13',
        order: 13,
        text: 'How do you feel about your physical health overall?',
        category: 'physical_health',
        expectedAspects: ['health status', 'concerns', 'self-care']
    },
    {
        id: 'q14',
        order: 14,
        text: 'What are your thoughts about the future? How do you see things going forward?',
        category: 'future_outlook',
        expectedAspects: ['expectations', 'hopes', 'concerns']
    },
    {
        id: 'q15',
        order: 15,
        text: 'How do you typically make decisions? What factors do you consider?',
        category: 'decision_making',
        expectedAspects: ['decision process', 'confidence', 'challenges']
    },
    {
        id: 'q16',
        order: 16,
        text: 'Can you describe a time when you felt really good about yourself?',
        category: 'self_esteem',
        expectedAspects: ['specific situation', 'feelings', 'contributing factors']
    },
    {
        id: 'q17',
        order: 17,
        text: 'What do you consider your greatest strengths?',
        category: 'strengths',
        expectedAspects: ['specific strengths', 'how they help', 'self-awareness']
    },
    {
        id: 'q18',
        order: 18,
        text: 'What areas of your life would you most like to improve or change?',
        category: 'growth_areas',
        expectedAspects: ['specific areas', 'motivation', 'barriers']
    },
    {
        id: 'q19',
        order: 19,
        text: 'How do you typically express your emotions? Do you find it easy or difficult?',
        category: 'emotional_expression',
        expectedAspects: ['expression style', 'comfort level', 'challenges']
    },
    {
        id: 'q20',
        order: 20,
        text: 'What gives you a sense of purpose or meaning in life?',
        category: 'purpose',
        expectedAspects: ['sources of meaning', 'values', 'fulfillment']
    },
    {
        id: 'q21',
        order: 21,
        text: 'How do you typically react when things don\'t go as planned?',
        category: 'adaptability',
        expectedAspects: ['reaction patterns', 'flexibility', 'recovery']
    },
    {
        id: 'q22',
        order: 22,
        text: 'Can you tell me about your support system? Who do you turn to when you need help?',
        category: 'support_system',
        expectedAspects: ['support sources', 'accessibility', 'quality']
    },
    {
        id: 'q23',
        order: 23,
        text: 'What are your goals for the near future? What would you like to achieve?',
        category: 'goals',
        expectedAspects: ['specific goals', 'motivation', 'action plans']
    },
    {
        id: 'q24',
        order: 24,
        text: 'How satisfied are you with your life overall right now?',
        category: 'life_satisfaction',
        expectedAspects: ['satisfaction level', 'contributing factors', 'areas for improvement']
    },
    {
        id: 'q25',
        order: 25,
        text: 'Is there anything else you would like to share or discuss that we haven\'t covered?',
        category: 'closing',
        expectedAspects: ['additional concerns', 'final thoughts', 'questions']
    }
];

export class QuestionManager {
    private questions: InterviewQuestion[];

    constructor(questions?: InterviewQuestion[]) {
        this.questions = questions || [...DEFAULT_INTERVIEW_QUESTIONS];
    }

    /**
     * Get all questions
     */
    getAllQuestions(): InterviewQuestion[] {
        return [...this.questions];
    }

    /**
     * Get question by index (0-24)
     */
    getQuestionByIndex(index: number): InterviewQuestion | null {
        if (index < 0 || index >= this.questions.length) {
            return null;
        }
        return { ...this.questions[index] };
    }

    /**
     * Get question by ID
     */
    getQuestionById(id: string): InterviewQuestion | null {
        const question = this.questions.find(q => q.id === id);
        return question ? { ...question } : null;
    }

    /**
     * Get total number of questions
     */
    getTotalQuestions(): number {
        return this.questions.length;
    }

    /**
     * Get question text by index (for AI instruction)
     */
    getQuestionText(index: number): string | null {
        const question = this.getQuestionByIndex(index);
        return question ? question.text : null;
    }

    /**
     * Get expected aspects for a question
     */
    getExpectedAspects(index: number): string[] {
        const question = this.getQuestionByIndex(index);
        return question?.expectedAspects || [];
    }

    /**
     * Load questions from external source
     */
    static async loadFromDatabase(): Promise<QuestionManager> {
        // TODO: Implement database loading
        // For now, return default questions
        return new QuestionManager();
    }

    /**
     * Create with custom questions
     */
    static createWithQuestions(questions: InterviewQuestion[]): QuestionManager {
        return new QuestionManager(questions);
    }
}

// Export default questions for testing
export { DEFAULT_INTERVIEW_QUESTIONS };
