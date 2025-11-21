"use client";

import { useState, useEffect } from "react";
import { Plus, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/lib/toast";

interface SetInput {
  reps: number;
  weight: number;
}

interface ExerciseInput {
  exerciseName: string;
  sets: SetInput[];
}

interface CompactWorkoutRecorderProps {
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function CompactWorkoutRecorder({
  userId,
  onComplete,
  onCancel,
}: CompactWorkoutRecorderProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [dayId, setDayId] = useState<string | null>(null);

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
            data.nextDay.exercises.map((ex: any) => ({
              exerciseName: ex.exerciseName,
              sets: ex.sets.map((s: any) => ({
                reps: s.targetReps,
                weight: s.targetWeight,
              })),
            }))
          );
        } else {
          setWorkoutName("Quick Workout");
          setExercises([{ exerciseName: "", sets: [{ reps: 10, weight: 0 }] }]);
        }
      } catch (error) {
        setWorkoutName("Quick Workout");
        setExercises([{ exerciseName: "", sets: [{ reps: 10, weight: 0 }] }]);
      } finally {
        setIsLoading(false);
      }
    }
    loadNextWorkout();
  }, [userId]);

  const updateExercise = (index: number, field: keyof ExerciseInput, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof SetInput, value: number) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const addSet = (exIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets.push({ reps: 10, weight: 0 });
    setExercises(updated);
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    if (updated[exIdx].sets.length > 1) {
      updated[exIdx].sets.splice(setIdx, 1);
    }
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([...exercises, { exerciseName: "", sets: [{ reps: 10, weight: 0 }] }]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    for (const ex of exercises) {
      if (!ex.exerciseName.trim()) {
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
          exercises: exercises.map((ex, idx) => ({
            exerciseName: ex.exerciseName,
            exerciseOrder: idx + 1,
            sets: ex.sets.map((s, sIdx) => ({
              setNumber: sIdx + 1,
              reps: s.reps,
              weight: s.weight,
            })),
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to record workout");

      toast.success("Workout recorded!");
      if (onComplete) onComplete();
    } catch (error) {
      toast.error("Failed to record workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">Loading workout...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Input
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout name"
          className="flex-1 font-medium"
        />
        {onCancel && (
          <Button onClick={onCancel} variant="ghost" size="sm" className="ml-2">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((exercise, exIdx) => (
          <div key={exIdx} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={exercise.exerciseName}
                onChange={(e) => updateExercise(exIdx, "exerciseName", e.target.value)}
                placeholder="Exercise name"
                className="flex-1 text-sm"
              />
              {exercises.length > 1 && (
                <Button
                  onClick={() => removeExercise(exIdx)}
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[30px_1fr_1fr_30px] gap-1 text-xs text-muted-foreground">
                <div>#</div>
                <div>Reps</div>
                <div>lbs</div>
                <div></div>
              </div>

              {exercise.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-[30px_1fr_1fr_30px] gap-1 items-center">
                  <div className="text-xs text-center">{setIdx + 1}</div>
                  <Input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) => updateSet(exIdx, setIdx, "reps", parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                  <Input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(exIdx, setIdx, "weight", parseFloat(e.target.value) || 0)}
                    step="2.5"
                    className="h-8 text-sm"
                  />
                  <Button
                    onClick={() => removeSet(exIdx, setIdx)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={exercise.sets.length === 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <Button
                onClick={() => addSet(exIdx)}
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Set
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={addExercise} variant="outline" size="sm" className="flex-1">
          <Plus className="h-4 w-4 mr-1" />
          Exercise
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} size="sm" className="flex-1">
          <CheckCircle className="h-4 w-4 mr-1" />
          {isSubmitting ? "Saving..." : "Complete"}
        </Button>
      </div>
    </Card>
  );
}
