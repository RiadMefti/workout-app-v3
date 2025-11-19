"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";

interface WorkoutDay {
  date: string; // ISO format: "2025-01-15"
  workoutType: string; // e.g., "Push Day", "Leg Day"
  exercises: number; // number of exercises completed
  duration: number; // workout duration in minutes
}

interface WorkoutHistoryCalendarProps {
  workouts?: WorkoutDay[]; // Optional: will use mock data if not provided
}

// Mock data for demonstration
const mockWorkouts: WorkoutDay[] = [
  {
    date: "2025-01-05",
    workoutType: "Push Day",
    exercises: 6,
    duration: 65,
  },
  {
    date: "2025-01-07",
    workoutType: "Leg Day",
    exercises: 5,
    duration: 75,
  },
  {
    date: "2025-01-10",
    workoutType: "Pull Day",
    exercises: 6,
    duration: 60,
  },
  {
    date: "2025-01-12",
    workoutType: "Push Day",
    exercises: 6,
    duration: 55,
  },
  {
    date: "2025-01-14",
    workoutType: "Leg Day",
    exercises: 5,
    duration: 80,
  },
  {
    date: "2025-01-17",
    workoutType: "Pull Day",
    exercises: 6,
    duration: 62,
  },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WorkoutHistoryCalendar({
  workouts = mockWorkouts,
}: WorkoutHistoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to check if a date has a workout
  const getWorkoutForDate = (day: number): WorkoutDay | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return workouts.find((w) => w.date === dateStr);
  };

  // Helper to check if date is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Generate calendar grid
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="aspect-square p-1">
        <div className="h-full rounded-lg" />
      </div>
    );
  }

  // Actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const workout = getWorkoutForDate(day);
    const today = isToday(day);

    calendarDays.push(
      <div key={day} className="aspect-square p-1">
        <div
          className={`h-full rounded-lg border transition-all duration-200 ${
            today
              ? "border-primary bg-primary/10"
              : workout
              ? "border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer"
              : "border-border/50 hover:border-border cursor-pointer"
          }`}
        >
          <div className={`h-full flex flex-col p-1.5 sm:p-2 ${!workout ? 'items-center justify-center' : ''}`}>
            {/* Day number */}
            <div
              className={`text-xs sm:text-sm font-medium ${workout ? 'mb-1' : ''} ${
                today
                  ? "text-primary"
                  : workout
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>

            {/* Workout indicator */}
            {workout && (
              <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 min-h-0">
                <div className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[10px] text-foreground/80 truncate">
                    {workout.workoutType}
                  </span>
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {workout.exercises} exercises
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {workout.duration} min
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const monthName = firstDayOfMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="w-full max-w-4xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{monthName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {workouts.filter((w) => {
              const workoutDate = new Date(w.date);
              return (
                workoutDate.getMonth() === month &&
                workoutDate.getFullYear() === year
              );
            }).length}{" "}
            workouts this month
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hidden sm:flex"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">{calendarDays}</div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10" />
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-primary/30 bg-primary/5" />
          <span className="text-xs text-muted-foreground">Workout completed</span>
        </div>
      </div>
    </Card>
  );
}
