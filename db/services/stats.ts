import { db } from "../index";
import {
  completedWorkouts,
  completedExercises,
  completedSets,
} from "../schema";
import { eq, and, sql, desc } from "drizzle-orm";

// =============================================================================
// TYPES
// =============================================================================

export interface ExerciseHistoryEntry {
  workoutId: string;
  workoutName: string;
  completedAt: Date;
  sets: {
    setNumber: number;
    reps: number;
    weight: number;
  }[];
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number; // Sum of (weight * reps) for all sets
}

// =============================================================================
// STATS OPERATIONS
// =============================================================================

/**
 * Get history of a specific exercise across all workouts (for progress tracking)
 */
export async function getExerciseHistory(
  userId: string,
  exerciseName: string,
  limit = 10
): Promise<ExerciseHistoryEntry[]> {
  // Get all instances of this exercise
  const exercises = await db
    .select({
      exerciseId: completedExercises.id,
      workoutId: completedWorkouts.id,
      workoutName: completedWorkouts.workoutName,
      completedAt: completedWorkouts.completedAt,
    })
    .from(completedExercises)
    .innerJoin(
      completedWorkouts,
      eq(completedWorkouts.id, completedExercises.workoutId)
    )
    .where(
      and(
        eq(completedWorkouts.userId, userId),
        eq(completedExercises.exerciseName, exerciseName)
      )
    )
    .orderBy(desc(completedWorkouts.completedAt))
    .limit(limit);

  // Get sets for each exercise instance
  const historyWithSets = await Promise.all(
    exercises.map(async (exercise) => {
      const sets = await db
        .select({
          setNumber: completedSets.setNumber,
          reps: completedSets.reps,
          weight: completedSets.weight,
        })
        .from(completedSets)
        .where(eq(completedSets.exerciseId, exercise.exerciseId))
        .orderBy(completedSets.setNumber);

      return {
        workoutId: exercise.workoutId,
        workoutName: exercise.workoutName,
        completedAt: exercise.completedAt,
        sets,
      };
    })
  );

  return historyWithSets;
}

/**
 * Get overall workout statistics for a user
 */
export async function getWorkoutStats(userId: string): Promise<WorkoutStats> {
  const [stats] = await db
    .select({
      totalWorkouts: sql<number>`count(distinct ${completedWorkouts.id})`,
      totalExercises: sql<number>`count(distinct ${completedExercises.id})`,
      totalSets: sql<number>`count(${completedSets.id})`,
      totalReps: sql<number>`coalesce(sum(${completedSets.reps}), 0)`,
      totalVolume: sql<number>`coalesce(sum(${completedSets.weight} * ${completedSets.reps}), 0)`,
    })
    .from(completedWorkouts)
    .leftJoin(
      completedExercises,
      eq(completedExercises.workoutId, completedWorkouts.id)
    )
    .leftJoin(
      completedSets,
      eq(completedSets.exerciseId, completedExercises.id)
    )
    .where(eq(completedWorkouts.userId, userId));

  return {
    totalWorkouts: stats.totalWorkouts,
    totalExercises: stats.totalExercises,
    totalSets: stats.totalSets,
    totalReps: stats.totalReps,
    totalVolume: stats.totalVolume,
  };
}
