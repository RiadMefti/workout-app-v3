"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RoutineDay {
  id: string;
  name: string;
  exercises: { id: string; exerciseName: string }[];
}

interface WorkoutRoutine {
  id: string;
  name: string;
  isActive: boolean;
  days: RoutineDay[];
}

interface SimplifiedRoutineManagerProps {
  userId: string;
}

export function SimplifiedRoutineManager({
  userId,
}: SimplifiedRoutineManagerProps) {
  const router = useRouter();
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutines() {
      try {
        const response = await fetch(`/api/routines?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch routines");
        const data = await response.json();
        setRoutines(data.routines || []);
      } catch (error) {
        console.error("Error fetching routines:", error);
        toast.error("Failed to load routines");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoutines();
  }, [userId]);

  const handleSetActive = async (routineId: string) => {
    try {
      const response = await fetch("/api/routines/active", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, routineId }),
      });

      if (!response.ok) throw new Error("Failed to set active routine");

      toast.success("Active routine updated");

      // Refresh routines
      const refreshResponse = await fetch(`/api/routines?userId=${userId}`);
      const data = await refreshResponse.json();
      setRoutines(data.routines || []);
    } catch (error) {
      console.error("Error setting active routine:", error);
      toast.error("Failed to update active routine");
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
    <div className="container max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">My Routines</h1>
          <p className="text-sm text-muted-foreground">
            {routines.length} {routines.length === 1 ? "routine" : "routines"}
          </p>
        </div>
        <Button onClick={() => router.push("/routines/create")}>
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      {/* Routines List */}
      {routines.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No routines yet. Create your first one!
          </p>
          <Button onClick={() => router.push("/routines/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Routine
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => {
            const isExpanded = expandedId === routine.id;

            return (
              <Card key={routine.id} className="overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : routine.id)
                  }
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {routine.name}
                        </h3>
                        {routine.isActive && (
                          <Badge variant="default" className="shrink-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {routine.days.length} days
                      </p>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t p-4 space-y-3 bg-muted/20">
                    {/* Days */}
                    <div className="space-y-2">
                      {routine.days.map((day) => (
                        <div
                          key={day.id}
                          className="bg-background rounded-lg p-3"
                        >
                          <p className="font-medium text-sm mb-1">{day.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {day.exercises.length} exercises
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {!routine.isActive && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActive(routine.id);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Set as Active
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
