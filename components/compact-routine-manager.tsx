"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/lib/toast";

interface RoutineDay {
  id: string;
  name: string;
  exercises: { exerciseName: string }[];
}

interface WorkoutRoutine {
  id: string;
  name: string;
  isActive: boolean;
  days: RoutineDay[];
}

interface CompactRoutineManagerProps {
  userId: string;
  onCreateNew?: () => void;
  onClose?: () => void;
}

export function CompactRoutineManager({
  userId,
  onCreateNew,
  onClose,
}: CompactRoutineManagerProps) {
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

      const refreshResponse = await fetch(`/api/routines?userId=${userId}`);
      const data = await refreshResponse.json();
      setRoutines(data.routines || []);
    } catch (error) {
      toast.error("Failed to update active routine");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">My Routines</h3>
        <div className="flex items-center gap-2">
          {onCreateNew && (
            <Button onClick={onCreateNew} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          )}
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">No routines yet</p>
          {onCreateNew && (
            <Button onClick={onCreateNew} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create First Routine
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {routines.map((routine) => (
            <Collapsible
              key={routine.id}
              open={expandedId === routine.id}
              onOpenChange={(open) => setExpandedId(open ? routine.id : null)}
            >
              <div className="border rounded-lg">
                <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {routine.name}
                    </span>
                    {routine.isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {routine.days.length}d
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedId === routine.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t p-3 space-y-2">
                    {routine.days.map((day) => (
                      <div
                        key={day.id}
                        className="text-xs bg-muted/30 rounded p-2"
                      >
                        <div className="font-medium">{day.name}</div>
                        <div className="text-muted-foreground">
                          {day.exercises.length} exercises
                        </div>
                      </div>
                    ))}

                    {!routine.isActive && (
                      <Button
                        onClick={() => handleSetActive(routine.id)}
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Set Active
                      </Button>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </Card>
  );
}
