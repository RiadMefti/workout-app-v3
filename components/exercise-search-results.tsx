"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface ExerciseSearchResultsProps {
  exercises: Array<{
    id: string;
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

      <div className="space-y-2">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="border rounded-md p-3 space-y-2 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm">{exercise.name}</h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.targetMuscles.slice(0, 2).map((muscle, idx) => (
                    <Badge key={`${exercise.id}-muscle-${idx}`} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                  {exercise.equipments.slice(0, 1).map((equip, idx) => (
                    <Badge key={`${exercise.id}-equip-${idx}`} variant="outline" className="text-xs">
                      {equip}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative w-16 h-16 bg-muted rounded overflow-hidden shrink-0">
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
