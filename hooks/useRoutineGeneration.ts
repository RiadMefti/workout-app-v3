import { useState } from "react";

interface GenerateRoutineInput {
  experienceLevel: string;
  daysPerWeek: number;
  preferences: string;
  routineName: string;
}

interface RoutineSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

interface RoutineExercise {
  exerciseName: string;
  exerciseOrder: number;
  sets: RoutineSet[];
}

interface RoutineDay {
  name: string;
  dayOrder: number;
  exercises: RoutineExercise[];
}

interface GeneratedRoutine {
  name: string;
  days: RoutineDay[];
}

/**
 * API response types for runtime data
 */
interface APIRoutineSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number | null;
}

interface APIRoutineExercise {
  exerciseName: string;
  exerciseOrder: number;
  sets: APIRoutineSet[];
}

interface APIRoutineDay {
  name: string;
  dayOrder: number;
  exercises: APIRoutineExercise[];
}

interface APIRoutine {
  name: string;
  days: APIRoutineDay[];
}

/**
 * Custom hook for AI routine generation workflow
 * Handles the API call, loading state, error handling, and data normalization
 */
export function useRoutineGeneration() {
  const [generatedRoutine, setGeneratedRoutine] =
    useState<GeneratedRoutine | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a workout routine using AI
   */
  const generateRoutine = async (input: GenerateRoutineInput) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/routines/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to generate routine");
      }

      const data: { routine: APIRoutine } = await response.json();

      // Normalize data: convert null targetWeight to 0 for form compatibility
      const normalizedRoutine: GeneratedRoutine = {
        ...data.routine,
        days: data.routine.days.map((day: APIRoutineDay) => ({
          ...day,
          exercises: day.exercises.map((exercise: APIRoutineExercise) => ({
            ...exercise,
            sets: exercise.sets.map((set: APIRoutineSet) => ({
              ...set,
              targetWeight: set.targetWeight ?? 0,
            })),
          })),
        })),
      };

      setGeneratedRoutine(normalizedRoutine);
      return normalizedRoutine;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate routine";
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Reset the generation state
   */
  const reset = () => {
    setGeneratedRoutine(null);
    setIsGenerating(false);
    setError(null);
  };

  return {
    generatedRoutine,
    isGenerating,
    error,
    generateRoutine,
    reset,
  };
}
