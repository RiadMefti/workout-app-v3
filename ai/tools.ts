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
      options: ["Beginner", "Intermediate", "Advanced"],
    };
  },
});

export const tools = {
  showWorkoutPlanQuestions,
};
