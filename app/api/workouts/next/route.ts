import { NextRequest, NextResponse } from "next/server";
import { getActiveRoutine } from "@/db/services/routines";
import { getLastCompletedWorkoutForRoutine } from "@/db/services/workouts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get the active routine
    const activeRoutine = await getActiveRoutine(userId);

    if (
      !activeRoutine ||
      !activeRoutine.days ||
      activeRoutine.days.length === 0
    ) {
      return NextResponse.json(
        { error: "No active routine found" },
        { status: 404 }
      );
    }

    // Get the last completed workout for this routine
    const lastWorkout = await getLastCompletedWorkoutForRoutine(
      userId,
      activeRoutine.id
    );

    let nextDay;

    if (!lastWorkout || lastWorkout.dayOrder === null) {
      // No previous workout, start with day 1
      nextDay = activeRoutine.days.find((day) => day.dayOrder === 1);
    } else {
      // Find the next day in the routine
      const currentDayOrder = lastWorkout.dayOrder;
      const nextDayOrder = currentDayOrder + 1;

      // Check if there's a next day
      nextDay = activeRoutine.days.find((day) => day.dayOrder === nextDayOrder);

      // If no next day, cycle back to day 1
      if (!nextDay) {
        nextDay = activeRoutine.days.find((day) => day.dayOrder === 1);
      }
    }

    if (!nextDay) {
      return NextResponse.json(
        { error: "Could not determine next workout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      routine: {
        id: activeRoutine.id,
        name: activeRoutine.name,
      },
      nextDay: {
        id: nextDay.id,
        name: nextDay.name,
        dayOrder: nextDay.dayOrder,
        exercises: nextDay.exercises,
      },
    });
  } catch (error) {
    console.error("Error getting next workout:", error);
    return NextResponse.json(
      { error: "Failed to get next workout" },
      { status: 500 }
    );
  }
}
