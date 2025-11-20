import { NextRequest, NextResponse } from "next/server";
import { setActiveRoutine, getActiveRoutine } from "@/db/services";
import { requireAuth, verifyOwnership } from "@/lib/auth";

// GET /api/routines/active - Get the active routine for a user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const ownershipError = verifyOwnership(auth.user.id, userId);
    if (ownershipError) return ownershipError;

    const routine = await getActiveRoutine(userId);

    return NextResponse.json({ success: true, routine });
  } catch (error) {
    console.error("Error fetching active routine:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch active routine" },
      { status: 500 }
    );
  }
}

// PUT /api/routines/active - Set a routine as active
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { userId, routineId } = body;

    if (!userId || !routineId) {
      return NextResponse.json(
        { success: false, error: "userId and routineId are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const ownershipError = verifyOwnership(auth.user.id, userId);
    if (ownershipError) return ownershipError;

    await setActiveRoutine(userId, routineId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting active routine:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set active routine" },
      { status: 500 }
    );
  }
}
