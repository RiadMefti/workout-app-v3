import { NextRequest, NextResponse } from "next/server";
import { setActiveRoutine } from "@/db/services";

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
