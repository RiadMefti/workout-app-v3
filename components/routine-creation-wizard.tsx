"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Plus, Trash2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { useRoutineGeneration } from "@/hooks/useRoutineGeneration";

interface RoutineCreationWizardProps {
  userId: string;
}

type CreationMode = "ai" | "custom";

export function RoutineCreationWizard({ userId }: RoutineCreationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<CreationMode | null>(null);

  // AI Mode State
  const [routineName, setRoutineName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [preferences, setPreferences] = useState("");

  // Custom Mode State
  const [customRoutineName, setCustomRoutineName] = useState("");
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [days, setDays] = useState<
    Array<{
      name: string;
      exercises: Array<{
        exerciseName: string;
        sets: Array<{ targetReps: number; targetWeight: number }>;
      }>;
    }>
  >([]);

  // AI Mode - Editable Days State (initialized from generatedRoutine)
  const [aiDays, setAiDays] = useState<
    Array<{
      name: string;
      exercises: Array<{
        exerciseName: string;
        sets: Array<{ targetReps: number; targetWeight: number }>;
      }>;
    }>
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    generatedRoutine,
    isGenerating,
    generateRoutine,
    reset: resetGeneration,
  } = useRoutineGeneration();

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
      // Move to step-by-step day editing for AI-generated routine
      setStep(3);
    } catch (error) {
      toast.error("Failed to generate routine");
    }
  };

  const handleCustomNext = () => {
    if (step === 2) {
      // Validate routine name and days count
      if (!customRoutineName.trim()) {
        toast.error("Please enter a routine name");
        return;
      }
      if (!daysPerWeek) {
        toast.error("Please select days per week");
        return;
      }

      // Initialize days array
      const numDays = parseInt(daysPerWeek);
      setDays(
        Array.from({ length: numDays }, (_, i) => ({
          name: `Day ${i + 1}`,
          exercises: [],
        }))
      );
      setCurrentDayIndex(0);
      setStep(3);
    } else if (step === 3) {
      // Validate current day
      const currentDay = days[currentDayIndex];
      if (!currentDay.name.trim()) {
        toast.error("Please enter a day name");
        return;
      }
      if (currentDay.exercises.length === 0) {
        toast.error("Please add at least one exercise");
        return;
      }

      for (const ex of currentDay.exercises) {
        if (!ex.exerciseName.trim()) {
          toast.error("Please name all exercises");
          return;
        }
      }

      // Move to next day or finish
      if (currentDayIndex < days.length - 1) {
        setCurrentDayIndex(currentDayIndex + 1);
      } else {
        setStep(4); // Review step
      }
    }
  };

  const handleAINext = () => {
    // Validate current AI day
    const currentDay = aiDays[currentDayIndex];
    if (!currentDay.name.trim()) {
      toast.error("Please enter a day name");
      return;
    }
    if (currentDay.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    for (const ex of currentDay.exercises) {
      if (!ex.exerciseName.trim()) {
        toast.error("Please name all exercises");
        return;
      }
    }

    // Move to next day or finish
    if (currentDayIndex < aiDays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else {
      setStep(4); // Review step
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let payload;

      if (mode === "ai" && aiDays.length > 0) {
        payload = {
          userId,
          name: routineName,
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
      } else {
        payload = {
          userId,
          name: customRoutineName,
          days: days.map((day, dayIdx) => ({
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
      }

      const response = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create routine");

      toast.success("Routine created successfully!");
      router.push("/routines");
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.error("Failed to create routine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDayName = (index: number, name: string) => {
    const updated = [...days];
    updated[index].name = name;
    setDays(updated);
  };

  const addExercise = () => {
    const updated = [...days];
    updated[currentDayIndex].exercises.push({
      exerciseName: "",
      sets: [{ targetReps: 10, targetWeight: 0 }],
    });
    setDays(updated);
  };

  const removeExercise = (exIndex: number) => {
    const updated = [...days];
    updated[currentDayIndex].exercises.splice(exIndex, 1);
    setDays(updated);
  };

  const updateExerciseName = (exIndex: number, name: string) => {
    const updated = [...days];
    updated[currentDayIndex].exercises[exIndex].exerciseName = name;
    setDays(updated);
  };

  const addSet = (exIndex: number) => {
    const updated = [...days];
    updated[currentDayIndex].exercises[exIndex].sets.push({
      targetReps: 10,
      targetWeight: 0,
    });
    setDays(updated);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const updated = [...days];
    const exercise = updated[currentDayIndex].exercises[exIndex];
    if (exercise.sets.length === 1) return;
    exercise.sets.splice(setIndex, 1);
    setDays(updated);
  };

  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: "targetReps" | "targetWeight",
    value: number
  ) => {
    const updated = [...days];
    updated[currentDayIndex].exercises[exIndex].sets[setIndex][field] = value;
    setDays(updated);
  };

  // AI Days editing functions
  const updateAiDayName = (index: number, name: string) => {
    const updated = [...aiDays];
    updated[index].name = name;
    setAiDays(updated);
  };

  const addAiExercise = () => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises.push({
      exerciseName: "",
      sets: [{ targetReps: 10, targetWeight: 0 }],
    });
    setAiDays(updated);
  };

  const removeAiExercise = (exIndex: number) => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises.splice(exIndex, 1);
    setAiDays(updated);
  };

  const updateAiExerciseName = (exIndex: number, name: string) => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises[exIndex].exerciseName = name;
    setAiDays(updated);
  };

  const addAiSet = (exIndex: number) => {
    const updated = [...aiDays];
    updated[currentDayIndex].exercises[exIndex].sets.push({
      targetReps: 10,
      targetWeight: 0,
    });
    setAiDays(updated);
  };

  const removeAiSet = (exIndex: number, setIndex: number) => {
    const updated = [...aiDays];
    const exercise = updated[currentDayIndex].exercises[exIndex];
    if (exercise.sets.length === 1) return;
    exercise.sets.splice(setIndex, 1);
    setAiDays(updated);
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

  return (
    <div className="container max-w-2xl mx-auto p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (step === 1) {
              router.push("/routines");
            } else {
              setStep(step - 1);
            }
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create Routine</h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of 4
          </p>
        </div>
      </div>

      {/* Step 1: Choose Mode */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-muted-foreground mb-4">
            How would you like to create your routine?
          </p>

          <Card
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              setMode("ai");
              setStep(2);
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">AI Generated</h3>
                <p className="text-sm text-muted-foreground">
                  Answer a few questions and let AI create a personalized
                  routine
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              setMode("custom");
              setStep(2);
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Plus className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Custom</h3>
                <p className="text-sm text-muted-foreground">
                  Build your own routine from scratch
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: AI Input Form */}
      {step === 2 && mode === "ai" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="routine-name">Routine Name</Label>
            <Input
              id="routine-name"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="e.g., Summer Shred, Strength Builder"
            />
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Days Per Week</Label>
            <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
              <SelectTrigger>
                <SelectValue placeholder="How many days?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="4">4 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="6">6 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferences (Optional)</Label>
            <Textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Any specific goals, equipment, or limitations?"
              rows={4}
            />
          </div>

          <Button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-5 w-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Routine
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Custom Basic Info */}
      {step === 2 && mode === "custom" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="custom-routine-name">Routine Name</Label>
            <Input
              id="custom-routine-name"
              value={customRoutineName}
              onChange={(e) => setCustomRoutineName(e.target.value)}
              placeholder="e.g., Push/Pull/Legs"
            />
          </div>

          <div className="space-y-2">
            <Label>Days Per Week</Label>
            <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
              <SelectTrigger>
                <SelectValue placeholder="How many days?" />
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

          <Button onClick={handleCustomNext} className="w-full" size="lg">
            Next
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 3: AI Day-by-Day Editor */}
      {step === 3 && mode === "ai" && aiDays.length > 0 && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {aiDays.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full ${
                  idx <= currentDayIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-muted-foreground">
              Day {currentDayIndex + 1} of {aiDays.length} - Review and edit as needed
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Day Name</Label>
              <Input
                value={aiDays[currentDayIndex].name}
                onChange={(e) => updateAiDayName(currentDayIndex, e.target.value)}
                placeholder="e.g., Push Day, Leg Day"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Exercises</Label>
                <Badge variant="secondary">
                  {aiDays[currentDayIndex].exercises.length} exercises
                </Badge>
              </div>

              {aiDays[currentDayIndex].exercises.map((ex, exIdx) => (
                <Card key={exIdx} className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      value={ex.exerciseName}
                      onChange={(e) => updateAiExerciseName(exIdx, e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1"
                    />
                    {aiDays[currentDayIndex].exercises.length > 1 && (
                      <Button
                        onClick={() => removeAiExercise(exIdx)}
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground w-12">
                        Set {setIdx + 1}
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
                        className="flex-1"
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
                        placeholder="Weight"
                        step="2.5"
                        className="flex-1"
                      />
                      {ex.sets.length > 1 && (
                        <Button
                          onClick={() => removeAiSet(exIdx, setIdx)}
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    onClick={() => addAiSet(exIdx)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Set
                  </Button>
                </Card>
              ))}

              <Button onClick={addAiExercise} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            <Button onClick={handleAINext} className="w-full" size="lg">
              {currentDayIndex < aiDays.length - 1 ? (
                <>
                  Next Day
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Review
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && mode === "custom" && days.length > 0 && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {days.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full ${
                  idx <= currentDayIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Day Name</Label>
              <Input
                value={days[currentDayIndex].name}
                onChange={(e) => updateDayName(currentDayIndex, e.target.value)}
                placeholder="e.g., Push Day, Leg Day"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Exercises</Label>
                <Badge variant="secondary">
                  {days[currentDayIndex].exercises.length} exercises
                </Badge>
              </div>

              {days[currentDayIndex].exercises.map((ex, exIdx) => (
                <Card key={exIdx} className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      value={ex.exerciseName}
                      onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1"
                    />
                    {days[currentDayIndex].exercises.length > 1 && (
                      <Button
                        onClick={() => removeExercise(exIdx)}
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground w-12">
                        Set {setIdx + 1}
                      </span>
                      <Input
                        type="number"
                        value={set.targetReps}
                        onChange={(e) =>
                          updateSet(
                            exIdx,
                            setIdx,
                            "targetReps",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Reps"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={set.targetWeight}
                        onChange={(e) =>
                          updateSet(
                            exIdx,
                            setIdx,
                            "targetWeight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Weight"
                        step="2.5"
                        className="flex-1"
                      />
                      {ex.sets.length > 1 && (
                        <Button
                          onClick={() => removeSet(exIdx, setIdx)}
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    onClick={() => addSet(exIdx)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Set
                  </Button>
                </Card>
              ))}

              <Button onClick={addExercise} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            <Button onClick={handleCustomNext} className="w-full" size="lg">
              {currentDayIndex < days.length - 1 ? (
                <>
                  Next Day
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Review
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Final Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">
              {mode === "ai" ? routineName : customRoutineName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === "ai" ? aiDays.length : days.length} day split
            </p>
          </div>

          {(mode === "ai" ? aiDays : days).map((day, idx) => (
            <Card key={idx} className="p-4">
              <h4 className="font-medium mb-2">{day.name}</h4>
              <ul className="space-y-1">
                {day.exercises.map((ex, exIdx) => (
                  <li key={exIdx} className="text-sm text-muted-foreground">
                    • {ex.exerciseName} - {ex.sets.length} sets
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? "Creating..." : "Create Routine"}
            <Check className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
