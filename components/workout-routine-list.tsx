"use client";

import { useState } from "react";
import { CheckCircle2, Calendar, Dumbbell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

interface WorkoutRoutineListProps {
  routines: WorkoutRoutine[];
  onSetActive: (routineId: string) => Promise<void>;
  onDeleteRoutine?: (routineId: string) => Promise<void>;
}

export function WorkoutRoutineList({
  routines,
  onSetActive,
  onDeleteRoutine,
}: WorkoutRoutineListProps) {
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(
    new Set()
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const toggleRoutine = (routineId: string) => {
    const newExpanded = new Set(expandedRoutines);
    if (newExpanded.has(routineId)) {
      newExpanded.delete(routineId);
    } else {
      newExpanded.add(routineId);
    }
    setExpandedRoutines(newExpanded);
  };

  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  if (routines.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Workout Routines Yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first workout routine to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Workout Routines</h2>
        <Badge variant="secondary" className="text-sm">
          {routines.length} {routines.length === 1 ? "routine" : "routines"}
        </Badge>
      </div>

      {routines.map((routine) => (
        <Card
          key={routine.id}
          className={`transition-all ${
            routine.isActive
              ? "border-2 border-green-500 shadow-lg shadow-green-500/20"
              : "border-2"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-xl">{routine.name}</CardTitle>
                  {routine.isActive && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {routine.days.length} {routine.days.length === 1 ? "day" : "days"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" />
                    {routine.days.reduce(
                      (total, day) => total + day.exercises.length,
                      0
                    )}{" "}
                    exercises total
                  </span>
                </div>
              </div>
              {!routine.isActive && (
                <Button
                  onClick={() => onSetActive(routine.id)}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  Set Active
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Collapsible
              open={expandedRoutines.has(routine.id)}
              onOpenChange={() => toggleRoutine(routine.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">
                    {expandedRoutines.has(routine.id)
                      ? "Hide Details"
                      : "View Details"}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      expandedRoutines.has(routine.id) ? "rotate-90" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 space-y-3">
                {routine.days.map((day) => (
                  <div
                    key={day.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <Collapsible
                      open={expandedDays.has(day.id)}
                      onOpenChange={() => toggleDay(day.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Day {day.dayOrder}</Badge>
                            <span className="font-medium">{day.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {day.exercises.length}{" "}
                              {day.exercises.length === 1
                                ? "exercise"
                                : "exercises"}
                            </span>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              expandedDays.has(day.id) ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="p-4 space-y-4">
                          {day.exercises.map((exercise, index) => (
                            <div
                              key={exercise.id}
                              className="space-y-2 pb-4 border-b last:border-b-0 last:pb-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-muted-foreground">
                                  {index + 1}.
                                </span>
                                <h4 className="font-semibold">
                                  {exercise.exerciseName}
                                </h4>
                              </div>
                              <div className="ml-6 space-y-1">
                                {exercise.sets.map((set) => (
                                  <div
                                    key={set.id}
                                    className="text-sm text-muted-foreground flex items-center gap-2"
                                  >
                                    <span className="font-mono w-12">
                                      Set {set.setNumber}
                                    </span>
                                    <span>
                                      {set.targetReps} reps @{" "}
                                      {set.targetWeight === 0
                                        ? "bodyweight"
                                        : `${set.targetWeight} lbs`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
