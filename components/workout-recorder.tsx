"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface WorkoutDay {
  id: string;
  name: string;
  dayOrder: number;
  exercises: Array<{
    id: string;
    exerciseName: string;
    exerciseOrder: number;
    sets: Array<{
      id: string;
      setNumber: number;
      targetReps: number;
      targetWeight: number;
    }>;
  }>;
}

interface ActiveRoutine {
  id: string;
  name: string;
  days: WorkoutDay[];
}

interface NextWorkout {
  routine: {
    id: string;
    name: string;
  };
  nextDay: {
    id: string;
    name: string;
    dayOrder: number;
    exercises: Array<{
      id: string;
      exerciseName: string;
      exerciseOrder: number;
      sets: Array<{
        id: string;
        setNumber: number;
        targetReps: number;
        targetWeight: number;
      }>;
    }>;
  };
}

interface WorkoutRecorderProps {
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function WorkoutRecorder({
  userId,
  onComplete,
  onCancel,
}: WorkoutRecorderProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(
    null
  );
  const [nextWorkout, setNextWorkout] = useState<NextWorkout | null>(null);
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDaySelector, setShowDaySelector] = useState(false);

  // Fetch next workout on mount
  const fetchNextWorkout = async () => {
    setIsLoadingRoutine(true);
    try {
      const response = await fetch(`/api/workouts/next?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNextWorkout(data);
        // Automatically load the next workout
        loadWorkoutFromNextDay(data);
      } else {
        // If no next workout found, try to fetch active routine for manual selection
        await fetchActiveRoutine();
      }
    } catch (error) {
      console.error("Error fetching next workout:", error);
      // Fallback to fetching active routine
      await fetchActiveRoutine();
    } finally {
      setIsLoadingRoutine(false);
    }
  };

  const fetchActiveRoutine = async () => {
    setIsLoadingRoutine(true);
    try {
      const response = await fetch(`/api/routines/active?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.routine) {
          setActiveRoutine(data.routine);
        }
      }
    } catch (error) {
      console.error("Error fetching active routine:", error);
    } finally {
      setIsLoadingRoutine(false);
    }
  };

  useEffect(() => {
    fetchNextWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadWorkoutFromNextDay = (data: NextWorkout) => {
    const { nextDay } = data;
    setWorkoutName(nextDay.name);
    setSelectedDayId(nextDay.id);
    setExercises(
      nextDay.exercises.map((exercise, idx) => ({
        exerciseName: exercise.exerciseName,
        exerciseOrder: idx + 1,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          reps: set.targetReps,
          weight: set.targetWeight,
        })),
      }))
    );
  };

  const loadWorkoutFromDay = (dayId: string) => {
    if (!activeRoutine) return;

    const selectedDay = activeRoutine.days.find((day) => day.id === dayId);
    if (!selectedDay) return;

    setWorkoutName(selectedDay.name);
    setExercises(
      selectedDay.exercises.map((exercise, idx) => ({
        exerciseName: exercise.exerciseName,
        exerciseOrder: idx + 1,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          reps: set.targetReps,
          weight: set.targetWeight,
        })),
      }))
    );
  };

  const handleDaySelect = (dayId: string) => {
    setSelectedDayId(dayId);
    loadWorkoutFromDay(dayId);
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
    const updated = exercises.filter((_, i) => i !== index);
    // Re-order exercises
    setExercises(
      updated.map((ex, idx) => ({ ...ex, exerciseOrder: idx + 1 }))
    );
  };

  const updateExerciseName = (index: number, name: string) => {
    const updated = [...exercises];
    updated[index].exerciseName = name;
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
    exercise.sets = exercise.sets
      .filter((_, i) => i !== setIndex)
      .map((set, idx) => ({ ...set, setNumber: idx + 1 }));
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

  const handleSubmit = async () => {
    // Validation
    if (!workoutName.trim()) {
      alert("Please enter a workout name");
      return;
    }

    if (exercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    for (let i = 0; i < exercises.length; i++) {
      if (!exercises[i].exerciseName.trim()) {
        alert(`Please enter a name for exercise ${i + 1}`);
        return;
      }
      if (exercises[i].sets.length === 0) {
        alert(`Please add at least one set for ${exercises[i].exerciseName}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          routineId: nextWorkout?.routine.id || activeRoutine?.id,
          dayId: selectedDayId || null,
          workoutName: workoutName.trim(),
          exercises,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record workout");
      }

      // Success! Reset form
      setWorkoutName("");
      setExercises([]);
      setSelectedDayId("");

      if (onComplete) {
        onComplete();
      } else {
        alert("Workout recorded successfully! 🎉");
      }
    } catch (error) {
      console.error("Error recording workout:", error);
      alert("Failed to record workout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startCustomWorkout = () => {
    setSelectedDayId("");
    setWorkoutName("");
    setShowDaySelector(false);
    setExercises([
      {
        exerciseName: "",
        exerciseOrder: 1,
        sets: [{ setNumber: 1, reps: 0, weight: 0 }],
      },
    ]);
  };

  if (isLoadingRoutine) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Record Workout</h2>
          {nextWorkout && exercises.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Next workout: <span className="font-medium">{nextWorkout.nextDay.name}</span> from {nextWorkout.routine.name}
            </p>
          )}
        </div>
        {onCancel && (
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        )}
      </div>

      {/* Workout Selection - Only show if no exercises loaded yet */}
      {(activeRoutine || nextWorkout) && (exercises.length === 0 || showDaySelector) && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Workout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Select from {nextWorkout?.routine.name || activeRoutine?.name}
              </Label>
              <Select value={selectedDayId} onValueChange={handleDaySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workout day..." />
                </SelectTrigger>
                <SelectContent>
                  {activeRoutine?.days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      {day.name} ({day.exercises.length} exercises)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 border-t" />
            </div>

            <Button
              onClick={startCustomWorkout}
              variant="outline"
              className="w-full"
            >
              Start Custom Workout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workout Form */}
      {exercises.length > 0 && (
        <div className="space-y-4">
          {/* Show option to change workout if there's an active routine */}
          {(nextWorkout || activeRoutine) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Recording: {workoutName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {(nextWorkout || activeRoutine) && (
                    <Button
                      onClick={() => {
                        setExercises([]);
                        setWorkoutName("");
                        setSelectedDayId("");
                        setShowDaySelector(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Change Workout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workout Name */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g., Leg Day, Upper Body"
                />
              </div>
            </CardContent>
          </Card>

          {/* Exercises */}
          {exercises.map((exercise, exerciseIdx) => (
            <Card key={exerciseIdx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Input
                      value={exercise.exerciseName}
                      onChange={(e) =>
                        updateExerciseName(exerciseIdx, e.target.value)
                      }
                      placeholder="Exercise name (e.g., Barbell Squat)"
                      className="font-semibold"
                    />
                  </div>
                  <Button
                    onClick={() => removeExercise(exerciseIdx)}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Sets */}
                <div className="space-y-2">
                  <div className="grid grid-cols-[50px_1fr_1fr_40px] gap-2 text-sm font-medium text-muted-foreground">
                    <div>Set</div>
                    <div>Reps</div>
                    <div>Weight (lbs)</div>
                    <div></div>
                  </div>

                  {exercise.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className="grid grid-cols-[50px_1fr_1fr_40px] gap-2"
                    >
                      <div className="flex items-center justify-center font-medium">
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
                        step="0.5"
                      />
                      <Button
                        onClick={() => removeSet(exerciseIdx, setIdx)}
                        variant="ghost"
                        size="sm"
                        disabled={exercise.sets.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => addSet(exerciseIdx)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Set
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add Exercise Button */}
          <Button onClick={addExercise} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              onClick={() => {
                setExercises([]);
                setWorkoutName("");
                setSelectedDayId("");
                setShowDaySelector(false);
              }}
              variant="outline"
            >
              Start Over
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Complete Workout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
