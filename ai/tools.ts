import { tool as createTool } from "ai";
import { z } from "zod";
import { ExerciseService } from "@/lib/services/exercise-service";
import type { Equipment, TargetMuscle } from "@/lib/types/exercise";
import {
  getActiveRoutine as getActiveRoutineFromDb,
  getUserRoutinesWithDetails,
  getLastCompletedWorkoutForRoutine,
  getWorkoutHistory,
  getWorkoutDetails,
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
          message:
            "You don't have an active routine. Would you like to create one?",
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
        nextDay = activeRoutine.days.find(
          (day) => day.dayOrder === nextDayOrder
        );

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
      .describe(
        "Name of a specific exercise to search for (e.g., 'bench press', 'squat')"
      ),
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
    // If searching by name, get all exercises to search from
    const searchLimit = exerciseName ? 1500 : limit || 5;

    const result = ExerciseService.search({
      targetMuscles: targetMuscles as TargetMuscle[] | undefined,
      equipments: equipments as Equipment[] | undefined,
      limit: searchLimit,
    });

    // Filter by name if provided with improved matching
    let exercises = result.exercises;
    if (exerciseName) {
      const searchTerms = exerciseName.toLowerCase().trim();

      // Score each exercise based on relevance
      const scoredExercises = exercises.map((ex) => {
        const name = ex.name.toLowerCase();
        let score = 0;

        // Exact match gets highest score
        if (name === searchTerms) {
          score = 10000;
        }
        // Starts with search term
        else if (name.startsWith(searchTerms)) {
          score = 5000;
        }
        // Contains exact search term
        else if (name.includes(searchTerms)) {
          score = 2500;
        }
        // Check if all words in search term appear in exercise name
        else {
          const searchWords = searchTerms.split(/\s+/);
          const nameWords = name.split(/\s+/);

          let matchedWords = 0;
          for (const searchWord of searchWords) {
            // Check exact word match
            if (nameWords.some((w) => w === searchWord)) {
              matchedWords += 2;
              score += 500;
            }
            // Check if word contains search word
            else if (nameWords.some((w) => w.includes(searchWord))) {
              matchedWords += 1;
              score += 250;
            }
          }

          // Bonus if all words matched
          if (matchedWords >= searchWords.length) {
            score += 1000;
          }
        }

        // Only apply popularity scoring if there's a base match
        if (score > 0) {
          // CRITICAL: Heavily penalize exercises with extra modifier words
          const searchWordCount = searchTerms.split(/\s+/).length;
          const nameWordCount = name.split(/\s+/).length;
          const extraWords = nameWordCount - searchWordCount;

          // Penalize each extra word heavily to prefer simpler/exact matches
          if (extraWords > 0) {
            score -= extraWords * 500; // -500 per extra word
          }

          // Equipment popularity bonus (smaller now)
          const equipmentPopularity: Record<string, number> = {
            barbell: 50,
            dumbbell: 45,
            "body weight": 40,
            cable: 30,
            machine: 25,
            kettlebell: 20,
            band: 15,
            "ez barbell": 15,
            "smith machine": 5,
          };

          let equipmentBonus = 0;
          for (const equipment of ex.equipments) {
            const equipLower = equipment.toLowerCase();
            for (const [key, value] of Object.entries(equipmentPopularity)) {
              if (equipLower.includes(key)) {
                equipmentBonus = Math.max(equipmentBonus, value);
              }
            }
          }
          score += equipmentBonus;

          // Heavy penalties for modifier words
          const modifierPenalties: Record<string, number> = {
            incline: -1000,
            decline: -1000,
            smith: -800,
            assisted: -800,
            reverse: -700,
            "close grip": -700,
            "wide grip": -700,
            single: -700,
            alternating: -700,
            jerk: -1000,
            snatch: -1000,
            clean: -1000,
            overhead: -600,
            front: -600,
            bulgarian: -800,
            pistol: -800,
            goblet: -700,
            sumo: -700,
            hack: -800,
            sissy: -900,
            landmine: -800,
            "trap bar": -700,
            jefferson: -900,
            zercher: -900,
          };

          for (const [keyword, penalty] of Object.entries(modifierPenalties)) {
            if (name.includes(keyword) && !searchTerms.includes(keyword)) {
              score += penalty;
            }
          }

          // Boost if name has "barbell" or "dumbbell" and matches exactly with equipment prefix
          if (
            name === `barbell ${searchTerms}` ||
            name === `dumbbell ${searchTerms}`
          ) {
            score += 2000;
          }
        }

        return { exercise: ex, score };
      });

      // Filter out exercises with score 0 and sort by score
      exercises = scoredExercises
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.exercise)
        .slice(0, limit || 5);
    }

    return {
      type: "exercise-search-result",
      exercises,
      total: exercises.length,
    };
  },
});

// ============================================================================
// WORKOUT HISTORY TOOLS - View past workout performance
// ============================================================================

export const showWorkoutHistory = createTool({
  description:
    "Display the workout history calendar UI showing all completed workouts. Use this when the user asks to see their workout history, past workouts, or training log.",
  inputSchema: z.object({
    message: z
      .string()
      .optional()
      .describe("Optional message to show with the history"),
  }),
  execute: async function ({ message }) {
    return {
      type: "show-workout-history",
      message: message || "Here's your workout history:",
    };
  },
});

export const getWorkoutHistorySummary = createTool({
  description:
    "Get a summary of the user's workout history for a specific date range. Use this when user asks about their workout frequency, patterns, or statistics (e.g., 'how many workouts this month', 'what did I do in November').",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
    startDate: z
      .string()
      .optional()
      .describe("Start date in ISO format (e.g., '2024-11-01')"),
    endDate: z
      .string()
      .optional()
      .describe("End date in ISO format (e.g., '2024-11-30')"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of workouts to return"),
  }),
  execute: async function ({ userId, startDate, endDate, limit }) {
    try {
      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const workouts = await getWorkoutHistory(userId, start, end);

      // Apply limit if specified
      const limitedWorkouts = limit ? workouts.slice(0, limit) : workouts;

      return {
        type: "workout-history-summary",
        success: true,
        workouts: limitedWorkouts,
        totalWorkouts: limitedWorkouts.length,
      };
    } catch (error) {
      console.error("[getWorkoutHistorySummary tool] Error:", error);
      return {
        type: "workout-history-summary",
        success: false,
        message: "I couldn't fetch your workout history. Please try again.",
        workouts: [],
        totalWorkouts: 0,
      };
    }
  },
});

export const getSpecificWorkout = createTool({
  description:
    "Get detailed information about a specific workout by ID or date. Use this when user asks about a specific workout (e.g., 'what did I do on November 25', 'show me my last leg day').",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
    workoutId: z
      .string()
      .optional()
      .describe("The specific workout ID if known"),
    date: z
      .string()
      .optional()
      .describe("Date to search for workouts (ISO format like '2024-11-25')"),
  }),
  execute: async function ({ userId, workoutId, date }) {
    try {
      if (workoutId) {
        // Get specific workout by ID
        const workout = await getWorkoutDetails(userId, workoutId);
        if (!workout) {
          return {
            type: "specific-workout-result",
            success: false,
            message: "I couldn't find that workout.",
          };
        }
        return {
          type: "specific-workout-result",
          success: true,
          workout,
        };
      } else if (date) {
        // Get workouts for a specific date
        // Parse date in local timezone to avoid UTC offset issues
        const [year, month, day] = date.split("-").map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        const workouts = await getWorkoutHistory(userId, startOfDay, endOfDay);

        if (workouts.length === 0) {
          return {
            type: "specific-workout-result",
            success: false,
            message: `You didn't log any workouts on ${new Date(
              date
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}.`,
          };
        }

        // Fetch full details for the first workout
        const workoutDetails = await getWorkoutDetails(userId, workouts[0].id);

        if (!workoutDetails) {
          return {
            type: "specific-workout-result",
            success: false,
            message: "I couldn't fetch the workout details.",
          };
        }

        return {
          type: "specific-workout-result",
          success: true,
          workout: workoutDetails,
        };
      } else {
        return {
          type: "specific-workout-result",
          success: false,
          message:
            "Please provide either a workout ID or a date to search for.",
        };
      }
    } catch (error) {
      console.error("[getSpecificWorkout tool] Error:", error);
      return {
        type: "specific-workout-result",
        success: false,
        message: "I couldn't fetch that workout. Please try again.",
      };
    }
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
  showWorkoutHistory,

  // Data fetching
  getActiveRoutine,
  getNextWorkout,
  getUserRoutines,

  // Workout history
  getWorkoutHistorySummary,
  getSpecificWorkout,

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
  showWorkoutHistory: {
    input: { message?: string };
    output: { type: "show-workout-history"; message: string };
  };
  getWorkoutHistorySummary: {
    input: {
      userId: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    };
    output: {
      type: "workout-history-summary";
      success: boolean;
      workouts: any[];
      totalWorkouts: number;
      message?: string;
    };
  };
  getSpecificWorkout: {
    input: {
      userId: string;
      workoutId?: string;
      date?: string;
    };
    output:
      | {
          type: "specific-workout-result";
          success: true;
          workout: any;
          additionalWorkouts?: any[];
        }
      | {
          type: "specific-workout-result";
          success: false;
          message: string;
        };
  };
};
