import { ExerciseService } from "./exercise-service";
import type { Exercise, TargetMuscle, Equipment } from "@/lib/types/exercise";

export type WorkoutSplit =
  | "fullbody"
  | "upper-lower"
  | "push-pull-legs"
  | "push-pull-legs-upper-lower";

export interface WorkoutDay {
  name: string;
  focus: string[];
  exercises: Exercise[];
}

export interface WorkoutPlan {
  split: WorkoutSplit;
  daysPerWeek: number;
  workoutDays: WorkoutDay[];
}

/**
 * Simplified workout generator for LLM tool usage
 */
export class WorkoutGenerator {
  /**
   * Determine workout split based on training frequency
   */
  static determineSplit(daysPerWeek: number): WorkoutSplit {
    if (daysPerWeek <= 3) return "fullbody";
    if (daysPerWeek === 4) return "upper-lower";
    if (daysPerWeek === 5) return "push-pull-legs-upper-lower";
    return "push-pull-legs"; // 6-7 days
  }

  /**
   * Generate a complete workout plan based on days per week
   */
  static generatePlan(params: {
    daysPerWeek: number;
    experienceLevel: "beginner" | "intermediate" | "advanced";
    availableEquipment?: Equipment[];
  }): WorkoutPlan {
    const { daysPerWeek, experienceLevel, availableEquipment } = params;
    const split = this.determineSplit(daysPerWeek);

    // Adjust exercises per muscle group based on experience
    const exercisesPerMuscle =
      experienceLevel === "beginner" ? 1 : experienceLevel === "intermediate" ? 2 : 3;

    let workoutDays: WorkoutDay[];

    switch (split) {
      case "fullbody":
        workoutDays = this.generateFullBodyDays(
          daysPerWeek,
          exercisesPerMuscle,
          availableEquipment
        );
        break;
      case "upper-lower":
        workoutDays = this.generateUpperLowerDays(
          exercisesPerMuscle,
          availableEquipment
        );
        break;
      case "push-pull-legs":
        workoutDays = this.generatePushPullLegsDays(
          daysPerWeek === 6 ? 2 : 1,
          exercisesPerMuscle,
          availableEquipment
        );
        break;
      case "push-pull-legs-upper-lower":
        workoutDays = this.generatePushPullLegsUpperLowerDays(
          exercisesPerMuscle,
          availableEquipment
        );
        break;
    }

    return {
      split,
      daysPerWeek,
      workoutDays,
    };
  }

  /**
   * Generate full body workout days (1-3x per week)
   */
  private static generateFullBodyDays(
    daysPerWeek: number,
    exercisesPerMuscle: number,
    equipment?: Equipment[]
  ): WorkoutDay[] {
    const mainMuscles: TargetMuscle[] = [
      "pectorals",
      "lats",
      "delts",
      "quads",
      "hamstrings",
      "glutes",
    ];

    const days: WorkoutDay[] = [];

    for (let i = 0; i < daysPerWeek; i++) {
      const exercises = this.selectExercises(
        mainMuscles,
        exercisesPerMuscle,
        equipment
      );

      days.push({
        name: `Full Body ${i + 1}`,
        focus: mainMuscles,
        exercises,
      });
    }

    return days;
  }

  /**
   * Generate upper/lower split (4x per week)
   */
  private static generateUpperLowerDays(
    exercisesPerMuscle: number,
    equipment?: Equipment[]
  ): WorkoutDay[] {
    const upperMuscles: TargetMuscle[] = [
      "pectorals",
      "lats",
      "delts",
      "biceps",
      "triceps",
    ];
    const lowerMuscles: TargetMuscle[] = [
      "quads",
      "hamstrings",
      "glutes",
      "calves",
    ];

    return [
      {
        name: "Upper Body 1",
        focus: upperMuscles,
        exercises: this.selectExercises(upperMuscles, exercisesPerMuscle, equipment),
      },
      {
        name: "Lower Body 1",
        focus: lowerMuscles,
        exercises: this.selectExercises(lowerMuscles, exercisesPerMuscle, equipment),
      },
      {
        name: "Upper Body 2",
        focus: upperMuscles,
        exercises: this.selectExercises(upperMuscles, exercisesPerMuscle, equipment),
      },
      {
        name: "Lower Body 2",
        focus: lowerMuscles,
        exercises: this.selectExercises(lowerMuscles, exercisesPerMuscle, equipment),
      },
    ];
  }

  /**
   * Generate push/pull/legs split (6-7x per week)
   */
  private static generatePushPullLegsDays(
    cycles: number,
    exercisesPerMuscle: number,
    equipment?: Equipment[]
  ): WorkoutDay[] {
    const pushMuscles: TargetMuscle[] = ["pectorals", "delts", "triceps"];
    const pullMuscles: TargetMuscle[] = ["lats", "upper back", "biceps", "traps"];
    const legMuscles: TargetMuscle[] = ["quads", "hamstrings", "glutes", "calves"];

    const days: WorkoutDay[] = [];

    for (let i = 0; i < cycles; i++) {
      days.push(
        {
          name: `Push ${i + 1}`,
          focus: pushMuscles,
          exercises: this.selectExercises(pushMuscles, exercisesPerMuscle, equipment),
        },
        {
          name: `Pull ${i + 1}`,
          focus: pullMuscles,
          exercises: this.selectExercises(pullMuscles, exercisesPerMuscle, equipment),
        },
        {
          name: `Legs ${i + 1}`,
          focus: legMuscles,
          exercises: this.selectExercises(legMuscles, exercisesPerMuscle, equipment),
        }
      );
    }

    return days;
  }

  /**
   * Generate push/pull/legs + upper/lower (5x per week)
   */
  private static generatePushPullLegsUpperLowerDays(
    exercisesPerMuscle: number,
    equipment?: Equipment[]
  ): WorkoutDay[] {
    const pushMuscles: TargetMuscle[] = ["pectorals", "delts", "triceps"];
    const pullMuscles: TargetMuscle[] = ["lats", "upper back", "biceps", "traps"];
    const legMuscles: TargetMuscle[] = ["quads", "hamstrings", "glutes", "calves"];
    const upperMuscles: TargetMuscle[] = [
      "pectorals",
      "lats",
      "delts",
      "biceps",
      "triceps",
    ];
    const lowerMuscles: TargetMuscle[] = [
      "quads",
      "hamstrings",
      "glutes",
      "calves",
    ];

    return [
      {
        name: "Push",
        focus: pushMuscles,
        exercises: this.selectExercises(pushMuscles, exercisesPerMuscle, equipment),
      },
      {
        name: "Pull",
        focus: pullMuscles,
        exercises: this.selectExercises(pullMuscles, exercisesPerMuscle, equipment),
      },
      {
        name: "Legs",
        focus: legMuscles,
        exercises: this.selectExercises(legMuscles, exercisesPerMuscle, equipment),
      },
      {
        name: "Upper",
        focus: upperMuscles,
        exercises: this.selectExercises(upperMuscles, exercisesPerMuscle, equipment),
      },
      {
        name: "Lower",
        focus: lowerMuscles,
        exercises: this.selectExercises(lowerMuscles, exercisesPerMuscle, equipment),
      },
    ];
  }

  /**
   * Select exercises for given muscle groups
   */
  private static selectExercises(
    muscles: TargetMuscle[],
    exercisesPerMuscle: number,
    equipment?: Equipment[]
  ): Exercise[] {
    const allExercises: Exercise[] = [];

    for (const muscle of muscles) {
      const exercises = ExerciseService.search({
        targetMuscles: [muscle],
        equipments: equipment,
        limit: exercisesPerMuscle,
      }).exercises;

      allExercises.push(...exercises);
    }

    return allExercises;
  }

  /**
   * Format workout plan for LLM display
   */
  static formatPlanForDisplay(plan: WorkoutPlan): string {
    let output = `# ${plan.daysPerWeek} Day ${this.getSplitName(plan.split)} Workout Plan\n\n`;

    plan.workoutDays.forEach((day, index) => {
      output += `## Day ${index + 1}: ${day.name}\n`;
      output += `**Focus:** ${day.focus.join(", ")}\n\n`;
      output += `**Exercises:**\n`;

      day.exercises.forEach((exercise, i) => {
        output += `${i + 1}. **${exercise.name}**\n`;
        output += `   - Target: ${exercise.targetMuscles.join(", ")}\n`;
        output += `   - Equipment: ${exercise.equipments.join(", ")}\n\n`;
      });

      output += "\n";
    });

    return output;
  }

  private static getSplitName(split: WorkoutSplit): string {
    switch (split) {
      case "fullbody":
        return "Full Body";
      case "upper-lower":
        return "Upper/Lower";
      case "push-pull-legs":
        return "Push/Pull/Legs";
      case "push-pull-legs-upper-lower":
        return "Push/Pull/Legs + Upper/Lower";
    }
  }
}
