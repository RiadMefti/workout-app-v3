import { z } from "zod";
import { VALIDATION, EXPERIENCE_LEVELS, ERROR_MESSAGES } from "./constants";

// =============================================================================
// ROUTINE VALIDATIONS
// =============================================================================

const exerciseSetSchema = z.object({
  setNumber: z.number().int().positive(),
  targetReps: z.number().int().positive().max(VALIDATION.MAX_REPS),
  targetWeight: z.number().nonnegative().max(VALIDATION.MAX_WEIGHT),
});

const exerciseSchema = z.object({
  exerciseName: z
    .string()
    .trim()
    .min(1)
    .max(VALIDATION.EXERCISE_NAME_MAX_LENGTH),
  exerciseOrder: z.number().int().positive(),
  sets: z.array(exerciseSetSchema).min(1).max(VALIDATION.MAX_SETS_PER_EXERCISE),
});

const daySchema = z.object({
  name: z.string().trim().min(1).max(VALIDATION.DAY_NAME_MAX_LENGTH),
  dayOrder: z.number().int().positive(),
  exercises: z
    .array(exerciseSchema)
    .min(1)
    .max(VALIDATION.MAX_EXERCISES_PER_DAY),
});

export const createRoutineSchema = z.object({
  userId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(VALIDATION.ROUTINE_NAME_MAX_LENGTH),
  days: z.array(daySchema).min(1).max(VALIDATION.MAX_DAYS_PER_ROUTINE),
});

export const generateRoutineSchema = z.object({
  routineName: z
    .string()
    .trim()
    .min(1)
    .max(VALIDATION.ROUTINE_NAME_MAX_LENGTH),
  experienceLevel: z.enum([
    EXPERIENCE_LEVELS.BEGINNER,
    EXPERIENCE_LEVELS.INTERMEDIATE,
    EXPERIENCE_LEVELS.ADVANCED,
  ]),
  daysPerWeek: z
    .number()
    .int()
    .min(VALIDATION.MIN_DAYS_PER_WEEK)
    .max(VALIDATION.MAX_DAYS_PER_WEEK),
  preferences: z.string().trim().max(VALIDATION.PREFERENCES_MAX_LENGTH).optional(),
});

export const setActiveRoutineSchema = z.object({
  userId: z.string().trim().min(1),
  routineId: z.string().uuid(),
});

// =============================================================================
// WORKOUT VALIDATIONS
// =============================================================================

const completedSetSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().nonnegative().max(VALIDATION.MAX_REPS),
  weight: z.number().nonnegative().max(VALIDATION.MAX_WEIGHT),
});

const completedExerciseSchema = z.object({
  exerciseName: z
    .string()
    .trim()
    .min(1)
    .max(VALIDATION.EXERCISE_NAME_MAX_LENGTH),
  exerciseOrder: z.number().int().positive(),
  sets: z.array(completedSetSchema).min(1).max(VALIDATION.MAX_SETS_PER_EXERCISE),
});

export const createWorkoutSchema = z.object({
  userId: z.string().trim().min(1),
  routineId: z.string().uuid().optional().nullable(),
  dayId: z.string().uuid().optional().nullable(),
  workoutName: z
    .string()
    .trim()
    .min(1)
    .max(VALIDATION.ROUTINE_NAME_MAX_LENGTH),
  exercises: z
    .array(completedExerciseSchema)
    .min(1)
    .max(VALIDATION.MAX_EXERCISES_PER_DAY),
  completedAt: z.date().optional(),
});

// =============================================================================
// QUERY PARAM VALIDATIONS
// =============================================================================

export const userIdQuerySchema = z.object({
  userId: z.string().trim().min(1),
});

export const userIdWithActiveOnlySchema = z.object({
  userId: z.string().trim().min(1),
  activeOnly: z.enum(["true", "false"]).optional(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate data against a Zod schema and return typed result
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either data or error
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorMessages = result.error.issues.map((err) => {
      const path = err.path.join(".");
      return path ? `${path}: ${err.message}` : err.message;
    });
    return {
      success: false,
      error: `${ERROR_MESSAGES.VALIDATION_ERROR}: ${errorMessages.join(", ")}`,
    };
  }
}
