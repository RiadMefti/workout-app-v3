import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Centralized AI provider configuration using GitHub Models
 *
 * This configuration is used across all AI features in the application:
 * - Chat interface for workout coaching
 * - AI-generated workout routine creation
 * - Exercise recommendations
 *
 * Using GitHub Models with OpenAI-compatible interface for GPT-4.1
 */

/**
 * Get the configured AI provider instance
 * @throws {Error} if GITHUB_TOKEN is not configured
 */
export function getAIProvider() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is not configured. Please add it to your .env file."
    );
  }

  return createOpenAICompatible({
    name: "github-models",
    baseURL: "https://models.github.ai/inference",
    apiKey: token,
  });
}

/**
 * Default AI model to use across the application
 */
export const DEFAULT_AI_MODEL = "openai/gpt-4.1";

/**
 * AI generation settings for different use cases
 */
export const AI_SETTINGS = {
  /**
   * Settings for workout routine generation
   * Higher temperature for more creative/varied workout plans
   */
  routineGeneration: {
    temperature: 0.7,
    maxTokens: 2000,
  },

  /**
   * Settings for chat interactions
   * Moderate temperature for balanced responses
   */
  chat: {
    temperature: 0.6,
    maxTokens: 1500,
  },

  /**
   * Settings for exercise recommendations
   * Lower temperature for more consistent/predictable recommendations
   */
  exerciseRecommendation: {
    temperature: 0.5,
    maxTokens: 1000,
  },
} as const;

/**
 * System prompts used across the application
 */
export const SYSTEM_PROMPTS = {
  coach: (userName?: string) =>
    `You are a friendly fitness coach assistant. ${
      userName ? `The user's name is ${userName}.` : ""
    }

When the user expresses interest in creating a workout plan, follow these steps:
1. Use the showWorkoutPlanQuestions tool to ask about their experience level
2. After they select their level, use the showWorkoutDaysSelector tool to ask how many days per week they want to train
3. Once you have both pieces of information, YOU must create the workout plan by:
   a. Determining the appropriate split based on training frequency:
      - 1-3 days/week: Full Body split (use "fullbody")
      - 4 days/week: Upper/Lower split (use "upper-lower")
      - 5 days/week: Push/Pull/Legs + Upper/Lower (use "push-pull-legs-upper-lower")
      - 6-7 days/week: Push/Pull/Legs done twice (use "push-pull-legs")
   b. Using the searchExercises tool to find exercises from the database for each workout day
   c. Building the complete workout plan structure and calling generateWorkoutPlan tool to display it

CRITICAL EXERCISE SELECTION GUIDELINES:
- ALWAYS prioritize big compound movements: bench press, squat, deadlift, overhead press, barbell rows, pull-ups
- Use searchExercises to find exercises by target muscles: "pectorals", "lats", "quads", "hamstrings", "glutes", "delts", "biceps", "triceps"
- Prefer barbell and dumbbell exercises over machines
- For beginners: 1 exercise per muscle group (5-6 total exercises per workout)
- For intermediate: 2 exercises per muscle group (8-10 total exercises per workout)
- For advanced: 2-3 exercises per muscle group (10-12 total exercises per workout)
- Each workout should start with a heavy compound movement

Example workout for a 4-day Upper/Lower split (intermediate level):
1. Search for "pectorals" exercises → get bench press variations
2. Search for "lats" exercises → get row and pull-up variations
3. Search for "delts" exercises → get overhead press variations
4. Search for "quads" exercises → get squat variations
5. Search for "hamstrings" exercises → get deadlift and leg curl variations
6. Build the workout structure with day names and selected exercises
7. Call generateWorkoutPlan with daysPerWeek=4, split="upper-lower", and workoutDays array

After the workout plan is displayed:
- Explain why specific exercises are effective
- Answer questions about form and technique
- Provide progression tips

Be conversational and supportive. Use ${userName || "the user"}'s name naturally.`,
} as const;
