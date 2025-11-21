"use client";

import { useState, useEffect } from "react";
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
  const [step, setStep] = useState<"mode" | "ai-input" | "custom-input" | "day-edit" | "review">(
    "mode"
  );
  const [mode, setMode] = useState<"ai" | "custom" | null>(null);

  // AI mode state
  const [routineName, setRoutineName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [preferences, setPreferences] = useState("");

  // Custom mode state
  const [customRoutineName, setCustomRoutineName] = useState("");
  const [customDaysPerWeek, setCustomDaysPerWeek] = useState("");

  const {
    generatedRoutine,
    isGenerating,
    generateRoutine,
    reset: resetGeneration,
  } = useRoutineGeneration();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Days editing state
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [aiDays, setAiDays] = useState<
    Array<{
      name: string;
      exercises: Array<{
        exerciseName: string;
        sets: Array<{ targetReps: number; targetWeight: number }>;
      }>;
    }>
  >([]);

  const handleAIGenerate = async () => {
    if (!routineName.trim() || !experienceLevel || !daysPerWeek) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await generateRoutine({
        routineName: routineName.trim(),
        experienceLevel,
        daysPerWeek: parseInt(daysPerWeek),
        preferences: preferences.trim(),
      });
      // Initialize editable AI days from generated routine
      if (result && result.days) {
        setAiDays(
          result.days.map((day) => ({
            name: day.name,
            exercises: day.exercises.map((ex) => ({
              exerciseName: ex.exerciseName,
              sets: ex.sets.map((s) => ({
                targetReps: s.targetReps,
                targetWeight: s.targetWeight,
              })),
            })),
          }))
        );
        setCurrentDayIndex(0);
      }
      // Automatically move to day editing step
      setStep("day-edit");
    } catch (error) {
      toast.error("Failed to generate routine");
    }
  };

  const handleCustomStart = () => {
    if (!customRoutineName.trim() || !customDaysPerWeek) {
      toast.error("Please fill in routine name and days per week");
      return;
    }

    // Initialize empty days for custom mode
    const numDays = parseInt(customDaysPerWeek);
    setAiDays(
      Array.from({ length: numDays }, (_, i) => ({
        name: `Day ${i + 1}`,
        exercises: [],
      }))
    );
    setCurrentDayIndex(0);
    setStep("day-edit");
  };

  // AI editing functions
  const updateAiDayName = (index: number, name: string) => {
    const updated = [...aiDays];
    updated[index].name = name;
    setAiDays(updated);
  };

  const updateAiExerciseName = (exIndex: number, name: string) => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises[exIndex].exerciseName = name;
    setAiDays(updated);
  };

  const addExercise = () => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises.push({
      exerciseName: "",
      sets: [{ targetReps: 10, targetWeight: 0 }],
    });
    setAiDays(updated);
  };

  const removeExercise = (exIndex: number) => {
    const updated = [...aiDays];
    if (updated[currentDayIndex].exercises.length > 1) {
      updated[currentDayIndex].exercises.splice(exIndex, 1);
      setAiDays(updated);
    }
  };

  const addSet = (exIndex: number) => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises[exIndex].sets.push({
      targetReps: 10,
      targetWeight: 0,
    });
    setAiDays(updated);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const updated = [...aiDays];
    const exercise = updated[currentDayIndex].exercises[exIndex];
    if (exercise.sets.length > 1) {
      exercise.sets.splice(setIndex, 1);
      setAiDays(updated);
    }
  };

  const updateAiSet = (
    exIndex: number,
    setIndex: number,
    field: "targetReps" | "targetWeight",
    value: number
  ) => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises[exIndex].sets[setIndex][field] = value;
    setAiDays(updated);
  };

  const handleDayNext = () => {
    // Validate current day
    const currentDay = aiDays[currentDayIndex];
    if (!currentDay.name.trim()) {
      toast.error("Please enter a day name");
      return;
    }
    if (mode === "custom" && currentDay.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    if (currentDayIndex < aiDays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else {
      setStep("review");
    }
  };

  const handleSubmit = async () => {
    if (aiDays.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId,
        name: mode === "ai" ? routineName : customRoutineName,
        days: aiDays.map((day, dayIdx) => ({
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

      // Reset the component state
      setStep("mode");
      setMode(null);
      setRoutineName("");
      setExperienceLevel("");
      setDaysPerWeek("");
      setPreferences("");
      setCustomRoutineName("");
      setCustomDaysPerWeek("");
      setAiDays([]);
      setCurrentDayIndex(0);

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
                if (step === "ai-input" || step === "custom-input") setStep("mode");
                if (step === "day-edit") {
                  if (currentDayIndex > 0) {
                    setCurrentDayIndex(currentDayIndex - 1);
                  } else {
                    setStep(mode === "ai" ? "ai-input" : "custom-input");
                  }
                }
                if (step === "review") {
                  setCurrentDayIndex(aiDays.length - 1);
                  setStep("day-edit");
                }
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
          <Button
            onClick={() => {
              // Reset state before closing
              setStep("mode");
              setMode(null);
              setRoutineName("");
              setExperienceLevel("");
              setDaysPerWeek("");
              setPreferences("");
              setCustomRoutineName("");
              setCustomDaysPerWeek("");
              setAiDays([]);
              setCurrentDayIndex(0);
              onCancel();
            }}
            variant="ghost"
            size="sm"
          >
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
              setStep("custom-input");
            }}
            variant="outline"
            className="w-full justify-start h-auto p-3"
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

      {/* Step 2b: Custom Input */}
      {step === "custom-input" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Routine Name</Label>
            <Input
              value={customRoutineName}
              onChange={(e) => setCustomRoutineName(e.target.value)}
              placeholder="e.g., My Custom Plan"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Days Per Week</Label>
            <Select value={customDaysPerWeek} onValueChange={setCustomDaysPerWeek}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="4">4 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="6">6 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCustomStart}
            className="w-full"
            size="sm"
          >
            Start Building
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 3: Day-by-Day Edit */}
      {step === "day-edit" && aiDays.length > 0 && (
        <div className="space-y-3">
          {/* Progress */}
          <div className="flex gap-1">
            {aiDays.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full ${
                  idx <= currentDayIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-xs text-muted-foreground">
              {aiDays[currentDayIndex].name} - Day {currentDayIndex + 1} of {aiDays.length}
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Day Name</Label>
              <Input
                value={aiDays[currentDayIndex].name}
                onChange={(e) => updateAiDayName(currentDayIndex, e.target.value)}
                placeholder="e.g., Push Day"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {aiDays[currentDayIndex].exercises.map((ex, exIdx) => (
                <div key={exIdx} className="border rounded-lg p-2 space-y-2">
                  <div className="flex items-center gap-1">
                    <Input
                      value={ex.exerciseName}
                      onChange={(e) => updateAiExerciseName(exIdx, e.target.value)}
                      placeholder="Exercise name"
                      className="h-8 text-sm font-medium flex-1"
                    />
                    <Button
                      onClick={() => removeExercise(exIdx)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-8">
                          {setIdx + 1}
                        </span>
                        <Input
                          type="number"
                          value={set.targetReps}
                          onChange={(e) =>
                            updateAiSet(
                              exIdx,
                              setIdx,
                              "targetReps",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="Reps"
                          className="h-7 text-xs flex-1"
                        />
                        <Input
                          type="number"
                          value={set.targetWeight}
                          onChange={(e) =>
                            updateAiSet(
                              exIdx,
                              setIdx,
                              "targetWeight",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="kg"
                          step="2.5"
                          className="h-7 text-xs flex-1"
                        />
                        <Button
                          onClick={() => removeSet(exIdx, setIdx)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => addSet(exIdx)}
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Set
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={addExercise} variant="outline" className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>

            <Button onClick={handleDayNext} className="w-full" size="sm">
              {currentDayIndex < aiDays.length - 1 ? (
                <>
                  Next Day
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Review
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Final Review */}
      {step === "review" && aiDays.length > 0 && (
        <div className="space-y-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="font-medium text-sm">
              {mode === "ai" ? routineName : customRoutineName}
            </div>
            <div className="text-xs text-muted-foreground">
              {aiDays.length} day split
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {aiDays.map((day, idx) => (
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
