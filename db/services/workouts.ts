import { db } from "../index";
import {
  completedWorkouts,
  completedExercises,
  completedSets,
} from "../schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// =============================================================================
// TYPES
// =============================================================================

export interface CreateCompletedWorkoutInput {
  userId: string;
  routineId?: string | null; // Optional: can be null for ad-hoc workouts
  dayId?: string | null; // Optional: can be null for ad-hoc workouts
  workoutName: string;
  completedAt?: Date;
  exercises: {
    exerciseName: string;
    exerciseOrder: number;
    sets: {
      setNumber: number;
      reps: number;
      weight: number; // Use 0 for bodyweight exercises
    }[];
  }[];
}

export interface CompletedWorkoutDetails {
  id: string;
  userId: string;
  routineId: string | null;
  dayId: string | null;
  workoutName: string;
  completedAt: Date;
  createdAt: Date;
  exercises: {
    id: string;
    exerciseName: string;
    exerciseOrder: number;
    sets: {
      id: string;
      setNumber: number;
      reps: number;
      weight: number;
    }[];
  }[];
}

export interface WorkoutHistorySummary {
  id: string;
  workoutName: string;
  completedAt: Date;
  exerciseCount: number;
}

// =============================================================================
// WORKOUT OPERATIONS
// =============================================================================

/**
 * Create a completed workout with exercises and sets in a single transaction
 */
export async function createCompletedWorkout(
  input: CreateCompletedWorkoutInput
): Promise<string> {
  return await db.transaction(async (tx) => {
    // 1. Create the completed workout
    const [workout] = await tx
      .insert(completedWorkouts)
      .values({
        userId: input.userId,
        routineId: input.routineId ?? null,
        dayId: input.dayId ?? null,
        workoutName: input.workoutName,
        completedAt: input.completedAt ?? new Date(),
      })
      .returning({ id: completedWorkouts.id });

    // 2. Create all exercises
    for (const exercise of input.exercises) {
      const [createdExercise] = await tx
        .insert(completedExercises)
        .values({
          workoutId: workout.id,
          exerciseName: exercise.exerciseName,
          exerciseOrder: exercise.exerciseOrder,
        })
        .returning({ id: completedExercises.id });

      // 3. Create all sets for this exercise
      const setsToInsert = exercise.sets.map((set) => ({
        exerciseId: createdExercise.id,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight,
      }));

      await tx.insert(completedSets).values(setsToInsert);
    }

    return workout.id;
  });
}

/**
 * Get workout history for a user within a date range (for calendar)
 */
export async function getWorkoutHistory(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WorkoutHistorySummary[]> {
  const workouts = await db
    .select({
      id: completedWorkouts.id,
      workoutName: completedWorkouts.workoutName,
      completedAt: completedWorkouts.completedAt,
      exerciseCount: sql<number>`count(distinct ${completedExercises.id})`,
    })
    .from(completedWorkouts)
    .leftJoin(
      completedExercises,
      eq(completedExercises.workoutId, completedWorkouts.id)
    )
    .where(
      and(
        eq(completedWorkouts.userId, userId),
        gte(completedWorkouts.completedAt, startDate),
        lte(completedWorkouts.completedAt, endDate)
      )
    )
    .groupBy(
      completedWorkouts.id,
      completedWorkouts.workoutName,
      completedWorkouts.completedAt
    )
    .orderBy(desc(completedWorkouts.completedAt));

  return workouts.map((w) => ({
    id: w.id,
    workoutName: w.workoutName,
    completedAt: w.completedAt,
    exerciseCount: w.exerciseCount,
  }));
}

/**
 * Get full details of a specific completed workout
 */
export async function getWorkoutDetails(
  userId: string,
  workoutId: string
): Promise<CompletedWorkoutDetails | null> {
  // Get the workout
  const [workout] = await db
    .select()
    .from(completedWorkouts)
    .where(
      and(
        eq(completedWorkouts.id, workoutId),
        eq(completedWorkouts.userId, userId)
      )
    )
    .limit(1);

  if (!workout) return null;

  // Get all exercises for this workout
  const exercises = await db
    .select()
    .from(completedExercises)
    .where(eq(completedExercises.workoutId, workout.id))
    .orderBy(completedExercises.exerciseOrder);

  // Get sets for each exercise
  const exercisesWithSets = await Promise.all(
    exercises.map(async (exercise) => {
      const sets = await db
        .select()
        .from(completedSets)
        .where(eq(completedSets.exerciseId, exercise.id))
        .orderBy(completedSets.setNumber);

      return {
        id: exercise.id,
        exerciseName: exercise.exerciseName,
        exerciseOrder: exercise.exerciseOrder,
        sets: sets.map((set) => ({
          id: set.id,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
        })),
      };
    })
  );

  return {
    id: workout.id,
    userId: workout.userId,
    routineId: workout.routineId,
    dayId: workout.dayId,
    workoutName: workout.workoutName,
    completedAt: workout.completedAt,
    createdAt: workout.createdAt,
    exercises: exercisesWithSets,
  };
}

/**
 * Get the last completed workout for a specific routine
 */
export async function getLastCompletedWorkoutForRoutine(
  userId: string,
  routineId: string
): Promise<{ dayId: string | null; dayOrder: number | null } | null> {
  const [lastWorkout] = await db
    .select({
      dayId: completedWorkouts.dayId,
    })
    .from(completedWorkouts)
    .where(
      and(
        eq(completedWorkouts.userId, userId),
        eq(completedWorkouts.routineId, routineId)
      )
    )
    .orderBy(desc(completedWorkouts.completedAt))
    .limit(1);

  if (!lastWorkout || !lastWorkout.dayId) {
    return null;
  }

  // Get the day order for this workout
  const { workoutDays } = await import("../schema");
  const [day] = await db
    .select({ dayOrder: workoutDays.dayOrder })
    .from(workoutDays)
    .where(eq(workoutDays.id, lastWorkout.dayId))
    .limit(1);

  if (!day) {
    return null;
  }

  return {
    dayId: lastWorkout.dayId,
    dayOrder: day.dayOrder,
  };
}
