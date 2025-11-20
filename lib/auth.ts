import { withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import { ERROR_MESSAGES } from "./constants";

/**
 * Authentication and authorization helper for API routes
 *
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAuth();
 *   if (auth.error) return auth.error;
 *   const userId = auth.user.id;
 *   // ... rest of handler
 * }
 * ```
 */
export async function requireAuth() {
  try {
    const auth = await withAuth({ ensureSignedIn: true });

    if (!auth.user) {
      return {
        error: NextResponse.json(
          { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
          { status: 401 }
        ),
      };
    }

    return {
      user: auth.user,
      error: null,
    };
  } catch (error) {
    return {
      error: NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      ),
    };
  }
}

/**
 * Verify that the authenticated user owns the resource
 *
 * @param authenticatedUserId - User ID from auth
 * @param resourceUserId - User ID from the resource being accessed
 * @returns NextResponse error if unauthorized, null if authorized
 */
export function verifyOwnership(
  authenticatedUserId: string,
  resourceUserId: string
): NextResponse | null {
  if (authenticatedUserId !== resourceUserId) {
    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
      },
      { status: 403 }
    );
  }
  return null;
}
