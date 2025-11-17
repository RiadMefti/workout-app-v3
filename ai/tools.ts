import { tool as createTool } from "ai";
import { z } from "zod";

export const showWorkoutPlanQuestions = createTool({
  description: "Display workout plan configuration UI with experience level options",
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

export const tools = {
  showWorkoutPlanQuestions,
  showWorkoutDaysSelector,
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

// Combine all tool types for useChat
export type AppTools = {
  showWorkoutPlanQuestions: ShowWorkoutPlanQuestionsTool;
  showWorkoutDaysSelector: ShowWorkoutDaysSelectorTool;
};
