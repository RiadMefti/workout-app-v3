import { NextRequest, NextResponse } from "next/server";
import {
  createWorkoutRoutine,
  getUserRoutinesWithDetails,
  getActiveRoutine,
} from "@/db/services";

// GET /api/routines - Get all routines for a user or just the active one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const activeOnly = searchParams.get("activeOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (activeOnly) {
      const routine = await getActiveRoutine(userId);
      return NextResponse.json({ routine });
    }

    const routines = await getUserRoutinesWithDetails(userId);
    return NextResponse.json({ routines });
  } catch (error) {
    console.error("Error fetching routines:", error);
    return NextResponse.json(
      { error: "Failed to fetch routines" },
      { status: 500 }
    );
  }
}

// POST /api/routines - Create a new workout routine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, days } = body;

    if (!userId || !name || !days) {
      return NextResponse.json(
        { error: "userId, name, and days are required" },
        { status: 400 }
      );
    }

    const routineId = await createWorkoutRoutine({
      userId,
      name,
      days,
    });

    return NextResponse.json(
      { success: true, routineId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating routine:", error);
    return NextResponse.json(
      { error: "Failed to create routine" },
      { status: 500 }
    );
  }
}
