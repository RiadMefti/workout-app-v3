import { NextRequest, NextResponse } from "next/server";
import { createCompletedWorkout } from "@/db/services/workouts";
import { requireAuth, verifyOwnership } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { userId, routineId, dayId, workoutName, exercises } = body;

    // Validate required fields
    if (!userId || !workoutName || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ownership - user can only create workouts for themselves
    const ownershipError = verifyOwnership(auth.user.id, userId);
    if (ownershipError) return ownershipError;

    // Create the completed workout
    const workout = await createCompletedWorkout({
      userId,
      routineId: routineId || null,
      dayId: dayId || null,
      workoutName,
      exercises,
    });

    return NextResponse.json({ success: true, workout }, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
