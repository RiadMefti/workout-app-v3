import { db } from "../index";
import {
  workoutRoutines,
  workoutDays,
  dayExercises,
  exerciseSets,
} from "../schema";
import { eq, and } from "drizzle-orm";

// =============================================================================
// TYPES
// =============================================================================

export interface CreateRoutineInput {
  userId: string;
  name: string;
  days: {
    name: string;
    dayOrder: number;
    exercises: {
      exerciseName: string;
      exerciseOrder: number;
      sets: {
        setNumber: number;
        targetReps: number;
        targetWeight: number; // Use 0 for bodyweight exercises
      }[];
    }[];
  }[];
}

export interface RoutineWithDetails {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  days: {
    id: string;
    name: string;
    dayOrder: number;
    exercises: {
      id: string;
      exerciseName: string;
      exerciseOrder: number;
      sets: {
        id: string;
        setNumber: number;
        targetReps: number;
        targetWeight: number;
      }[];
    }[];
  }[];
}

// =============================================================================
// ROUTINE OPERATIONS
// =============================================================================

/**
 * Create a complete workout routine with days, exercises, and sets in a single transaction
 */
export async function createWorkoutRoutine(
  input: CreateRoutineInput
): Promise<string> {
  return await db.transaction(async (tx) => {
    // 1. Create the routine
    const [routine] = await tx
      .insert(workoutRoutines)
      .values({
        userId: input.userId,
        name: input.name,
        isActive: false,
      })
      .returning({ id: workoutRoutines.id });

    // 2. Create all days
    for (const day of input.days) {
      const [createdDay] = await tx
        .insert(workoutDays)
        .values({
          routineId: routine.id,
          name: day.name,
          dayOrder: day.dayOrder,
        })
        .returning({ id: workoutDays.id });

      // 3. Create all exercises for this day
      for (const exercise of day.exercises) {
        const [createdExercise] = await tx
          .insert(dayExercises)
          .values({
            dayId: createdDay.id,
            exerciseName: exercise.exerciseName,
            exerciseOrder: exercise.exerciseOrder,
          })
          .returning({ id: dayExercises.id });

        // 4. Create all sets for this exercise
        const setsToInsert = exercise.sets.map((set) => ({
          exerciseId: createdExercise.id,
          setNumber: set.setNumber,
          targetReps: set.targetReps,
          targetWeight: set.targetWeight,
        }));

        await tx.insert(exerciseSets).values(setsToInsert);
      }
    }

    return routine.id;
  });
}

/**
 * Get all routines for a user (without full details)
 */
export async function getUserRoutines(userId: string) {
  return await db
    .select()
    .from(workoutRoutines)
    .where(eq(workoutRoutines.userId, userId))
    .orderBy(workoutRoutines.createdAt);
}

/**
 * Get all routines for a user with full details (days, exercises, sets)
 * Optimized to avoid N+1 queries by fetching all data in 4 queries
 */
export async function getUserRoutinesWithDetails(
  userId: string
): Promise<RoutineWithDetails[]> {
  // 1. Get all routines for user
  const routines = await db
    .select()
    .from(workoutRoutines)
    .where(eq(workoutRoutines.userId, userId))
    .orderBy(workoutRoutines.createdAt);

  if (routines.length === 0) return [];

  const routineIds = routines.map((r) => r.id);

  // 2. Get all days for these routines in one query
  const allDays = await db
    .select()
    .from(workoutDays)
    .where(eq(workoutDays.routineId, routineIds[0]))
    .orderBy(workoutDays.dayOrder);

  // For multiple routines, we need to fetch all days
  const daysMap = new Map<string, typeof allDays>();
  if (routineIds.length > 1) {
    const allRoutineDays = await db
      .select()
      .from(workoutDays)
      .orderBy(workoutDays.dayOrder);

    // Group days by routine
    allRoutineDays.forEach((day) => {
      if (routineIds.includes(day.routineId)) {
        if (!daysMap.has(day.routineId)) {
          daysMap.set(day.routineId, []);
        }
        daysMap.get(day.routineId)!.push(day);
      }
    });
  } else if (routineIds.length === 1) {
    daysMap.set(routineIds[0], allDays);
  }

  const dayIds = Array.from(daysMap.values())
    .flat()
    .map((d) => d.id);

  if (dayIds.length === 0) {
    return routines.map((r) => ({
      ...r,
      days: [],
    }));
  }

  // 3. Get all exercises for these days in one query
  const allExercises = await db
    .select()
    .from(dayExercises)
    .orderBy(dayExercises.exerciseOrder);

  const exercisesMap = new Map<string, typeof allExercises>();
  allExercises.forEach((exercise) => {
    if (dayIds.includes(exercise.dayId)) {
      if (!exercisesMap.has(exercise.dayId)) {
        exercisesMap.set(exercise.dayId, []);
      }
      exercisesMap.get(exercise.dayId)!.push(exercise);
    }
  });

  const exerciseIds = allExercises
    .filter((e) => dayIds.includes(e.dayId))
    .map((e) => e.id);

  // 4. Get all sets for these exercises in one query
  const allSets = await db
    .select()
    .from(exerciseSets)
    .orderBy(exerciseSets.setNumber);

  const setsMap = new Map<string, typeof allSets>();
  allSets.forEach((set) => {
    if (exerciseIds.includes(set.exerciseId)) {
      if (!setsMap.has(set.exerciseId)) {
        setsMap.set(set.exerciseId, []);
      }
      setsMap.get(set.exerciseId)!.push(set);
    }
  });

  // Build the nested structure
  return routines.map((routine) => {
    const days = daysMap.get(routine.id) || [];

    return {
      id: routine.id,
      userId: routine.userId,
      name: routine.name,
      isActive: routine.isActive,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      days: days.map((day) => {
        const exercises = exercisesMap.get(day.id) || [];

        return {
          id: day.id,
          name: day.name,
          dayOrder: day.dayOrder,
          exercises: exercises.map((exercise) => {
            const sets = setsMap.get(exercise.id) || [];

            return {
              id: exercise.id,
              exerciseName: exercise.exerciseName,
              exerciseOrder: exercise.exerciseOrder,
              sets: sets.map((set) => ({
                id: set.id,
                setNumber: set.setNumber,
                targetReps: set.targetReps,
                targetWeight: set.targetWeight,
              })),
            };
          }),
        };
      }),
    };
  });
}

/**
 * Get the active routine for a user with all nested details
 * Optimized to avoid N+1 queries
 */
export async function getActiveRoutine(
  userId: string
): Promise<RoutineWithDetails | null> {
  // Get active routine
  const [routine] = await db
    .select()
    .from(workoutRoutines)
    .where(
      and(eq(workoutRoutines.userId, userId), eq(workoutRoutines.isActive, true))
    )
    .limit(1);

  if (!routine) return null;

  // Get all days for this routine
  const days = await db
    .select()
    .from(workoutDays)
    .where(eq(workoutDays.routineId, routine.id))
    .orderBy(workoutDays.dayOrder);

  if (days.length === 0) {
    return {
      ...routine,
      days: [],
    };
  }

  const dayIds = days.map((d) => d.id);

  // Get all exercises for these days in one query
  const allExercises = await db
    .select()
    .from(dayExercises)
    .orderBy(dayExercises.exerciseOrder);

  const exercisesMap = new Map<string, typeof allExercises>();
  allExercises.forEach((exercise) => {
    if (dayIds.includes(exercise.dayId)) {
      if (!exercisesMap.has(exercise.dayId)) {
        exercisesMap.set(exercise.dayId, []);
      }
      exercisesMap.get(exercise.dayId)!.push(exercise);
    }
  });

  const exerciseIds = allExercises
    .filter((e) => dayIds.includes(e.dayId))
    .map((e) => e.id);

  // Get all sets for these exercises in one query
  const allSets =
    exerciseIds.length > 0
      ? await db.select().from(exerciseSets).orderBy(exerciseSets.setNumber)
      : [];

  const setsMap = new Map<string, typeof allSets>();
  allSets.forEach((set) => {
    if (exerciseIds.includes(set.exerciseId)) {
      if (!setsMap.has(set.exerciseId)) {
        setsMap.set(set.exerciseId, []);
      }
      setsMap.get(set.exerciseId)!.push(set);
    }
  });

  // Build the nested structure
  const daysWithDetails = days.map((day) => {
    const exercises = exercisesMap.get(day.id) || [];

    return {
      id: day.id,
      name: day.name,
      dayOrder: day.dayOrder,
      exercises: exercises.map((exercise) => {
        const sets = setsMap.get(exercise.id) || [];

        return {
          id: exercise.id,
          exerciseName: exercise.exerciseName,
          exerciseOrder: exercise.exerciseOrder,
          sets: sets.map((set) => ({
            id: set.id,
            setNumber: set.setNumber,
            targetReps: set.targetReps,
            targetWeight: set.targetWeight,
          })),
        };
      }),
    };
  });

  return {
    id: routine.id,
    userId: routine.userId,
    name: routine.name,
    isActive: routine.isActive,
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
    days: daysWithDetails,
  };
}

/**
 * Set a routine as active (deactivates all other routines for this user)
 */
export async function setActiveRoutine(
  userId: string,
  routineId: string
): Promise<void> {
  await db.transaction(async (tx) => {
    // Deactivate all routines for this user
    await tx
      .update(workoutRoutines)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(workoutRoutines.userId, userId));

    // Activate the specified routine
    await tx
      .update(workoutRoutines)
      .set({ isActive: true, updatedAt: new Date() })
      .where(
        and(eq(workoutRoutines.id, routineId), eq(workoutRoutines.userId, userId))
      );
  });
}

/**
 * Delete a workout routine (cascades to days, exercises, and sets)
 */
export async function deleteRoutine(
  userId: string,
  routineId: string
): Promise<void> {
  await db
    .delete(workoutRoutines)
    .where(
      and(eq(workoutRoutines.id, routineId), eq(workoutRoutines.userId, userId))
    );
}

/**
 * Update a routine's name
 */
export async function updateRoutineName(
  userId: string,
  routineId: string,
  newName: string
): Promise<void> {
  await db
    .update(workoutRoutines)
    .set({ name: newName, updatedAt: new Date() })
    .where(
      and(eq(workoutRoutines.id, routineId), eq(workoutRoutines.userId, userId))
    );
}
