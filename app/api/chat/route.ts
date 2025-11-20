import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { tools } from "@/ai/tools";
import { withAuth } from "@workos-inc/authkit-nextjs";
import {
  getAIProvider,
  DEFAULT_AI_MODEL,
  AI_SETTINGS,
  SYSTEM_PROMPTS,
} from "@/lib/ai-config";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const auth = await withAuth({ ensureSignedIn: true });
  const userName = auth.user?.firstName || undefined;

  try {
    const aiProvider = getAIProvider();

    const result = streamText({
      model: aiProvider(DEFAULT_AI_MODEL),
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(20),
      system: SYSTEM_PROMPTS.coach(userName),
      temperature: AI_SETTINGS.chat.temperature,
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI chat error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process chat request",
      },
      { status: 500 }
    );
  }
}
