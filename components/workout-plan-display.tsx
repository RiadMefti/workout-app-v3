"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Exercise {
  name: string;
  targetMuscles: string[];
  equipments: string[];
}

interface WorkoutDay {
  name: string;
  focus: string[];
  exercises: Exercise[];
  isRestDay?: boolean;
}

interface WorkoutPlan {
  split: string;
  daysPerWeek: number;
  workoutDays: WorkoutDay[]; // Should always be 7 days
}

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  split: string;
  daysPerWeek: number;
}

interface WeekDay {
  dayNumber: number;
  dayLabel: string;
  isRest: boolean;
  workout?: WorkoutDay;
}

export function WorkoutPlanDisplay({
  plan,
  split,
  daysPerWeek,
}: WorkoutPlanDisplayProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const getSplitName = (splitType: string): string => {
    switch (splitType) {
      case "fullbody":
        return "Full Body";
      case "upper-lower":
        return "Upper/Lower";
      case "push-pull-legs":
        return "Push/Pull/Legs";
      case "push-pull-legs-upper-lower":
        return "Push/Pull/Legs + Upper/Lower";
      default:
        return splitType;
    }
  };

  // Create a 7-day week schedule from the plan (which includes rest days)
  const createWeekSchedule = (): WeekDay[] => {
    return plan.workoutDays.map((workout, index) => ({
      dayNumber: index + 1,
      dayLabel: `Day ${index + 1}`,
      isRest: workout.isRestDay || false,
      workout: workout,
    }));
  };

  const weekSchedule = createWeekSchedule();
  const currentDay = weekSchedule.find((d) => d.dayNumber === selectedDay);

  return (
    <div className="space-y-4 w-full max-w-4xl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            {daysPerWeek} Day {getSplitName(split)} Workout Plan
          </CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Your personalized training program focusing on compound movements
          </p>
        </CardHeader>
      </Card>

      {/* Weekly Calendar View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {weekSchedule.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-lg border-2 transition-all ${
                  selectedDay === day.dayNumber
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                } ${day.isRest ? "bg-muted/30" : ""}`}
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  {day.dayLabel.replace("Day ", "D")}
                </span>
                <span className="text-lg md:text-2xl mt-1">
                  {day.isRest ? "🛌" : "💪"}
                </span>
                <span className="text-[10px] md:text-xs font-medium mt-1 text-center line-clamp-1">
                  {day.isRest ? "Rest" : day.workout?.name}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {currentDay && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl">
                {currentDay.dayLabel}
                {currentDay.isRest ? ": Rest Day" : `: ${currentDay.workout?.name}`}
              </CardTitle>
              {!currentDay.isRest && currentDay.workout && (
                <span className="text-xs md:text-sm text-muted-foreground">
                  {currentDay.workout.exercises.length} exercises
                </span>
              )}
            </div>
            {!currentDay.isRest && currentDay.workout && (
              <p className="text-xs md:text-sm text-muted-foreground">
                Focus: {currentDay.workout.focus.join(", ")}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {currentDay.isRest ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                <div className="text-5xl md:text-6xl mb-4">🛌</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Rest & Recovery</h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-md">
                  Take this day to let your muscles recover and grow. Stay active
                  with light walking or stretching if you&apos;d like!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] md:h-[400px] pr-4">
                <div className="space-y-3 md:space-y-4">
                  {currentDay.workout?.exercises.map((exercise, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm md:text-base font-semibold">
                        {i + 1}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base">
                          {exercise.name}
                        </h4>
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Target:</span>
                            <span className="truncate">
                              {exercise.targetMuscles.join(", ")}
                            </span>
                          </span>
                          <span className="hidden md:inline text-muted-foreground/50">
                            •
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Equipment:</span>
                            <span className="truncate">
                              {exercise.equipments.join(", ")}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Training Tips */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4 md:pt-6">
          <p className="text-xs md:text-sm text-muted-foreground">
            💡 <strong>Training Tips:</strong> Focus on progressive overload by
            gradually increasing weight or reps each week. Rest 2-3 minutes
            between sets for compound movements, and 60-90 seconds for isolation
            exercises.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
