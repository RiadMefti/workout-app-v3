/**
 * Exercise data types based on exercises.json structure
 */

export type TargetMuscle =
  | "abductors"
  | "abs"
  | "adductors"
  | "biceps"
  | "calves"
  | "cardiovascular system"
  | "delts"
  | "forearms"
  | "glutes"
  | "hamstrings"
  | "lats"
  | "levator scapulae"
  | "pectorals"
  | "quads"
  | "serratus anterior"
  | "spine"
  | "traps"
  | "triceps"
  | "upper back";

export type BodyPart =
  | "back"
  | "cardio"
  | "chest"
  | "lower arms"
  | "lower legs"
  | "neck"
  | "shoulders"
  | "upper arms"
  | "upper legs"
  | "waist";

export type Equipment =
  | "assisted"
  | "band"
  | "barbell"
  | "body weight"
  | "bosu ball"
  | "cable"
  | "dumbbell"
  | "elliptical machine"
  | "ez barbell"
  | "hammer"
  | "kettlebell"
  | "leverage machine"
  | "medicine ball"
  | "olympic barbell"
  | "resistance band"
  | "roller"
  | "rope"
  | "skierg machine"
  | "sled machine"
  | "smith machine"
  | "stability ball"
  | "stationary bike"
  | "stepmill machine"
  | "tire"
  | "trap bar"
  | "upper body ergometer"
  | "weighted"
  | "wheel roller";

export interface Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: TargetMuscle[];
  bodyParts: BodyPart[];
  equipments: Equipment[];
  secondaryMuscles: TargetMuscle[];
  instructions: string[];
}

export interface ExerciseFilters {
  targetMuscles?: TargetMuscle[];
  bodyParts?: BodyPart[];
  equipments?: Equipment[];
  excludeEquipments?: Equipment[];
  searchTerm?: string;
}

export interface ExerciseSearchParams extends ExerciseFilters {
  limit?: number;
  offset?: number;
}

export interface ProgramExercise {
  exercise: Exercise;
  sets?: number;
  reps?: string; // e.g., "8-12", "10", "AMRAP"
  restSeconds?: number;
  notes?: string;
}

export interface WorkoutProgram {
  programId: string;
  name: string;
  description?: string;
  exercises: ProgramExercise[];
  totalEstimatedMinutes?: number;
}
