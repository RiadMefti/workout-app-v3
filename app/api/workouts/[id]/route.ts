import { NextRequest, NextResponse } from "next/server";
import { getWorkoutDetails } from "@/db/services/workouts";
import { requireAuth, verifyOwnership } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
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

    const workout = await getWorkoutDetails(userId, id);

    if (!workout) {
      return NextResponse.json(
        { success: false, error: "Workout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, workout }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workout details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workout details" },
      { status: 500 }
    );
  }
}
