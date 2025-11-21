"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface ExerciseSearchResultsProps {
  exercises: Array<{
    exerciseId: string;
    name: string;
    targetMuscles: string[];
    equipments: string[];
    gifUrl: string;
  }>;
  total: number;
}

export function ExerciseSearchResults({
  exercises,
  total,
}: ExerciseSearchResultsProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Exercises</h3>
        <Badge variant="secondary" className="text-xs">
          {total} found
        </Badge>
      </div>

      <div className="space-y-3">
        {exercises.map((exercise) => (
          <div
            key={exercise.exerciseId}
            className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-base">{exercise.name}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.targetMuscles.slice(0, 3).map((muscle, idx) => (
                    <Badge
                      key={`${exercise.exerciseId}-muscle-${idx}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {muscle}
                    </Badge>
                  ))}
                  {exercise.equipments.slice(0, 2).map((equip, idx) => (
                    <Badge
                      key={`${exercise.exerciseId}-equip-${idx}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {equip}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Larger GIF display */}
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
