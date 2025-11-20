"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutRoutineCreator } from "./workout-routine-creator";
import { WorkoutRoutineList } from "./workout-routine-list";
import { AIRoutineInputForm } from "./ai-routine-input-form";

interface RoutineSet {
  id: string;
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

interface RoutineExercise {
  id: string;
  exerciseName: string;
  exerciseOrder: number;
  sets: RoutineSet[];
}

interface RoutineDay {
  id: string;
  name: string;
  dayOrder: number;
  exercises: RoutineExercise[];
}

interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  days: RoutineDay[];
}

interface WorkoutRoutineManagerProps {
  userId: string;
}

export function WorkoutRoutineManager({ userId }: WorkoutRoutineManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createMode, setCreateMode] = useState<"" | "ai" | "custom">("");
  const [generatedRoutine, setGeneratedRoutine] = useState<any>(null);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch routines on mount
  const fetchRoutines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/routines?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch routines");
      }
      const data = await response.json();
      setRoutines(data.routines || []);
    } catch (err) {
      console.error("Error fetching routines:", err);
      setError("Failed to load workout routines");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [userId]);

  const handleCreateRoutine = async (routine: {
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
          targetWeight: number;
        }[];
      }[];
    }[];
  }) => {
    try {
      const response = await fetch("/api/routines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...routine,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create routine");
      }

      const data = await response.json();

      // Refresh routines list
      await fetchRoutines();

      // Close create form and reset
      setShowCreateForm(false);
      setCreateMode("");
      setGeneratedRoutine(null);
    } catch (err) {
      console.error("Error creating routine:", err);
      throw err; // Re-throw to let the creator component handle it
    }
  };

  const handleSetActive = async (routineId: string) => {
    try {
      const response = await fetch("/api/routines/active", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          routineId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set active routine");
      }

      // Refresh routines list
      await fetchRoutines();
    } catch (err) {
      console.error("Error setting active routine:", err);
      alert("Failed to set active routine. Please try again.");
    }
  };

  const handleGenerateRoutine = async (input: {
    experienceLevel: string;
    daysPerWeek: number;
    preferences: string;
    routineName: string;
  }) => {
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

    const data = await response.json();
    setGeneratedRoutine(data.routine);
    setCreateMode("ai"); // Show the editable preview
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchRoutines} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Workout Routines</h2>
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Workout
          </Button>
        )}
      </div>

      {!showCreateForm ? (
        <WorkoutRoutineList routines={routines} onSetActive={handleSetActive} />
      ) : (
        <div className="space-y-6">
          {!createMode && (
            <div className="max-w-2xl mx-auto space-y-4 p-6 border rounded-lg bg-card">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  How would you like to create your routine?
                </label>
                <Select
                  value={createMode}
                  onValueChange={(value: "ai" | "custom") =>
                    setCreateMode(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a creation method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">AI Generated</span>
                        <span className="text-xs text-muted-foreground">
                          Let AI create a personalized routine
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Custom</span>
                        <span className="text-xs text-muted-foreground">
                          Build your own from scratch
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateMode("");
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {createMode === "ai" && !generatedRoutine && (
            <AIRoutineInputForm
              onGenerate={handleGenerateRoutine}
              onCancel={() => {
                setShowCreateForm(false);
                setCreateMode("");
                setGeneratedRoutine(null);
              }}
            />
          )}

          {createMode === "ai" && generatedRoutine && (
            <WorkoutRoutineCreator
              initialRoutine={generatedRoutine}
              onCreateRoutine={handleCreateRoutine}
              onCancel={() => {
                setShowCreateForm(false);
                setCreateMode("");
                setGeneratedRoutine(null);
              }}
            />
          )}

          {createMode === "custom" && (
            <WorkoutRoutineCreator
              onCreateRoutine={handleCreateRoutine}
              onCancel={() => {
                setShowCreateForm(false);
                setCreateMode("");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
