"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Sparkles, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState<"view" | "create">("view");
  const [createMode, setCreateMode] = useState<"choice" | "ai" | "custom">("choice");
  const [generatedRoutine, setGeneratedRoutine] = useState<any>(null);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch routines on mount
  useEffect(() => {
    fetchRoutines();
  }, [userId]);

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

      // Switch to view tab to see the new routine
      setActiveTab("view");
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
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
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
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as "view" | "create");
          // Reset create mode when switching tabs
          if (v === "create") {
            setCreateMode("choice");
            setGeneratedRoutine(null);
          }
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Workout Routines</h2>
          <TabsList className="grid w-[300px] grid-cols-2">
            <TabsTrigger value="view">My Routines</TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="view" className="mt-0">
          <WorkoutRoutineList
            routines={routines}
            onSetActive={handleSetActive}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          {createMode === "choice" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-lg font-semibold text-center mb-6">
                How would you like to create your routine?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Generated Option */}
                <Card
                  onClick={() => setCreateMode("ai")}
                  className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 hover:border-purple-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">AI Generated</h4>
                      <p className="text-sm text-muted-foreground">
                        Let AI create a personalized routine based on your goals and
                        experience
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Custom Option */}
                <Card
                  onClick={() => setCreateMode("custom")}
                  className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 hover:border-blue-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Edit3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Custom</h4>
                      <p className="text-sm text-muted-foreground">
                        Build your own routine from scratch with full control over
                        every detail
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex justify-center pt-4">
                <Button onClick={() => setActiveTab("view")} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {createMode === "ai" && !generatedRoutine && (
            <AIRoutineInputForm
              onGenerate={handleGenerateRoutine}
              onCancel={() => {
                setCreateMode("choice");
                setGeneratedRoutine(null);
              }}
            />
          )}

          {createMode === "ai" && generatedRoutine && (
            <WorkoutRoutineCreator
              initialRoutine={generatedRoutine}
              onCreateRoutine={handleCreateRoutine}
              onCancel={() => {
                setCreateMode("choice");
                setGeneratedRoutine(null);
              }}
            />
          )}

          {createMode === "custom" && (
            <WorkoutRoutineCreator
              onCreateRoutine={handleCreateRoutine}
              onCancel={() => setCreateMode("choice")}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
