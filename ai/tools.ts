import { tool as createTool } from "ai";
import { z } from "zod";
import {
  WorkoutGenerator,
  type WorkoutPlan,
  type WorkoutDay,
} from "@/lib/services/workout-generator";
import { ExerciseService } from "@/lib/services/exercise-service";
import type { Equipment, TargetMuscle } from "@/lib/types/exercise";

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

export const searchExercises = createTool({
  description:
    "Search for exercises in the database by target muscles and equipment. Use this to find specific exercises when building a workout plan. Returns exercise details including name, target muscles, equipment, gif URL, and instructions.",
  inputSchema: z.object({
    targetMuscles: z
      .array(
        z.enum([
          "abductors",
          "abs",
          "adductors",
          "biceps",
          "calves",
          "cardiovascular system",
          "delts",
          "forearms",
          "glutes",
          "hamstrings",
          "lats",
          "levator scapulae",
          "pectorals",
          "quads",
          "serratus anterior",
          "spine",
          "traps",
          "triceps",
          "upper back",
        ])
      )
      .optional()
      .describe("Target muscle groups to search for"),
    equipments: z
      .array(z.string())
      .optional()
      .describe(
        "Equipment types to filter by (e.g., 'barbell', 'dumbbell', 'body weight', 'cable', 'kettlebell', 'band')"
      ),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of exercises to return"),
  }),
  execute: async function ({ targetMuscles, equipments, limit }) {
    const result = ExerciseService.search({
      targetMuscles: targetMuscles as TargetMuscle[] | undefined,
      equipments: equipments as Equipment[] | undefined,
      limit: limit || 10,
    });

    return {
      exercises: result.exercises,
      total: result.total,
    };
  },
});

export const generateWorkoutPlan = createTool({
  description:
    "Generate and display a complete workout plan. Provide the workout structure with day names (e.g., 'Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body') and exercises for each day. The exercises should be actual exercise objects from the database that you found using searchExercises.",
  inputSchema: z.object({
    daysPerWeek: z
      .number()
      .min(1)
      .max(7)
      .describe("Number of training days per week"),
    split: z
      .enum([
        "fullbody",
        "upper-lower",
        "push-pull-legs",
        "push-pull-legs-upper-lower",
      ])
      .describe("The workout split type"),
    workoutDays: z
      .array(
        z.object({
          name: z.string().describe("Day name (e.g., 'Push', 'Pull', 'Legs')"),
          focus: z
            .array(z.string())
            .describe("Muscle groups focused on this day"),
          exercises: z
            .array(
              z.object({
                exerciseId: z.string(),
                name: z.string(),
                gifUrl: z.string(),
                targetMuscles: z.array(z.string()),
                equipments: z.array(z.string()),
                instructions: z.array(z.string()).optional(),
              })
            )
            .describe("List of exercises for this workout day"),
        })
      )
      .describe("Array of workout days with their exercises"),
  }),
  execute: async function ({ daysPerWeek, split, workoutDays }) {
    // Add rest days to create a 7-day week
    const fullWeek = WorkoutGenerator.createWeeklyScheduleFromDays(
      workoutDays as WorkoutDay[],
      daysPerWeek
    );

    const plan: WorkoutPlan = {
      split,
      daysPerWeek,
      workoutDays: fullWeek,
    };

    const formatted = WorkoutGenerator.formatPlanForDisplay(plan);

    return {
      plan,
      formattedPlan: formatted,
      split,
      daysPerWeek,
    };
  },
});

export const generateWorkoutRoutine = createTool({
  description:
    "Generate a complete workout routine structure that can be saved to the database. This should return a detailed routine with days, exercises, and sets/reps/weight for each exercise. The routine should match the user's experience level, training frequency, and preferences.",
  inputSchema: z.object({
    routineName: z.string().describe("Name for the workout routine"),
    experienceLevel: z
      .enum(["beginner", "intermediate", "advanced"])
      .describe("User's training experience level"),
    daysPerWeek: z
      .number()
      .min(3)
      .max(6)
      .describe("Number of training days per week"),
    preferences: z
      .string()
      .optional()
      .describe("User's goals, injuries, equipment limitations, or preferences"),
  }),
  execute: async function ({
    routineName,
    experienceLevel,
    daysPerWeek,
    preferences,
  }) {
    // This will be filled by the LLM with the actual routine data
    // The LLM needs to return the routine in this exact format
    return {
      type: "workout-routine-generated",
      routineName,
      experienceLevel,
      daysPerWeek,
      preferences,
      // The LLM will populate this structure
      routine: {
        name: routineName,
        days: [] as Array<{
          name: string;
          dayOrder: number;
          exercises: Array<{
            exerciseName: string;
            exerciseOrder: number;
            sets: Array<{
              setNumber: number;
              targetReps: number;
              targetWeight: number;
            }>;
          }>;
        }>,
      },
    };
  },
});

export const tools = {
  showWorkoutPlanQuestions,
  showWorkoutDaysSelector,
  searchExercises,
  generateWorkoutPlan,
  generateWorkoutRoutine,
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

export type SearchExercisesTool = {
  input: {
    targetMuscles?: string[];
    equipments?: string[];
    limit?: number;
  };
  output: {
    exercises: Array<{
      exerciseId: string;
      name: string;
      gifUrl: string;
      targetMuscles: string[];
      equipments: string[];
      instructions?: string[];
    }>;
    total: number;
  };
};

export type GenerateWorkoutPlanTool = {
  input: {
    daysPerWeek: number;
    split:
      | "fullbody"
      | "upper-lower"
      | "push-pull-legs"
      | "push-pull-legs-upper-lower";
    workoutDays: Array<{
      name: string;
      focus: string[];
      exercises: Array<{
        exerciseId: string;
        name: string;
        gifUrl: string;
        targetMuscles: string[];
        equipments: string[];
        instructions?: string[];
      }>;
    }>;
  };
  output: {
    plan: WorkoutPlan;
    formattedPlan: string;
    split: string;
    daysPerWeek: number;
  };
};

export type GenerateWorkoutRoutineTool = {
  input: {
    routineName: string;
    experienceLevel: "beginner" | "intermediate" | "advanced";
    daysPerWeek: number;
    preferences?: string;
  };
  output: {
    type: "workout-routine-generated";
    routineName: string;
    experienceLevel: string;
    daysPerWeek: number;
    preferences?: string;
    routine: {
      name: string;
      days: Array<{
        name: string;
        dayOrder: number;
        exercises: Array<{
          exerciseName: string;
          exerciseOrder: number;
          sets: Array<{
            setNumber: number;
            targetReps: number;
            targetWeight: number;
          }>;
        }>;
      }>;
    };
  };
};

// Combine all tool types for useChat
export type AppTools = {
  showWorkoutPlanQuestions: ShowWorkoutPlanQuestionsTool;
  showWorkoutDaysSelector: ShowWorkoutDaysSelectorTool;
  searchExercises: SearchExercisesTool;
  generateWorkoutPlan: GenerateWorkoutPlanTool;
  generateWorkoutRoutine: GenerateWorkoutRoutineTool;
};
