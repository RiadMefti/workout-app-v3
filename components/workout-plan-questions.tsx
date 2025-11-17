"use client";

import { Button } from "@/components/ui/button";

interface WorkoutPlanQuestionsProps {
  userName: string;
  options: readonly string[];
  onSelect: (level: string) => void;
}

export function WorkoutPlanQuestions({
  userName,
  options,
  onSelect,
}: WorkoutPlanQuestionsProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">
          Let&apos;s create your workout plan, {userName}!
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          What&apos;s your current fitness level?
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            className="justify-start"
            onClick={() => onSelect(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
