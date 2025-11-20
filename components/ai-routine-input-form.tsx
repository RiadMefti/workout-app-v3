"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIRoutineInputFormProps {
  onGenerate: (input: {
    experienceLevel: string;
    daysPerWeek: number;
    preferences: string;
    routineName: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function AIRoutineInputForm({
  onGenerate,
  onCancel,
}: AIRoutineInputFormProps) {
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [daysPerWeek, setDaysPerWeek] = useState<string>("");
  const [preferences, setPreferences] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!experienceLevel || !daysPerWeek) {
      alert("Please select your experience level and days per week");
      return;
    }

    if (!routineName.trim()) {
      alert("Please enter a routine name");
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate({
        experienceLevel,
        daysPerWeek: parseInt(daysPerWeek),
        preferences: preferences.trim(),
        routineName: routineName.trim(),
      });
    } catch (error) {
      console.error("Failed to generate routine:", error);
      alert("Failed to generate routine. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Routine Generator</CardTitle>
            <p className="text-sm text-muted-foreground">
              Let AI create a personalized workout routine for you
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Routine Name */}
        <div className="space-y-2">
          <Label htmlFor="routine-name">Routine Name</Label>
          <Input
            id="routine-name"
            placeholder="e.g., Summer Shred 2024, Strength Builder"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
          />
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience-level">Experience Level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger id="experience-level">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Beginner</span>
                  <span className="text-xs text-muted-foreground">
                    New to working out or returning after a break
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="intermediate">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Intermediate</span>
                  <span className="text-xs text-muted-foreground">
                    6+ months of consistent training
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="advanced">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Advanced</span>
                  <span className="text-xs text-muted-foreground">
                    2+ years of consistent training
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Days Per Week */}
        <div className="space-y-2">
          <Label htmlFor="days-per-week">Days Per Week</Label>
          <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
            <SelectTrigger id="days-per-week">
              <SelectValue placeholder="How many days can you train?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 days per week</SelectItem>
              <SelectItem value="4">4 days per week</SelectItem>
              <SelectItem value="5">5 days per week</SelectItem>
              <SelectItem value="6">6 days per week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferences / Goals */}
        <div className="space-y-2">
          <Label htmlFor="preferences">
            Preferences & Goals{" "}
            <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="preferences"
            placeholder="Any specific goals, injuries, equipment limitations, or preferences?&#10;&#10;Examples:&#10;- Focus on upper body strength&#10;- I have a shoulder injury, avoid overhead press&#10;- Only have dumbbells at home&#10;- Want to improve my deadlift"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isGenerating}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Routine
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
