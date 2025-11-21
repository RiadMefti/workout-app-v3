"use client";

import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutDetailModalProps {
  workout: {
    id: string;
    completedAt: Date;
    workoutName: string;
    duration?: number;
    exercises: Array<{
      id: string;
      exerciseName: string;
      sets: Array<{
        id: string;
        setNumber: number;
        reps: number;
        weight: number;
      }>;
    }>;
  };
  onClose: () => void;
}

export function WorkoutDetailModal({
  workout,
  onClose,
}: WorkoutDetailModalProps) {
  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );
  const totalVolume = workout.exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((setAcc, set) => setAcc + set.reps * set.weight, 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">
              {workout.workoutName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(workout.completedAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Simple Stats */}
        <div className="px-6 py-3 bg-muted/30 border-b flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Sets:</span>{" "}
            <span className="font-semibold">{totalSets}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Volume:</span>{" "}
            <span className="font-semibold">
              {totalVolume > 0
                ? `${totalVolume.toLocaleString()} lbs`
                : "0 lbs"}
            </span>
          </div>
        </div>

        {/* Exercises */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {workout.exercises.map((exercise, idx) => {
              const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));

              return (
                <div
                  key={exercise.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Exercise Header */}
                  <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-muted-foreground">{idx + 1}.</span>
                      {exercise.exerciseName}
                    </h3>
                    {maxWeight > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Max: {maxWeight} lbs
                      </span>
                    )}
                  </div>

                  {/* Sets Table */}
                  <div className="p-4">
                    <div className="space-y-1">
                      {/* Table Header */}
                      <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b">
                        <div>Set</div>
                        <div className="text-center">Reps</div>
                        <div className="text-right">Weight</div>
                      </div>

                      {/* Table Rows */}
                      {exercise.sets.map((set) => (
                        <div
                          key={set.id}
                          className="grid grid-cols-3 gap-4 text-sm py-2"
                        >
                          <div className="text-muted-foreground">
                            {set.setNumber}
                          </div>
                          <div className="text-center font-semibold">
                            {set.reps}
                          </div>
                          <div className="text-right font-semibold">
                            {set.weight > 0 ? `${set.weight} lbs` : "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
