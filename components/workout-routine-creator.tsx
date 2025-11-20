"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

interface SetInput {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

interface ExerciseInput {
  exerciseName: string;
  exerciseOrder: number;
  sets: SetInput[];
}

interface DayInput {
  name: string;
  dayOrder: number;
  exercises: ExerciseInput[];
}

interface WorkoutRoutineCreatorProps {
  initialRoutine?: {
    name: string;
    days: DayInput[];
  };
  onCreateRoutine: (routine: {
    name: string;
    days: DayInput[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export function WorkoutRoutineCreator({
  initialRoutine,
  onCreateRoutine,
  onCancel,
}: WorkoutRoutineCreatorProps) {
  const [routineName, setRoutineName] = useState(initialRoutine?.name || "");
  const [days, setDays] = useState<DayInput[]>(
    initialRoutine?.days || [
      {
        name: "",
        dayOrder: 1,
        exercises: [],
      },
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDay = () => {
    setDays([
      ...days,
      {
        name: "",
        dayOrder: days.length + 1,
        exercises: [],
      },
    ]);
  };

  const removeDay = (dayIndex: number) => {
    const newDays = days.filter((_, index) => index !== dayIndex);
    // Reorder remaining days
    newDays.forEach((day, index) => {
      day.dayOrder = index + 1;
    });
    setDays(newDays);
  };

  const updateDayName = (dayIndex: number, name: string) => {
    const newDays = [...days];
    newDays[dayIndex].name = name;
    setDays(newDays);
  };

  const addExercise = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.push({
      exerciseName: "",
      exerciseOrder: newDays[dayIndex].exercises.length + 1,
      sets: [{ setNumber: 1, targetReps: 10, targetWeight: 0 }],
    });
    setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises = newDays[dayIndex].exercises.filter(
      (_, index) => index !== exerciseIndex
    );
    // Reorder remaining exercises
    newDays[dayIndex].exercises.forEach((exercise, index) => {
      exercise.exerciseOrder = index + 1;
    });
    setDays(newDays);
  };

  const updateExerciseName = (
    dayIndex: number,
    exerciseIndex: number,
    name: string
  ) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex].exerciseName = name;
    setDays(newDays);
  };

  const addSet = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...days];
    const exercise = newDays[dayIndex].exercises[exerciseIndex];
    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      targetReps: 10,
      targetWeight: 0,
    });
    setDays(newDays);
  };

  const removeSet = (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex].sets = newDays[dayIndex].exercises[
      exerciseIndex
    ].sets.filter((_, index) => index !== setIndex);
    // Reorder remaining sets
    newDays[dayIndex].exercises[exerciseIndex].sets.forEach((set, index) => {
      set.setNumber = index + 1;
    });
    setDays(newDays);
  };

  const updateSet = (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    field: "targetReps" | "targetWeight",
    value: number
  ) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exerciseIndex].sets[setIndex][field] = value;
    setDays(newDays);
  };

  const handleSubmit = async () => {
    if (!routineName.trim()) {
      toast.error("Please enter a routine name");
      return;
    }

    if (days.length === 0) {
      toast.error("Please add at least one day");
      return;
    }

    // Validate all days have names and exercises
    for (const day of days) {
      if (!day.name.trim()) {
        toast.error("Please name all workout days");
        return;
      }
      if (day.exercises.length === 0) {
        toast.error(`Please add exercises to ${day.name}`);
        return;
      }
      for (const exercise of day.exercises) {
        if (!exercise.exerciseName.trim()) {
          toast.error(`Please name all exercises in ${day.name}`);
          return;
        }
        if (exercise.sets.length === 0) {
          toast.error(`Please add sets to ${exercise.exerciseName}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await onCreateRoutine({
        name: routineName,
        days,
      });
      toast.success("Routine created successfully");
      // Reset form
      setRoutineName("");
      setDays([
        {
          name: "",
          dayOrder: 1,
          exercises: [],
        },
      ]);
    } catch (error) {
      console.error("Failed to create routine:", error);
      toast.error("Failed to create routine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="space-y-2">
        <Label htmlFor="routine-name" className="text-lg font-semibold">
          Routine Name
        </Label>
        <Input
          id="routine-name"
          placeholder="e.g., 5-Day PPL, Upper/Lower Split"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Workout Days</h3>
          <Button onClick={addDay} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Day
          </Button>
        </div>

        {days.map((day, dayIndex) => (
          <Card key={dayIndex} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Input
                    placeholder={`Day ${day.dayOrder} name (e.g., Push Day, Leg Day)`}
                    value={day.name}
                    onChange={(e) => updateDayName(dayIndex, e.target.value)}
                    className="font-semibold"
                  />
                </div>
                <Button
                  onClick={() => removeDay(dayIndex)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Exercises</Label>
                <Button
                  onClick={() => addExercise(dayIndex)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Exercise
                </Button>
              </div>

              {day.exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exerciseIndex}
                  className="border rounded-lg p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Exercise name (e.g., Barbell Squat)"
                      value={exercise.exerciseName}
                      onChange={(e) =>
                        updateExerciseName(dayIndex, exerciseIndex, e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      onClick={() => removeExercise(dayIndex, exerciseIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Sets
                      </Label>
                      <Button
                        onClick={() => addSet(dayIndex, exerciseIndex)}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Set
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-muted-foreground w-12">
                            Set {set.setNumber}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              placeholder="Reps"
                              value={set.targetReps}
                              onChange={(e) =>
                                updateSet(
                                  dayIndex,
                                  exerciseIndex,
                                  setIndex,
                                  "targetReps",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-8"
                            />
                            <span className="text-muted-foreground">reps @</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="Weight"
                              value={set.targetWeight}
                              onChange={(e) =>
                                updateSet(
                                  dayIndex,
                                  exerciseIndex,
                                  setIndex,
                                  "targetWeight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-8"
                            />
                            <span className="text-muted-foreground">lbs</span>
                          </div>
                          <Button
                            onClick={() =>
                              removeSet(dayIndex, exerciseIndex, setIndex)
                            }
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {day.exercises.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No exercises yet. Click "Add Exercise" to get started.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button onClick={onCancel} variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Routine"}
        </Button>
      </div>
    </div>
  );
}
