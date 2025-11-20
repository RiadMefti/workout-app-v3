/**
 * Application-wide constants
 */

// Validation limits
export const VALIDATION = {
  ROUTINE_NAME_MAX_LENGTH: 100,
  EXERCISE_NAME_MAX_LENGTH: 200,
  DAY_NAME_MAX_LENGTH: 100,
  PREFERENCES_MAX_LENGTH: 1000,
  MAX_SETS_PER_EXERCISE: 20,
  MAX_EXERCISES_PER_DAY: 30,
  MAX_DAYS_PER_ROUTINE: 7,
  MAX_REPS: 999,
  MAX_WEIGHT: 9999,
  MIN_DAYS_PER_WEEK: 3,
  MAX_DAYS_PER_WEEK: 7,
} as const;

// Experience levels
export const EXPERIENCE_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type ExperienceLevel =
  (typeof EXPERIENCE_LEVELS)[keyof typeof EXPERIENCE_LEVELS];

// UI constants
export const UI = {
  MIN_TOUCH_TARGET_SIZE: 44, // pixels - WCAG AA minimum
  MOBILE_BREAKPOINT: 768, // pixels
  TOAST_DURATION: 3000, // milliseconds
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden: You don't have access to this resource",
  ROUTINE_NAME_REQUIRED: "Please enter a routine name",
  DAYS_REQUIRED: "Please add at least one day",
  NAME_ALL_DAYS: "Please name all workout days",
  EXERCISES_REQUIRED: "Please add exercises to",
  NAME_ALL_EXERCISES: "Please name all exercises in",
  SETS_REQUIRED: "Please add sets to",
  WORKOUT_NAME_REQUIRED: "Please enter a workout name",
  EXERCISE_REQUIRED: "Please add at least one exercise",
  EXPERIENCE_AND_DAYS_REQUIRED:
    "Please select your experience level and days per week",
  FAILED_TO_CREATE_ROUTINE: "Failed to create routine. Please try again.",
  FAILED_TO_GENERATE_ROUTINE: "Failed to generate routine. Please try again.",
  FAILED_TO_RECORD_WORKOUT: "Failed to record workout. Please try again.",
  FAILED_TO_SET_ACTIVE: "Failed to set active routine. Please try again.",
  VALIDATION_ERROR: "Validation error",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ROUTINE_CREATED: "Routine created successfully",
  WORKOUT_RECORDED: "Workout recorded successfully!",
  ACTIVE_ROUTINE_UPDATED: "Active routine updated",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  ROUTINES: "/api/routines",
  ROUTINES_ACTIVE: "/api/routines/active",
  ROUTINES_GENERATE: "/api/routines/generate",
  WORKOUTS: "/api/workouts",
  WORKOUTS_NEXT: "/api/workouts/next",
  CHAT: "/api/chat",
} as const;
