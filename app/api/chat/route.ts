import { streamText, UIMessage, convertToModelMessages } from "ai";
import { tools } from "@/ai/tools";
import { withAuth } from "@workos-inc/authkit-nextjs";
import {
  getAIProvider,
  DEFAULT_AI_MODEL,
  AI_SETTINGS,
  SYSTEM_PROMPTS,
} from "@/lib/ai-config";
import { createErrorHandlingMiddleware } from "@/lib/streaming-utils";
import { NextRequest, NextResponse } from "next/server";

/**
 * AI SDK 5 Enhanced Chat Route
 * - Type-safe request validation
 * - Proper error boundaries
 * - Abort signal support
 * - Metadata tracking
 */
export async function POST(req: NextRequest) {
  const errorHandler = createErrorHandlingMiddleware();

  try {
    // AI SDK 5: Validate request structure upfront
    const body = await req.json().catch(() => null);

    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required", success: false },
        { status: 400 }
      );
    }

    const messages: UIMessage[] = body.messages;

    // Authentication with proper error handling
    const auth = await withAuth({ ensureSignedIn: true });
    if (!auth.user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const userName = auth.user?.firstName || undefined;
    const aiProvider = getAIProvider();

    // AI SDK 5: Enhanced streaming with proper configuration
    const result = streamText({
      model: aiProvider(DEFAULT_AI_MODEL),
      messages: convertToModelMessages(messages),
      system: SYSTEM_PROMPTS.coach(userName),
      temperature: AI_SETTINGS.chat.temperature,
      tools,

      // AI SDK 5: Set appropriate limits
      maxRetries: 2,

      // AI SDK 5: Add metadata for monitoring
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          userId: auth.user.id,
          userName: userName || "anonymous",
        },
      },

      // AI SDK 5: Enable request cancellation
      abortSignal: req.signal,

      // AI SDK 5: Built-in lifecycle hooks
      onFinish: (result) => {
        console.log("[Chat] Stream completed:", {
          toolCalls: result.toolCalls?.length || 0,
          finishReason: result.finishReason,
          usage: result.usage,
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Chat] Handler error:", error);
    errorHandler.onError(error instanceof Error ? error : new Error(String(error)));

    const message =
      error instanceof Error ? error.message : "Failed to process chat";

    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    );
  }
}
