"use client";

import { Button } from "@/components/ui/button";

interface WorkoutDaysSelectorProps {
  experienceLevel: string;
  daysOptions: readonly number[];
  onSelect: (days: number) => void;
}

export function WorkoutDaysSelector({
  experienceLevel,
  daysOptions,
  onSelect,
}: WorkoutDaysSelectorProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">
          Great! You&apos;re at {experienceLevel} level.
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          How many days per week do you want to train?
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {daysOptions.map((days) => (
          <Button
            key={days}
            variant="outline"
            className="justify-center"
            onClick={() => onSelect(days)}
          >
            {days} {days === 1 ? "day" : "days"}
          </Button>
        ))}
      </div>
    </div>
  );
}
