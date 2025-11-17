import { streamText, UIMessage, convertToModelMessages } from "ai";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { tools } from "@/ai/tools";
import { withAuth } from "@workos-inc/authkit-nextjs";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const auth = await withAuth({ ensureSignedIn: true });
  const userName = auth.user?.firstName;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 500 }
    );
  }

  // Configure GitHub Models provider
  const github = createOpenAICompatible({
    name: "github-models",
    baseURL: "https://models.github.ai/inference",
    apiKey: token,
  });

  const result = streamText({
    model: github("openai/o4-mini"),
    messages: convertToModelMessages(messages),
    system: `You are a friendly fitness coach assistant. ${
      userName ? `The user's name is ${userName}.` : ""
    }

When the user first messages you, greet them warmly by name and say: "Hello ${
      userName || "there"
    }! What can I do for you? I can help you create a personalized workout plan if you'd like."

If the user expresses interest in creating a workout plan, use the showWorkoutPlanQuestions tool to display interactive options for their experience level.`,
    tools,
  });

  return result.toUIMessageStreamResponse();
}
