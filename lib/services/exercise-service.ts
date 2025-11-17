import type {
  Exercise,
  ExerciseFilters,
  ExerciseSearchParams,
  TargetMuscle,
  BodyPart,
  Equipment,
} from "@/lib/types/exercise";
import exercisesData from "@/db/exercises.json";

// Type-safe exercises array
const exercises = exercisesData as Exercise[];

/**
 * Exercise Service
 * Provides search and filter capabilities for workout program generation
 */
export class ExerciseService {
  private static exercises: Exercise[] = exercises;

  /**
   * Get all exercises (use with caution - 1500 items)
   */
  static getAll(): Exercise[] {
    return this.exercises;
  }

  /**
   * Get exercise by ID
   */
  static getById(exerciseId: string): Exercise | undefined {
    return this.exercises.find((ex) => ex.exerciseId === exerciseId);
  }

  /**
   * Get multiple exercises by IDs
   */
  static getByIds(exerciseIds: string[]): Exercise[] {
    const idSet = new Set(exerciseIds);
    return this.exercises.filter((ex) => idSet.has(ex.exerciseId));
  }

  /**
   * Search exercises with filters and pagination
   */
  static search(params: ExerciseSearchParams): {
    exercises: Exercise[];
    total: number;
    hasMore: boolean;
  } {
    const filtered = this.filterExercises(params);

    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 20;

    // Apply pagination
    const paginated = filtered.slice(offset, offset + limit);

    return {
      exercises: paginated,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Filter exercises based on criteria
   */
  private static filterExercises(filters: ExerciseFilters): Exercise[] {
    let results = [...this.exercises];

    // Filter by target muscles
    if (filters.targetMuscles && filters.targetMuscles.length > 0) {
      results = results.filter((ex) =>
        filters.targetMuscles!.some((muscle) =>
          ex.targetMuscles.includes(muscle)
        )
      );
    }

    // Filter by body parts
    if (filters.bodyParts && filters.bodyParts.length > 0) {
      results = results.filter((ex) =>
        filters.bodyParts!.some((part) => ex.bodyParts.includes(part))
      );
    }

    // Filter by equipment (include)
    if (filters.equipments && filters.equipments.length > 0) {
      results = results.filter((ex) =>
        filters.equipments!.some((equip) => ex.equipments.includes(equip))
      );
    }

    // Filter by equipment (exclude)
    if (filters.excludeEquipments && filters.excludeEquipments.length > 0) {
      results = results.filter(
        (ex) =>
          !filters.excludeEquipments!.some((equip) =>
            ex.equipments.includes(equip)
          )
      );
    }

    // Search by name
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      results = results.filter((ex) =>
        ex.name.toLowerCase().includes(searchLower)
      );
    }

    return results;
  }

  /**
   * Get exercises by target muscle groups
   * Useful for creating balanced programs
   */
  static getByMuscleGroups(
    muscleGroups: TargetMuscle[],
    options?: {
      equipments?: Equipment[];
      excludeEquipments?: Equipment[];
      limit?: number;
    }
  ): Map<TargetMuscle, Exercise[]> {
    const result = new Map<TargetMuscle, Exercise[]>();

    for (const muscle of muscleGroups) {
      const filtered = this.search({
        targetMuscles: [muscle],
        equipments: options?.equipments,
        excludeEquipments: options?.excludeEquipments,
        limit: options?.limit || 10,
      });

      result.set(muscle, filtered.exercises);
    }

    return result;
  }

  /**
   * Get exercises for a specific body part
   */
  static getByBodyPart(
    bodyPart: BodyPart,
    options?: {
      equipments?: Equipment[];
      excludeEquipments?: Equipment[];
      limit?: number;
    }
  ): Exercise[] {
    return this.search({
      bodyParts: [bodyPart],
      equipments: options?.equipments,
      excludeEquipments: options?.excludeEquipments,
      limit: options?.limit || 20,
    }).exercises;
  }

  /**
   * Get exercises available with specific equipment
   */
  static getByEquipment(
    equipment: Equipment,
    options?: {
      targetMuscles?: TargetMuscle[];
      bodyParts?: BodyPart[];
      limit?: number;
    }
  ): Exercise[] {
    return this.search({
      equipments: [equipment],
      targetMuscles: options?.targetMuscles,
      bodyParts: options?.bodyParts,
      limit: options?.limit || 20,
    }).exercises;
  }

  /**
   * Get random exercises matching criteria
   * Useful for variety in workout programs
   */
  static getRandom(
    count: number,
    filters?: ExerciseFilters
  ): Exercise[] {
    const filtered = filters
      ? this.filterExercises(filters)
      : [...this.exercises];

    // Shuffle array
    const shuffled = filtered.sort(() => Math.random() - 0.5);

    return shuffled.slice(0, count);
  }

  /**
   * Get metadata about available options
   */
  static getMetadata() {
    return {
      totalExercises: this.exercises.length,
      targetMuscles: this.getUniqueTargetMuscles(),
      bodyParts: this.getUniqueBodyParts(),
      equipments: this.getUniqueEquipments(),
    };
  }

  /**
   * Get all unique target muscles in the dataset
   */
  private static getUniqueTargetMuscles(): TargetMuscle[] {
    const muscles = new Set<TargetMuscle>();
    this.exercises.forEach((ex) => {
      ex.targetMuscles.forEach((m) => muscles.add(m));
    });
    return Array.from(muscles).sort();
  }

  /**
   * Get all unique body parts in the dataset
   */
  private static getUniqueBodyParts(): BodyPart[] {
    const parts = new Set<BodyPart>();
    this.exercises.forEach((ex) => {
      ex.bodyParts.forEach((p) => parts.add(p));
    });
    return Array.from(parts).sort();
  }

  /**
   * Get all unique equipment types in the dataset
   */
  private static getUniqueEquipments(): Equipment[] {
    const equips = new Set<Equipment>();
    this.exercises.forEach((ex) => {
      ex.equipments.forEach((e) => equips.add(e));
    });
    return Array.from(equips).sort();
  }

  /**
   * Get exercises that work multiple muscle groups (compound exercises)
   */
  static getCompoundExercises(
    minMuscles: number = 2,
    filters?: ExerciseFilters
  ): Exercise[] {
    const filtered = filters
      ? this.filterExercises(filters)
      : [...this.exercises];

    return filtered.filter(
      (ex) =>
        ex.targetMuscles.length + ex.secondaryMuscles.length >= minMuscles
    );
  }

  /**
   * Get exercises that isolate a specific muscle
   */
  static getIsolationExercises(
    targetMuscle: TargetMuscle,
    filters?: Omit<ExerciseFilters, "targetMuscles">
  ): Exercise[] {
    const results = this.search({
      ...filters,
      targetMuscles: [targetMuscle],
    }).exercises;

    // Filter for exercises with minimal secondary muscles
    return results.filter((ex) => ex.secondaryMuscles.length <= 1);
  }

  /**
   * Get complementary exercises (opposite muscle groups)
   * e.g., biceps <-> triceps, chest <-> back
   */
  static getComplementaryExercises(
    muscle: TargetMuscle
  ): TargetMuscle[] {
    const complementaryMap: Partial<Record<TargetMuscle, TargetMuscle[]>> = {
      biceps: ["triceps"],
      triceps: ["biceps"],
      pectorals: ["lats", "upper back"],
      lats: ["pectorals"],
      "upper back": ["pectorals"],
      quads: ["hamstrings"],
      hamstrings: ["quads"],
      abs: ["spine"],
    };

    return complementaryMap[muscle] || [];
  }

  /**
   * Build a balanced workout plan
   * Selects exercises across muscle groups with equipment constraints
   */
  static buildBalancedWorkout(params: {
    muscleGroups: TargetMuscle[];
    equipments?: Equipment[];
    excludeEquipments?: Equipment[];
    exercisesPerMuscle?: number;
    includeCompounds?: boolean;
  }): Map<TargetMuscle, Exercise[]> {
    const {
      muscleGroups,
      equipments,
      excludeEquipments,
      exercisesPerMuscle = 2,
      includeCompounds = true,
    } = params;

    const result = new Map<TargetMuscle, Exercise[]>();

    for (const muscle of muscleGroups) {
      const exercises: Exercise[] = [];

      // Add compound exercise if requested
      if (includeCompounds) {
        const compounds = this.getCompoundExercises(2, {
          targetMuscles: [muscle],
          equipments,
          excludeEquipments,
        });
        if (compounds.length > 0) {
          exercises.push(compounds[0]);
        }
      }

      // Fill remaining slots with varied exercises
      const remaining = exercisesPerMuscle - exercises.length;
      if (remaining > 0) {
        const additional = this.getRandom(remaining, {
          targetMuscles: [muscle],
          equipments,
          excludeEquipments,
        });
        exercises.push(...additional);
      }

      result.set(muscle, exercises);
    }

    return result;
  }
}
