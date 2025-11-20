import { NextRequest, NextResponse } from "next/server";
import {
  createWorkoutRoutine,
  getUserRoutinesWithDetails,
  getActiveRoutine,
} from "@/db/services";
import { requireAuth, verifyOwnership } from "@/lib/auth";
import {
  userIdWithActiveOnlySchema,
  createRoutineSchema,
  validateData,
} from "@/lib/validations";

// GET /api/routines - Get all routines for a user or just the active one
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const activeOnlyParam = searchParams.get("activeOnly");

    const queryParams = {
      userId: userIdParam,
      ...(activeOnlyParam !== null && { activeOnly: activeOnlyParam }),
    };

    // Validate query params
    const validation = validateData(userIdWithActiveOnlySchema, queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { userId, activeOnly } = validation.data;

    // Verify ownership - user can only fetch their own routines
    const ownershipError = verifyOwnership(auth.user.id, userId);
    if (ownershipError) return ownershipError;

    if (activeOnly === "true") {
      const routine = await getActiveRoutine(userId);
      return NextResponse.json({ success: true, routine });
    }

    const routines = await getUserRoutinesWithDetails(userId);
    return NextResponse.json({ success: true, routines });
  } catch (error) {
    console.error("Error fetching routines:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch routines" },
      { status: 500 }
    );
  }
}

// POST /api/routines - Create a new workout routine
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    // Validate request body
    const validation = validateData(createRoutineSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { userId, name, days } = validation.data;

    // Verify ownership - user can only create routines for themselves
    const ownershipError = verifyOwnership(auth.user.id, userId);
    if (ownershipError) return ownershipError;

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
      { success: false, error: "Failed to create routine" },
      { status: 500 }
    );
  }
}
