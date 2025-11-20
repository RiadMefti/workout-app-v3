import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { requireAuth } from "@/lib/auth";
import {
  getAIProvider,
  DEFAULT_AI_MODEL,
  AI_SETTINGS,
} from "@/lib/ai-config";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { routineName, experienceLevel, daysPerWeek, preferences } = body;

    if (!routineName || !experienceLevel || !daysPerWeek) {
      return NextResponse.json(
        {
          success: false,
          error: "routineName, experienceLevel, and daysPerWeek are required",
        },
        { status: 400 }
      );
    }

    const aiProvider = getAIProvider();

    // Build the prompt for the LLM
    const prompt = `You are a professional fitness coach. Generate a detailed workout routine with the following requirements:

Routine Name: ${routineName}
Experience Level: ${experienceLevel}
Training Days Per Week: ${daysPerWeek}
${preferences ? `Additional Preferences/Goals: ${preferences}` : ""}

Create a complete ${daysPerWeek}-day workout routine. For each day, provide:
1. A descriptive name (e.g., "Push Day", "Pull Day", "Leg Day", "Upper Body", "Lower Body")
2. A list of exercises appropriate for ${experienceLevel} level
3. For each exercise, specify the number of sets and target reps and weight

Guidelines:
- For ${experienceLevel} level:
  ${experienceLevel === "beginner" ? "- 3-4 exercises per day\n  - 3 sets per exercise\n  - 8-12 reps\n  - Use moderate weights or bodyweight" : ""}
  ${experienceLevel === "intermediate" ? "- 4-6 exercises per day\n  - 3-4 sets per exercise\n  - 6-12 reps varying by exercise\n  - Progressive overload principles" : ""}
  ${experienceLevel === "advanced" ? "- 5-7 exercises per day\n  - 4-5 sets per exercise\n  - Varying rep ranges (3-15)\n  - Advanced techniques and periodization" : ""}
- Use compound movements as primary exercises
- Include proper exercise progression
- Use 0 for bodyweight exercises
- Weights should be realistic starting points based on experience level
${preferences ? `- Account for: ${preferences}` : ""}

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "name": "${routineName}",
  "days": [
    {
      "name": "Day name here",
      "dayOrder": 1,
      "exercises": [
        {
          "exerciseName": "Exercise name",
          "exerciseOrder": 1,
          "sets": [
            {
              "setNumber": 1,
              "targetReps": 10,
              "targetWeight": 135
            }
          ]
        }
      ]
    }
  ]
}`;

    const { text } = await generateText({
      model: aiProvider(DEFAULT_AI_MODEL),
      prompt,
      temperature: AI_SETTINGS.routineGeneration.temperature,
    });

    // Parse the LLM response
    let routine;
    try {
      // Clean the response in case LLM adds markdown code blocks
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      routine = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse LLM response:", text);
      return NextResponse.json(
        { error: "Failed to parse generated routine" },
        { status: 500 }
      );
    }

    // Validate the structure
    if (!routine.days || !Array.isArray(routine.days)) {
      return NextResponse.json(
        { success: false, error: "Invalid routine structure" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, routine });
  } catch (error) {
    console.error("Error generating routine:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate routine",
      },
      { status: 500 }
    );
  }
}
