"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface NextWorkoutDisplayProps {
  workout: {
    dayName: string;
    routineName: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      restPeriod?: number;
    }>;
  };
}

export function NextWorkoutDisplay({ workout }: NextWorkoutDisplayProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-base">{workout.dayName}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          from {workout.routineName}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Exercises:</h4>
        <div className="space-y-2">
          {workout.exercises.map((exercise, idx) => (
            <div key={exercise.id} className="border-l-2 border-primary pl-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {idx + 1}. {exercise.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {exercise.sets} sets × {exercise.reps} reps
                </span>
                {exercise.restPeriod && (
                  <span>Rest: {exercise.restPeriod}s</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
