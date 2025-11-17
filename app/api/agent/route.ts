import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request: userRequest, model = "openai/gpt-4.1" } = body;

    if (!userRequest || typeof userRequest !== "string") {
      return NextResponse.json(
        { error: "Request text is required" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
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

    const systemPrompt = `You are a professional fitness coach. Create workout programs based on user requests.
Be direct and provide specific exercises, sets, reps, and rest periods.`;

    const result = await generateText({
      model: github(model),
      temperature: 0.7,
      system: systemPrompt,
      prompt: userRequest,
    });

    return NextResponse.json({
      success: true,
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
