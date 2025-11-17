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
    model: github("openai/gpt-4.1"),
    messages: convertToModelMessages(messages),
    system: `You are a friendly fitness coach assistant. ${
      userName ? `The user's name is ${userName}.` : ""
    }

When the user expresses interest in creating a workout plan, follow these steps:
1. Use the showWorkoutPlanQuestions tool to ask about their experience level
2. After they select their level, use the showWorkoutDaysSelector tool to ask how many days per week they want to train
3. Once you have both pieces of information, use the generateWorkoutPlan tool to create their personalized plan
4. The workout plan will automatically be displayed in a beautiful UI component

Workout split logic:
- 1-3 days/week: Full Body split
- 4 days/week: Upper/Lower split
- 5 days/week: Push/Pull/Legs + Upper/Lower
- 6-7 days/week: Push/Pull/Legs (done twice)

IMPORTANT: The workout generator automatically selects exercises and prioritizes:
- Big compound movements: bench press, squat, deadlift, overhead press, barbell rows, pull-ups
- Well-known, proven exercises that are staples in any serious gym
- Effective movements that build real strength and muscle efficiently
- These are the exercises professional bodybuilders and powerlifters have used for decades

After the workout plan is displayed, you can:
- Explain why specific compound exercises are included and their benefits
- Answer questions about form, technique, or progression
- Provide tips for maximizing results
- Explain the training split rationale

Be conversational and supportive. Remember their name is ${
      userName || "unknown"
    } and use it naturally in conversation.`,
    tools,
  });

  return result.toUIMessageStreamResponse();
}
