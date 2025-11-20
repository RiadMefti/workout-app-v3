import { NextRequest, NextResponse } from "next/server";
import { setActiveRoutine, getActiveRoutine } from "@/db/services";

// GET /api/routines/active - Get the active routine for a user
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

    const routine = await getActiveRoutine(userId);

    return NextResponse.json({ routine });
  } catch (error) {
    console.error("Error fetching active routine:", error);
    return NextResponse.json(
      { error: "Failed to fetch active routine" },
      { status: 500 }
    );
  }
}

// PUT /api/routines/active - Set a routine as active
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, routineId } = body;

    if (!userId || !routineId) {
      return NextResponse.json(
        { error: "userId and routineId are required" },
        { status: 400 }
      );
    }

    await setActiveRoutine(userId, routineId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting active routine:", error);
    return NextResponse.json(
      { error: "Failed to set active routine" },
      { status: 500 }
    );
  }
}
