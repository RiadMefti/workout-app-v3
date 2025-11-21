"use client";

import { Dumbbell, Calendar, History, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  id: string;
  title: string;
  icon: React.ElementType;
  prompt: string;
}

const actions: QuickAction[] = [
  {
    id: "record-workout",
    title: "Record Workout",
    icon: Dumbbell,
    prompt: "I want to record a workout",
  },
  {
    id: "manage-routines",
    title: "My Routines",
    icon: ListChecks,
    prompt: "I want to manage my workout routines",
  },
  {
    id: "create-plan",
    title: "Generate Plan",
    icon: Calendar,
    prompt: "I want to create a new workout plan",
  },
  {
    id: "workout-history",
    title: "History",
    icon: History,
    prompt: "Show me my workout history",
  },
];

interface QuickActionsProps {
  onActionClick: (prompt: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={() => onActionClick(action.prompt)}
              variant="outline"
              className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
