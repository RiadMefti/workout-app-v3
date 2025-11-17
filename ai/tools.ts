import { tool as createTool } from "ai";
import { z } from "zod";
import {
  WorkoutGenerator,
  type WorkoutPlan,
} from "@/lib/services/workout-generator";

export const showWorkoutPlanQuestions = createTool({
  description:
    "Display workout plan configuration UI with experience level options",
  inputSchema: z.object({
    userName: z.string().describe("The user's first name"),
  }),
  execute: async function ({ userName }) {
    return {
      type: "workout-plan-questions",
      userName,
      options: ["Beginner", "Intermediate", "Advanced"] as const,
    };
  },
});

export const showWorkoutDaysSelector = createTool({
  description: "Display workout days per week selector UI",
  inputSchema: z.object({
    experienceLevel: z.string().describe("The user's experience level"),
  }),
  execute: async function ({ experienceLevel }) {
    return {
      type: "workout-days-selector",
      experienceLevel,
      daysOptions: [1, 2, 3, 4, 5, 6, 7] as const,
    };
  },
});

export const generateWorkoutPlan = createTool({
  description:
    "Generate a complete workout plan based on user's experience level and training frequency",
  inputSchema: z.object({
    experienceLevel: z
      .enum(["beginner", "intermediate", "advanced"])
      .describe("User's fitness experience level"),
    daysPerWeek: z
      .number()
      .min(1)
      .max(7)
      .describe("Number of training days per week"),
  }),
  execute: async function ({ experienceLevel, daysPerWeek }) {
    const plan = WorkoutGenerator.generatePlan({
      daysPerWeek,
      experienceLevel,
    });

    const formatted = WorkoutGenerator.formatPlanForDisplay(plan);

    return {
      plan,
      formattedPlan: formatted,
      split: plan.split,
      daysPerWeek: plan.daysPerWeek,
    };
  },
});

export const tools = {
  showWorkoutPlanQuestions,
  showWorkoutDaysSelector,
  generateWorkoutPlan,
};

// Export types for each tool
export type ShowWorkoutPlanQuestionsTool = {
  input: { userName: string };
  output: {
    type: "workout-plan-questions";
    userName: string;
    options: readonly ["Beginner", "Intermediate", "Advanced"];
  };
};

export type ShowWorkoutDaysSelectorTool = {
  input: { experienceLevel: string };
  output: {
    type: "workout-days-selector";
    experienceLevel: string;
    daysOptions: readonly [1, 2, 3, 4, 5, 6, 7];
  };
};

export type GenerateWorkoutPlanTool = {
  input: {
    experienceLevel: "beginner" | "intermediate" | "advanced";
    daysPerWeek: number;
  };
  output: {
    plan: WorkoutPlan;
    formattedPlan: string;
    split: string;
    daysPerWeek: number;
  };
};

// Combine all tool types for useChat
export type AppTools = {
  showWorkoutPlanQuestions: ShowWorkoutPlanQuestionsTool;
  showWorkoutDaysSelector: ShowWorkoutDaysSelectorTool;
  generateWorkoutPlan: GenerateWorkoutPlanTool;
};
