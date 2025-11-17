import { streamText, UIMessage, convertToModelMessages } from "ai";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
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
  });

  return result.toUIMessageStreamResponse();
}
