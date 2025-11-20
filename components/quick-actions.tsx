"use client";

import { Dumbbell, Calendar, History, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
}

const actions: QuickAction[] = [
  {
    id: "record-workout",
    title: "Record a Workout",
    description: "Log your sets, reps, and exercises",
    icon: Dumbbell,
    prompt: "I want to record a workout",
  },
  {
    id: "manage-routines",
    title: "Manage Routines",
    description: "Create and view your workout routines",
    icon: ListChecks,
    prompt: "I want to manage my workout routines",
  },
  {
    id: "create-plan",
    title: "Generate Plan (AI)",
    description: "Let AI create a personalized program",
    icon: Calendar,
    prompt: "I want to create a new workout plan",
  },
  {
    id: "workout-history",
    title: "Workout History",
    description: "View past workouts and progress",
    icon: History,
    prompt: "Show me my workout history",
  },
];

interface QuickActionsProps {
  onActionClick: (prompt: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              onClick={() => onActionClick(action.prompt)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onActionClick(action.prompt);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={action.title}
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/50"
            >
              {/* Content */}
              <div className="relative p-5 sm:p-6 flex items-start gap-4">
                {/* Icon Container */}
                <div
                  className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>

                {/* Arrow Indicator */}
                <div className="shrink-0 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  <svg
                    className="w-3 h-3 text-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
