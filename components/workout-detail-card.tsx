"use client";

import { Card } from "@/components/ui/card";

interface WorkoutDetailCardProps {
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
}

export function WorkoutDetailCard({ workout }: WorkoutDetailCardProps) {
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
    <Card className="w-full overflow-hidden border-2">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-bold text-base">{workout.workoutName}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(workout.completedAt).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Simple Stats */}
      <div className="px-4 py-2 bg-muted/20 border-b flex gap-6 text-xs">
        <div>
          <span className="text-muted-foreground">Sets:</span>{" "}
          <span className="font-semibold">{totalSets}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Volume:</span>{" "}
          <span className="font-semibold">
            {totalVolume > 0 ? `${totalVolume.toLocaleString()} lbs` : "0 lbs"}
          </span>
        </div>
      </div>

      {/* Exercises */}
      <div className="px-4 py-3">
        <div className="space-y-3">
          {workout.exercises.map((exercise, idx) => {
            const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));

            return (
              <div
                key={exercise.id}
                className="border rounded-lg overflow-hidden bg-card"
              >
                {/* Exercise Header */}
                <div className="bg-muted/40 px-3 py-2 flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {idx + 1}.
                    </span>
                    {exercise.exerciseName}
                  </h4>
                  {maxWeight > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Max: {maxWeight} lbs
                    </span>
                  )}
                </div>

                {/* Sets Table */}
                <div className="px-3 py-2">
                  <div className="space-y-1">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground pb-1 border-b">
                      <div>Set</div>
                      <div className="text-center">Reps</div>
                      <div className="text-right">Weight</div>
                    </div>

                    {/* Table Rows */}
                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-3 gap-4 text-xs py-1"
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
  );
}
