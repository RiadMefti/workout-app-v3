"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, TrendingUp, Hash, Weight } from "lucide-react";
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

export function WorkoutDetailModal({ workout, onClose }: WorkoutDetailModalProps) {
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalReps = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.reduce((setAcc, set) => setAcc + set.reps, 0),
    0
  );
  const totalVolume = workout.exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((setAcc, set) => setAcc + set.reps * set.weight, 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {workout.workoutName}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              <Calendar className="h-3 w-3 inline mr-1" />
              {new Date(workout.completedAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 ml-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="px-4 sm:px-6 py-4 bg-muted/30 border-b">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-background rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{totalSets}</p>
              <p className="text-xs text-muted-foreground">Total Sets</p>
            </div>

            <div className="bg-background rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{totalReps}</p>
              <p className="text-xs text-muted-foreground">Total Reps</p>
            </div>

            <div className="bg-background rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-orange-500/10">
                  <Weight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k` : "0"}
              </p>
              <p className="text-xs text-muted-foreground">Volume (lbs)</p>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="space-y-4">
            {workout.exercises.map((exercise, idx) => {
              const exerciseVolume = exercise.sets.reduce(
                (acc, set) => acc + set.reps * set.weight,
                0
              );
              const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));

              return (
                <div
                  key={exercise.id}
                  className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Exercise Header */}
                  <div className="bg-muted/50 px-4 py-3 flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs font-semibold px-2">
                      {idx + 1}
                    </Badge>
                    <h3 className="font-semibold text-sm sm:text-base flex-1 truncate">
                      {exercise.exerciseName}
                    </h3>
                    {maxWeight > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Max: {maxWeight} lbs
                      </Badge>
                    )}
                  </div>

                  {/* Sets Table */}
                  <div className="p-4">
                    <div className="space-y-1.5">
                      {/* Table Header */}
                      <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-muted-foreground pb-2 border-b">
                        <div>SET</div>
                        <div className="text-center">REPS</div>
                        <div className="text-right">WEIGHT</div>
                      </div>

                      {/* Table Rows */}
                      {exercise.sets.map((set) => (
                        <div
                          key={set.id}
                          className="grid grid-cols-3 gap-3 text-sm py-1.5 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors"
                        >
                          <div className="text-muted-foreground font-medium">
                            Set {set.setNumber}
                          </div>
                          <div className="text-center font-bold text-foreground">
                            {set.reps}
                          </div>
                          <div className="text-right font-bold text-foreground">
                            {set.weight > 0 ? (
                              <span>{set.weight} lbs</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">Bodyweight</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Exercise Summary */}
                    {exerciseVolume > 0 && (
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {exercise.sets.length} sets • {exercise.sets.reduce((acc, set) => acc + set.reps, 0)} reps
                        </span>
                        <span className="font-semibold text-primary">
                          {exerciseVolume.toLocaleString()} lbs volume
                        </span>
                      </div>
                    )}
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
