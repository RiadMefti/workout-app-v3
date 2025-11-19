"use client";

import { Dumbbell, Calendar, History, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  prompt: string;
}

const actions: QuickAction[] = [
  {
    id: "record-workout",
    title: "Record a Workout",
    description: "Log your sets, reps, and exercises",
    icon: Dumbbell,
    gradient: "from-blue-500 to-cyan-500",
    prompt: "I want to record a workout",
  },
  {
    id: "create-plan",
    title: "Create Workout Plan",
    description: "Generate a personalized program",
    icon: Calendar,
    gradient: "from-purple-500 to-pink-500",
    prompt: "I want to create a new workout plan",
  },
  {
    id: "workout-history",
    title: "Workout History",
    description: "View past workouts and progress",
    icon: History,
    gradient: "from-orange-500 to-red-500",
    prompt: "Show me my workout history",
  },
  {
    id: "current-routine",
    title: "Current Routine",
    description: "Check your active workout plan",
    icon: Eye,
    gradient: "from-green-500 to-emerald-500",
    prompt: "Show me my current workout routine",
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
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-border/50 bg-card/50 backdrop-blur-sm"
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative p-5 sm:p-6 flex items-start gap-4">
                {/* Icon Container */}
                <div
                  className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
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
