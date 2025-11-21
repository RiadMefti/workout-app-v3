"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell, Loader2, X } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

interface WorkoutDetails {
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
}

interface EnhancedWorkoutHistoryProps {
  onWorkoutClick?: (workout: WorkoutDetails) => void;
  onClose?: () => void;
}

interface CompletedWorkout {
  id: string;
  workoutName: string;
  completedAt: Date;
  exerciseCount: number;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EnhancedWorkoutHistory({
  onWorkoutClick,
  onClose,
}: EnhancedWorkoutHistoryProps = {}) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch workouts for current month
  useEffect(() => {
    async function fetchWorkouts() {
      if (!user?.id) return;

      setLoading(true);
      try {
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

        const response = await fetch(
          `/api/workouts?userId=${user.id}&startDate=${startDate}&endDate=${endDate}`
        );

        if (response.ok) {
          const data = await response.json();
          setWorkouts(
            data.workouts.map((w: any) => ({
              ...w,
              completedAt: new Date(w.completedAt),
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch workouts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, [user?.id, year, month]);

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

  // Fetch full workout details
  const fetchWorkoutDetails = async (workoutId: string) => {
    if (!user?.id) return;

    setLoadingDetails(true);
    try {
      const response = await fetch(
        `/api/workouts/${workoutId}?userId=${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        const workoutDetails = {
          ...data.workout,
          completedAt: new Date(data.workout.completedAt),
        };

        // Call the callback if provided
        if (onWorkoutClick) {
          onWorkoutClick(workoutDetails);
        }
      }
    } catch (error) {
      console.error("Failed to fetch workout details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Helper to get workouts for a specific date
  const getWorkoutsForDate = (day: number): CompletedWorkout[] => {
    return workouts.filter((w) => {
      const workoutDate = new Date(w.completedAt);
      return (
        workoutDate.getDate() === day &&
        workoutDate.getMonth() === month &&
        workoutDate.getFullYear() === year
      );
    });
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
    const dayWorkouts = getWorkoutsForDate(day);
    const today = isToday(day);
    const hasWorkouts = dayWorkouts.length > 0;

    calendarDays.push(
      <div key={day} className="aspect-square p-1">
        <button
          onClick={() => {
            if (dayWorkouts.length > 0) {
              fetchWorkoutDetails(dayWorkouts[0].id);
            }
          }}
          disabled={!hasWorkouts}
          className={`h-full w-full rounded-lg border transition-all duration-200 ${
            today
              ? "border-primary bg-primary/10"
              : hasWorkouts
              ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:scale-105 cursor-pointer"
              : "border-border/50 hover:border-border cursor-default"
          } ${!hasWorkouts ? "cursor-not-allowed" : ""}`}
        >
          <div
            className={`h-full flex flex-col p-1.5 sm:p-2 ${
              !hasWorkouts ? "items-center justify-center" : ""
            }`}
          >
            {/* Day number */}
            <div
              className={`text-xs sm:text-sm font-medium ${
                hasWorkouts ? "mb-1" : ""
              } ${
                today
                  ? "text-primary"
                  : hasWorkouts
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>

            {/* Workout indicator */}
            {hasWorkouts && (
              <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 min-h-0">
                <div className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[10px] text-foreground/80 truncate">
                    {dayWorkouts[0].workoutName}
                  </span>
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {dayWorkouts[0].exerciseCount} exercises
                </div>
                {dayWorkouts.length > 1 && (
                  <div className="text-[9px] text-primary">
                    +{dayWorkouts.length - 1} more
                  </div>
                )}
              </div>
            )}
          </div>
        </button>
      </div>
    );
  }

  const monthName = firstDayOfMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const workoutsThisMonth = workouts.length;

  return (
    <>
      <Card className="w-full max-w-4xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {monthName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  {workoutsThisMonth}{" "}
                  {workoutsThisMonth === 1 ? "workout" : "workouts"} this month
                </>
              )}
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
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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
            <span className="text-xs text-muted-foreground">
              Workout completed
            </span>
          </div>
        </div>
      </Card>
    </>
  );
}
