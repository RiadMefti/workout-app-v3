import { NextResponse } from "next/server";

/**
 * AI SDK 5 Error Handling Utilities
 * Provides robust error handling for streaming responses
 */

export class StreamingError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "StreamingError";
  }
}

/**
 * Error recovery pattern for tool execution with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (
        lastError.message.includes("400") ||
        lastError.message.includes("401") ||
        lastError.message.includes("403")
      ) {
        throw lastError;
      }

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Stream error detection and handling middleware
 */
export function createErrorHandlingMiddleware() {
  return {
    onError: (error: Error) => {
      console.error("Stream error:", error);

      if (error.message.includes("timeout")) {
        return new StreamingError(
          "TIMEOUT",
          "Request timeout. Please try again.",
          504
        );
      }

      if (error.message.includes("rate limit")) {
        return new StreamingError(
          "RATE_LIMIT",
          "Too many requests. Please try again later.",
          429
        );
      }

      if (error.message.includes("token")) {
        return new StreamingError(
          "TOKEN_LIMIT",
          "Response too long. Please try a simpler request.",
          413
        );
      }

      return new StreamingError(
        "UNKNOWN",
        "An error occurred during streaming. Please try again.",
        500
      );
    },
  };
}

/**
 * Tool result formatting for better streaming UX
 */
export function formatToolResult(toolName: string, result: unknown): string {
  if (!result || typeof result !== "object") {
    return JSON.stringify(result);
  }

  const resultObj = result as Record<string, unknown>;

  switch (toolName) {
    case "searchExercises":
      if (resultObj.exercises && Array.isArray(resultObj.exercises)) {
        const exercises = resultObj.exercises as Array<{
          name: string;
          equipments: string[];
        }>;
        return `Found ${resultObj.total} exercises:\n${exercises
          .slice(0, 5)
          .map((ex) => `- ${ex.name} (${ex.equipments.join(", ")})`)
          .join("\n")}`;
      }
      break;

    case "generateWorkoutPlan":
      return `Generated ${resultObj.split} split workout plan for ${resultObj.daysPerWeek} days`;

    default:
      break;
  }

  return JSON.stringify(result);
}
