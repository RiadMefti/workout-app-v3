import { z } from "zod";

// =============================================================================
// ROUTINE VALIDATIONS
// =============================================================================

const exerciseSetSchema = z.object({
  setNumber: z.number().int().positive(),
  targetReps: z.number().int().positive().max(999),
  targetWeight: z.number().nonnegative().max(9999),
});

const exerciseSchema = z.object({
  exerciseName: z.string().trim().min(1).max(200),
  exerciseOrder: z.number().int().positive(),
  sets: z.array(exerciseSetSchema).min(1).max(20),
});

const daySchema = z.object({
  name: z.string().trim().min(1).max(100),
  dayOrder: z.number().int().positive(),
  exercises: z.array(exerciseSchema).min(1).max(30),
});

export const createRoutineSchema = z.object({
  userId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100),
  days: z.array(daySchema).min(1).max(7),
});

export const generateRoutineSchema = z.object({
  routineName: z.string().trim().min(1).max(100),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(3).max(7),
  preferences: z.string().trim().max(1000).optional(),
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
  reps: z.number().int().nonnegative().max(999),
  weight: z.number().nonnegative().max(9999),
});

const completedExerciseSchema = z.object({
  exerciseName: z.string().trim().min(1).max(200),
  exerciseOrder: z.number().int().positive(),
  sets: z.array(completedSetSchema).min(1).max(20),
});

export const createWorkoutSchema = z.object({
  userId: z.string().trim().min(1),
  routineId: z.string().uuid().optional().nullable(),
  dayId: z.string().uuid().optional().nullable(),
  workoutName: z.string().trim().min(1).max(100),
  exercises: z.array(completedExerciseSchema).min(1).max(30),
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
      error: `Validation error: ${errorMessages.join(", ")}`,
    };
  }
}
