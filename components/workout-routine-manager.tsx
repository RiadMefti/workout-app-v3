"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutRoutineCreator } from "./workout-routine-creator";
import { WorkoutRoutineList } from "./workout-routine-list";

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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "view" | "create")}>
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
          <WorkoutRoutineCreator
            onCreateRoutine={handleCreateRoutine}
            onCancel={() => setActiveTab("view")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
