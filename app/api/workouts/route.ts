import { NextRequest, NextResponse } from "next/server";
import { createCompletedWorkout, getWorkoutHistory } from "@/db/services/workouts";
import { requireAuth, verifyOwnership } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const ownershipError = verifyOwnership(auth.user.id, userId);
    if (ownershipError) return ownershipError;

    // Parse dates or use defaults (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const workouts = await getWorkoutHistory(userId, start, end);

    return NextResponse.json({ success: true, workouts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workout history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workout history" },
      { status: 500 }
    );
  }
}

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
