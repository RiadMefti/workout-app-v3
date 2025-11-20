import { NextRequest, NextResponse } from "next/server";
import { createCompletedWorkout } from "@/db/services/workouts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, routineId, dayId, workoutName, exercises } = body;

    // Validate required fields
    if (!userId || !workoutName || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the completed workout
    const workout = await createCompletedWorkout({
      userId,
      routineId: routineId || null,
      dayId: dayId || null,
      workoutName,
      exercises,
    });

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
