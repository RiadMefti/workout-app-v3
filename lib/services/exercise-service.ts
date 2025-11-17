import type { Exercise, ExerciseSearchParams } from "@/lib/types/exercise";
import exercisesData from "@/db/exercises.json";

// Type-safe exercises array
const exercises = exercisesData as Exercise[];

/**
 * Simplified Exercise Service for LLM workout generation
 * Only contains the search method needed by WorkoutGenerator
 */
export class ExerciseService {
  private static exercises: Exercise[] = exercises;

  /**
   * Search exercises with filters and pagination
   * Used by WorkoutGenerator to fetch exercises for workout plans
   */
  static search(params: ExerciseSearchParams): {
    exercises: Exercise[];
    total: number;
    hasMore: boolean;
  } {
    let results = [...this.exercises];

    // Filter by target muscles
    if (params.targetMuscles && params.targetMuscles.length > 0) {
      results = results.filter((ex) =>
        params.targetMuscles!.some((muscle) => ex.targetMuscles.includes(muscle))
      );
    }

    // Filter by equipment (include)
    if (params.equipments && params.equipments.length > 0) {
      results = results.filter((ex) =>
        params.equipments!.some((equip) => ex.equipments.includes(equip))
      );
    }

    // Filter by equipment (exclude)
    if (params.excludeEquipments && params.excludeEquipments.length > 0) {
      results = results.filter(
        (ex) =>
          !params.excludeEquipments!.some((equip) => ex.equipments.includes(equip))
      );
    }

    const total = results.length;
    const offset = params.offset || 0;
    const limit = params.limit || 20;

    // Apply pagination
    const paginated = results.slice(offset, offset + limit);

    return {
      exercises: paginated,
      total,
      hasMore: offset + limit < total,
    };
  }
}
