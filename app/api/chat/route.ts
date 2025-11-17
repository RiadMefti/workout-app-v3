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

When the user expresses interest in creating a workout plan, follow these steps:
1. Use the showWorkoutPlanQuestions tool to ask about their experience level
2. After they select their level, use the showWorkoutDaysSelector tool to ask how many days per week they want to train
3. Then continue helping them create their workout plan based on their selections

Be conversational and supportive. Remember their name is ${
      userName || "unknown"
    } and use it naturally in conversation.`,
    tools,
  });

  return result.toUIMessageStreamResponse();
}
