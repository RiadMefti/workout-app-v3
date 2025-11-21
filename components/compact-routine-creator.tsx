"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Plus, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { useRoutineGeneration } from "@/hooks/useRoutineGeneration";

interface CompactRoutineCreatorProps {
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function CompactRoutineCreator({
  userId,
  onComplete,
  onCancel,
}: CompactRoutineCreatorProps) {
  const [step, setStep] = useState<"mode" | "ai-input" | "ai-review" | "custom-day">(
    "mode"
  );
  const [mode, setMode] = useState<"ai" | "custom" | null>(null);

  // AI mode state
  const [routineName, setRoutineName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [preferences, setPreferences] = useState("");

  const {
    generatedRoutine,
    isGenerating,
    generateRoutine,
    reset: resetGeneration,
  } = useRoutineGeneration();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAIGenerate = async () => {
    if (!routineName.trim() || !experienceLevel || !daysPerWeek) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await generateRoutine({
        routineName: routineName.trim(),
        experienceLevel,
        daysPerWeek: parseInt(daysPerWeek),
        preferences: preferences.trim(),
      });
      setStep("ai-review");
    } catch (error) {
      toast.error("Failed to generate routine");
    }
  };

  const handleSubmit = async () => {
    if (!generatedRoutine) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId,
        name: generatedRoutine.name,
        days: generatedRoutine.days.map((day, dayIdx) => ({
          name: day.name,
          dayOrder: dayIdx + 1,
          exercises: day.exercises.map((ex, exIdx) => ({
            exerciseName: ex.exerciseName,
            exerciseOrder: exIdx + 1,
            sets: ex.sets.map((s, sIdx) => ({
              setNumber: sIdx + 1,
              targetReps: s.targetReps,
              targetWeight: s.targetWeight,
            })),
          })),
        })),
      };

      const response = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create routine");

      toast.success("Routine created!");
      if (onComplete) onComplete();
    } catch (error) {
      toast.error("Failed to create routine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step !== "mode" && (
            <Button
              onClick={() => {
                if (step === "ai-input") setStep("mode");
                if (step === "ai-review") setStep("ai-input");
              }}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h3 className="font-semibold text-sm">Create Routine</h3>
        </div>
        {onCancel && (
          <Button onClick={onCancel} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Step 1: Choose Mode */}
      {step === "mode" && (
        <div className="space-y-2">
          <Button
            onClick={() => {
              setMode("ai");
              setStep("ai-input");
            }}
            variant="outline"
            className="w-full justify-start h-auto p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">AI Generated</div>
                <div className="text-xs text-muted-foreground">
                  Quick & personalized
                </div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => {
              setMode("custom");
              toast.info("Custom builder coming soon!");
            }}
            variant="outline"
            className="w-full justify-start h-auto p-3"
            disabled
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">Build Custom</div>
                <div className="text-xs text-muted-foreground">
                  Create from scratch
                </div>
              </div>
            </div>
          </Button>
        </div>
      )}

      {/* Step 2: AI Input */}
      {step === "ai-input" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Routine Name</Label>
            <Input
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="e.g., Summer Shred"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Experience Level</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Days Per Week</Label>
            <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="4">4 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="6">6 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Preferences (Optional)</Label>
            <Textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., focus on upper body, no running"
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <Button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="w-full"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 3: AI Review */}
      {step === "ai-review" && generatedRoutine && (
        <div className="space-y-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="font-medium text-sm">{generatedRoutine.name}</div>
            <div className="text-xs text-muted-foreground">
              {generatedRoutine.days.length} day split
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {generatedRoutine.days.map((day, idx) => (
              <div key={idx} className="border rounded-lg p-2">
                <div className="font-medium text-xs mb-1">{day.name}</div>
                <div className="text-xs text-muted-foreground">
                  {day.exercises.map((ex) => ex.exerciseName).join(", ")}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            size="sm"
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Routine
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
