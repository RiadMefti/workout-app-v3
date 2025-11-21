"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import Link from "next/link";

interface SetInput {
  setNumber: number;
  reps: number;
  weight: number;
}

interface ExerciseInput {
  exerciseName: string;
  exerciseOrder: number;
  sets: SetInput[];
}

interface SimplifiedWorkoutRecorderProps {
  userId: string;
}

export function SimplifiedWorkoutRecorder({
  userId,
}: SimplifiedWorkoutRecorderProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [dayId, setDayId] = useState<string | null>(null);

  // Auto-load next workout
  useEffect(() => {
    async function loadNextWorkout() {
      try {
        const response = await fetch(`/api/workouts/next?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setWorkoutName(data.nextDay.name);
          setRoutineId(data.routine.id);
          setDayId(data.nextDay.id);
          setExercises(
            data.nextDay.exercises.map((ex: any, idx: number) => ({
              exerciseName: ex.exerciseName,
              exerciseOrder: idx + 1,
              sets: ex.sets.map((s: any) => ({
                setNumber: s.setNumber,
                reps: s.targetReps,
                weight: s.targetWeight,
              })),
            }))
          );
        } else {
          // No next workout, start fresh
          setWorkoutName("");
          setExercises([
            {
              exerciseName: "",
              exerciseOrder: 1,
              sets: [{ setNumber: 1, reps: 0, weight: 0 }],
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading workout:", error);
        setExercises([
          {
            exerciseName: "",
            exerciseOrder: 1,
            sets: [{ setNumber: 1, reps: 0, weight: 0 }],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadNextWorkout();
  }, [userId]);

  const updateExerciseName = (index: number, name: string) => {
    const updated = [...exercises];
    updated[index].exerciseName = name;
    setExercises(updated);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      reps: 0,
      weight: 0,
    });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    if (exercise.sets.length === 1) return;
    exercise.sets = exercise.sets
      .filter((_, i) => i !== setIndex)
      .map((set, idx) => ({ ...set, setNumber: idx + 1 }));
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: "",
        exerciseOrder: exercises.length + 1,
        sets: [{ setNumber: 1, reps: 0, weight: 0 }],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    const updated = exercises
      .filter((_, i) => i !== index)
      .map((ex, idx) => ({ ...ex, exerciseOrder: idx + 1 }));
    setExercises(updated);
  };

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    if (exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    for (const exercise of exercises) {
      if (!exercise.exerciseName.trim()) {
        toast.error("Please name all exercises");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          routineId,
          dayId,
          workoutName: workoutName.trim(),
          exercises,
        }),
      });

      if (!response.ok) throw new Error("Failed to record workout");

      toast.success("Workout recorded!");

      // Reset and reload next workout
      setIsLoading(true);
      const nextResponse = await fetch(`/api/workouts/next?userId=${userId}`);
      if (nextResponse.ok) {
        const data = await nextResponse.json();
        setWorkoutName(data.nextDay.name);
        setRoutineId(data.routine.id);
        setDayId(data.nextDay.id);
        setExercises(
          data.nextDay.exercises.map((ex: any, idx: number) => ({
            exerciseName: ex.exerciseName,
            exerciseOrder: idx + 1,
            sets: ex.sets.map((s: any) => ({
              setNumber: s.setNumber,
              reps: s.targetReps,
              weight: s.targetWeight,
            })),
          }))
        );
      } else {
        setWorkoutName("");
        setExercises([
          {
            exerciseName: "",
            exerciseOrder: 1,
            sets: [{ setNumber: 1, reps: 0, weight: 0 }],
          },
        ]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error recording workout:", error);
      toast.error("Failed to record workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Record Workout</h1>
          <p className="text-sm text-muted-foreground">
            {dayId ? "Following your routine" : "Custom workout"}
          </p>
        </div>
      </div>

      {/* Workout Name */}
      <div className="mb-4">
        <Input
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout name"
          className="text-lg font-semibold"
        />
      </div>

      {/* Exercises */}
      <div className="space-y-3 mb-4">
        {exercises.map((exercise, exerciseIdx) => (
          <Card key={exerciseIdx} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Input
                value={exercise.exerciseName}
                onChange={(e) => updateExerciseName(exerciseIdx, e.target.value)}
                placeholder="Exercise name"
                className="flex-1 font-medium"
              />
              {exercises.length > 1 && (
                <Button
                  onClick={() => removeExercise(exerciseIdx)}
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sets Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground">
                <div>Set</div>
                <div>Reps</div>
                <div>Weight</div>
                <div></div>
              </div>

              {exercise.sets.map((set, setIdx) => (
                <div
                  key={setIdx}
                  className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center"
                >
                  <div className="text-center font-medium text-sm">
                    {set.setNumber}
                  </div>
                  <Input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) =>
                      updateSet(
                        exerciseIdx,
                        setIdx,
                        "reps",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="h-9"
                  />
                  <Input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) =>
                      updateSet(
                        exerciseIdx,
                        setIdx,
                        "weight",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    step="2.5"
                    className="h-9"
                  />
                  <Button
                    onClick={() => removeSet(exerciseIdx, setIdx)}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    disabled={exercise.sets.length === 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <Button
                onClick={() => addSet(exerciseIdx)}
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Set
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Exercise */}
      <Button
        onClick={addExercise}
        variant="outline"
        className="w-full mb-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Exercise
      </Button>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="container max-w-2xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Complete Workout
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
