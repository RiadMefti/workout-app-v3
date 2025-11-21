import { tool as createTool } from "ai";
import { z } from "zod";
import { ExerciseService } from "@/lib/services/exercise-service";
import type { Equipment, TargetMuscle } from "@/lib/types/exercise";
import {
  getActiveRoutine as getActiveRoutineFromDb,
  getUserRoutinesWithDetails,
  getLastCompletedWorkoutForRoutine,
} from "@/db/services";

/**
 * NEW AI TOOLS - Comprehensive set for smart workout coach
 */

// ============================================================================
// UI TRIGGER TOOLS - Show compact UI components
// ============================================================================

export const showWorkoutRecorder = createTool({
  description:
    "Display the workout recorder UI so the user can log their completed workout. Use this when the user wants to record, log, or track a workout they just did or are currently doing.",
  inputSchema: z.object({
    message: z
      .string()
      .optional()
      .describe("Optional encouraging message to show the user"),
  }),
  execute: async function ({ message }) {
    return {
      type: "show-workout-recorder",
      message: message || "Let's record your workout! 💪",
    };
  },
});

export const showRoutineManager = createTool({
  description:
    "Display the user's workout routines manager UI. Use this when the user asks to see their routines, manage routines, or view their workout plans.",
  inputSchema: z.object({
    message: z
      .string()
      .optional()
      .describe("Optional message to show with the routines"),
  }),
  execute: async function ({ message }) {
    return {
      type: "show-routine-manager",
      message: message || "Here are your workout routines:",
    };
  },
});

export const showRoutineCreator = createTool({
  description:
    "Display the routine creator UI to help the user create a new workout routine. Use this when the user wants to create, build, or design a new workout plan/routine. The creator supports both AI-generated and custom routines.",
  inputSchema: z.object({
    message: z
      .string()
      .optional()
      .describe("Optional message about creating the routine"),
  }),
  execute: async function ({ message }) {
    return {
      type: "show-routine-creator",
      message: message || "Let's create your new routine! 🎯",
    };
  },
});

// ============================================================================
// DATA FETCHING TOOLS - Get user's actual workout data
// ============================================================================

export const getActiveRoutine = createTool({
  description:
    "Fetch the user's currently active workout routine from the database. Use this when the user asks what their workout plan is, what routine they're following, or what their active program is. Returns the routine with all days and exercises.",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
  }),
  execute: async function ({ userId }) {
    try {
      const routine = await getActiveRoutineFromDb(userId);

      if (!routine) {
        return {
          type: "active-routine-result",
          success: false,
          message: "You don't have an active routine. Would you like to create one?",
        };
      }

      return {
        type: "active-routine-result",
        success: true,
        routine,
      };
    } catch (error) {
      console.error("[getActiveRoutine tool] Error:", error);
      return {
        type: "active-routine-result",
        success: false,
        message: "I couldn't fetch your routine. Please try again.",
      };
    }
  },
});

export const getNextWorkout = createTool({
  description:
    "Get the user's next scheduled workout from their active routine. Use this when the user asks what workout is next, what they should do today, or what's their next session.",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
  }),
  execute: async function ({ userId }) {
    try {
      // Get the active routine
      const activeRoutine = await getActiveRoutineFromDb(userId);

      if (
        !activeRoutine ||
        !activeRoutine.days ||
        activeRoutine.days.length === 0
      ) {
        return {
          type: "next-workout-result",
          success: false,
          message:
            "You don't have an active routine set up, so I can't determine your next workout.",
        };
      }

      // Get the last completed workout for this routine
      const lastWorkout = await getLastCompletedWorkoutForRoutine(
        userId,
        activeRoutine.id
      );

      let nextDay;

      if (!lastWorkout || lastWorkout.dayOrder === null) {
        // No previous workout, start with day 1
        nextDay = activeRoutine.days.find((day) => day.dayOrder === 1);
      } else {
        // Find the next day in the routine
        const currentDayOrder = lastWorkout.dayOrder;
        const nextDayOrder = currentDayOrder + 1;

        // Check if there's a next day
        nextDay = activeRoutine.days.find((day) => day.dayOrder === nextDayOrder);

        // If no next day, cycle back to day 1
        if (!nextDay) {
          nextDay = activeRoutine.days.find((day) => day.dayOrder === 1);
        }
      }

      if (!nextDay) {
        return {
          type: "next-workout-result",
          success: false,
          message: "Could not determine your next workout.",
        };
      }

      return {
        type: "next-workout-result",
        success: true,
        workout: {
          dayName: nextDay.name,
          routineName: activeRoutine.name,
          exercises: nextDay.exercises,
        },
      };
    } catch (error) {
      console.error("[getNextWorkout tool] Error:", error);
      return {
        type: "next-workout-result",
        success: false,
        message: "I couldn't fetch your next workout. Please try again.",
      };
    }
  },
});

export const getUserRoutines = createTool({
  description:
    "Fetch all of the user's workout routines from the database. Use this when the user asks how many routines they have, wants to see a list of their programs, or asks about their saved routines.",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
  }),
  execute: async function ({ userId }) {
    try {
      const routines = await getUserRoutinesWithDetails(userId);

      return {
        type: "user-routines-result",
        success: true,
        routines: routines || [],
        count: routines?.length || 0,
      };
    } catch (error) {
      console.error("[getUserRoutines tool] Error:", error);
      return {
        type: "user-routines-result",
        success: false,
        routines: [],
        message: "I couldn't fetch your routines.",
      };
    }
  },
});

// ============================================================================
// EXERCISE TOOLS - Search and demonstrate exercises
// ============================================================================

export const searchExercises = createTool({
  description:
    "Search for exercises in the database by target muscles, equipment, or name. Use this to find exercises when answering questions about training specific muscles, when the user asks for exercise recommendations, or when looking for a specific exercise. Returns exercise details including name, target muscles, equipment, gif URL, and instructions.",
  inputSchema: z.object({
    exerciseName: z
      .string()
      .optional()
      .describe("Name of a specific exercise to search for (e.g., 'bench press', 'squat')"),
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
      .max(20)
      .default(5)
      .describe("Maximum number of exercises to return"),
  }),
  execute: async function ({ exerciseName, targetMuscles, equipments, limit }) {
    // If searching by name, get a larger set to filter from
    const searchLimit = exerciseName ? 100 : (limit || 5);

    const result = ExerciseService.search({
      targetMuscles: targetMuscles as TargetMuscle[] | undefined,
      equipments: equipments as Equipment[] | undefined,
      limit: searchLimit,
    });

    // Filter by name if provided
    let exercises = result.exercises;
    if (exerciseName) {
      exercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(exerciseName.toLowerCase())
      );
      // Limit results when searching by name
      exercises = exercises.slice(0, limit || 5);
    }

    return {
      type: "exercise-search-result",
      exercises,
      total: exercises.length,
    };
  },
});

// ============================================================================
// EXPORT ALL TOOLS
// ============================================================================

export const tools = {
  // UI triggers
  showWorkoutRecorder,
  showRoutineManager,
  showRoutineCreator,

  // Data fetching
  getActiveRoutine,
  getNextWorkout,
  getUserRoutines,

  // Exercise tools
  searchExercises,
};

// ============================================================================
// TYPE EXPORTS FOR TYPESCRIPT
// ============================================================================

export type AppTools = {
  showWorkoutRecorder: {
    input: { message?: string };
    output: { type: "show-workout-recorder"; message: string };
  };
  showRoutineManager: {
    input: { message?: string };
    output: { type: "show-routine-manager"; message: string };
  };
  showRoutineCreator: {
    input: { message?: string };
    output: { type: "show-routine-creator"; message: string };
  };
  getActiveRoutine: {
    input: { userId: string };
    output:
      | {
          type: "active-routine-result";
          success: true;
          routine: any;
        }
      | {
          type: "active-routine-result";
          success: false;
          message: string;
        };
  };
  getNextWorkout: {
    input: { userId: string };
    output:
      | {
          type: "next-workout-result";
          success: true;
          workout: {
            dayName: string;
            routineName: string;
            exercises: any[];
          };
        }
      | {
          type: "next-workout-result";
          success: false;
          message: string;
        };
  };
  getUserRoutines: {
    input: { userId: string };
    output: {
      type: "user-routines-result";
      success: boolean;
      routines: any[];
      count?: number;
      message?: string;
    };
  };
  searchExercises: {
    input: {
      exerciseName?: string;
      targetMuscles?: string[];
      equipments?: string[];
      limit?: number;
    };
    output: {
      type: "exercise-search-result";
      exercises: any[];
      total: number;
    };
  };
};
