"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Exercise {
  name: string;
  targetMuscles: string[];
  equipments: string[];
}

interface WorkoutDay {
  name: string;
  focus: string[];
  exercises: Exercise[];
}

interface WorkoutPlan {
  split: string;
  daysPerWeek: number;
  workoutDays: WorkoutDay[];
}

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  split: string;
  daysPerWeek: number;
}

export function WorkoutPlanDisplay({
  plan,
  split,
  daysPerWeek,
}: WorkoutPlanDisplayProps) {
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

  return (
    <div className="space-y-4 w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {daysPerWeek} Day {getSplitName(split)} Workout Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your personalized training program focusing on compound movements
            and proven exercises
          </p>
        </CardHeader>
      </Card>

      {plan.workoutDays.map((day, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-xl">
              Day {index + 1}: {day.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Focus: {day.focus.join(", ")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {day.exercises.map((exercise, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Target:</span>
                        {exercise.targetMuscles.join(", ")}
                      </span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Equipment:</span>
                        {exercise.equipments.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
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
