"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell } from "lucide-react";

interface ActiveRoutineDisplayProps {
  routine: {
    id: string;
    name: string;
    description?: string;
    daysPerWeek?: number;
    days: Array<{
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
    }>;
  };
}

export function ActiveRoutineDisplay({ routine }: ActiveRoutineDisplayProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{routine.name}</h3>
          <Badge variant="default" className="text-xs">
            Active
          </Badge>
        </div>
        {routine.description && (
          <p className="text-sm text-muted-foreground">{routine.description}</p>
        )}
      </div>

      {routine.daysPerWeek && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {routine.daysPerWeek} {routine.daysPerWeek === 1 ? "day" : "days"}/week
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            <span>{routine.days.length} workouts</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {routine.days.map((day) => (
          <div key={day.id} className="border rounded-md p-3 space-y-2">
            <h4 className="font-medium text-sm">{day.name}</h4>
            <div className="space-y-1">
              {day.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{exercise.exerciseName}</span>
                  <span className="text-muted-foreground">
                    {exercise.sets.length} sets × {exercise.sets[0]?.targetReps || 0} reps
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
