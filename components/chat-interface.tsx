"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useChat } from "@ai-sdk/react";
import { WorkoutPlanQuestions } from "./workout-plan-questions";
import { WorkoutDaysSelector } from "./workout-days-selector";
import { WorkoutPlanDisplay } from "./workout-plan-display";
import { QuickActions } from "./quick-actions";
import { WorkoutHistoryCalendar } from "./workout-history-calendar";
import { WorkoutRoutineManager } from "./workout-routine-manager";
import { AIRoutineInputForm } from "./ai-routine-input-form";
import { WorkoutRoutineCreator } from "./workout-routine-creator";
import type { UIMessage } from "ai";
import type { AppTools } from "@/ai/tools";

export function ChatInterface() {
  const { user } = useAuth();

  // Memoize initial messages to prevent recreation on re-renders
  const initialMessages = useMemo<
    UIMessage<unknown, Record<string, never>, AppTools>[]
  >(
    () => [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Hello ${
              user?.firstName || "there"
            }! What can I do for you? I can help you create a personalized workout plan if you'd like.`,
          },
        ],
      },
    ],
    [user?.firstName]
  );

  const { messages, sendMessage, status } = useChat<
    UIMessage<unknown, Record<string, never>, AppTools>
  >({
    messages: initialMessages,
  });

  const [inputValue, setInputValue] = useState("");
  const [showWorkoutHistory, setShowWorkoutHistory] = useState(false);
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [showAIRoutineForm, setShowAIRoutineForm] = useState(false);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<{
    name: string;
    days: Array<{
      name: string;
      dayOrder: number;
      exercises: Array<{
        exerciseName: string;
        exerciseOrder: number;
        sets: Array<{
          setNumber: number;
          targetReps: number;
          targetWeight: number;
        }>;
      }>;
    }>;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    sendMessage({ text: inputValue });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Chat Header */}
      <div className="shrink-0 border-b p-4 bg-background">
        <div className="flex items-center gap-3 lg:gap-3 pl-16 lg:pl-0">
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=coach&backgroundColor=b6e3f4" />
            <AvatarFallback>🏋️</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Your Coach</h2>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                {message.role === "assistant" ? (
                  <>
                    <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=coach&backgroundColor=b6e3f4" />
                    <AvatarFallback>🏋️</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src={user?.profilePictureUrl || undefined} />
                    <AvatarFallback>
                      {user?.firstName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={`flex flex-col gap-2 ${
                  message.id === "welcome" && message.role === "assistant"
                    ? "w-full"
                    : `max-w-[70%] ${
                        message.role === "user" ? "items-end" : "items-start"
                      }`
                }`}
              >
                {/* Text messages */}
                {message.parts.some((p) => p.type === "text") && (
                  <>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <p
                              key={`${message.id}-${i}`}
                              className="text-sm whitespace-pre-wrap"
                            >
                              {part.text}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Show QuickActions for welcome message */}
                    {message.id === "welcome" &&
                      message.role === "assistant" && (
                        <QuickActions
                          onActionClick={(prompt) => {
                            // Check if it's the workout history action
                            if (
                              prompt.toLowerCase().includes("workout history")
                            ) {
                              setShowWorkoutHistory(true);
                              return; // Don't send message to LLM
                            }
                            // Check if it's the manage routines action
                            if (
                              prompt
                                .toLowerCase()
                                .includes("manage my workout routines")
                            ) {
                              setShowRoutineManager(true);
                              return; // Don't send message to LLM
                            }
                            // Check if it's the create plan (AI) action
                            if (
                              prompt
                                .toLowerCase()
                                .includes("create a new workout plan")
                            ) {
                              setShowAIRoutineForm(true);
                              return; // Don't send message to LLM
                            }
                            // For other actions, send to LLM
                            sendMessage({ text: prompt });
                          }}
                        />
                      )}
                  </>
                )}

                {/* Show workout history calendar when requested */}
                {message.id === "welcome" &&
                  message.role === "assistant" &&
                  showWorkoutHistory && <WorkoutHistoryCalendar />}

                {/* Show workout routine manager when requested */}
                {message.id === "welcome" &&
                  message.role === "assistant" &&
                  showRoutineManager &&
                  user?.id && <WorkoutRoutineManager userId={user.id} />}

                {/* Show AI Routine Form when Generate Plan is clicked */}
                {message.id === "welcome" &&
                  message.role === "assistant" &&
                  showAIRoutineForm &&
                  !isGeneratingRoutine &&
                  !generatedRoutine &&
                  user?.id && (
                    <AIRoutineInputForm
                      onGenerate={async (formData) => {
                        setIsGeneratingRoutine(true);
                        try {
                          const response = await fetch(
                            "/api/routines/generate",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(formData),
                            }
                          );

                          if (!response.ok) {
                            const errorData = await response
                              .json()
                              .catch(() => ({ error: "Unknown error" }));
                            throw new Error(
                              errorData.error || "Failed to generate routine"
                            );
                          }

                          const data = await response.json();
                          // Convert null targetWeight to 0 for the form
                          const routineWithDefaults = {
                            ...data.routine,
                            days: data.routine.days.map((day: any) => ({
                              ...day,
                              exercises: day.exercises.map((exercise: any) => ({
                                ...exercise,
                                sets: exercise.sets.map((set: any) => ({
                                  ...set,
                                  targetWeight: set.targetWeight ?? 0,
                                })),
                              })),
                            })),
                          };
                          setGeneratedRoutine(routineWithDefaults);
                        } catch (error) {
                          console.error("Error generating routine:", error);
                          alert(
                            error instanceof Error
                              ? error.message
                              : "Failed to generate routine"
                          );
                        } finally {
                          setIsGeneratingRoutine(false);
                        }
                      }}
                      onCancel={() => {
                        setShowAIRoutineForm(false);
                      }}
                    />
                  )}

                {/* Show generated routine in editable form */}
                {message.id === "welcome" &&
                  message.role === "assistant" &&
                  showAIRoutineForm &&
                  generatedRoutine &&
                  user?.id && (
                    <WorkoutRoutineCreator
                      initialRoutine={generatedRoutine}
                      onCreateRoutine={async (routine) => {
                        try {
                          const response = await fetch("/api/routines", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(routine),
                          });

                          if (!response.ok) {
                            throw new Error("Failed to create routine");
                          }

                          // Reset states
                          setShowAIRoutineForm(false);
                          setGeneratedRoutine(null);
                          alert("Routine created successfully!");
                        } catch (error) {
                          console.error("Error creating routine:", error);
                          alert("Failed to create routine");
                        }
                      }}
                      onCancel={() => {
                        setShowAIRoutineForm(false);
                        setGeneratedRoutine(null);
                      }}
                    />
                  )}

                {/* Show loading state while generating */}
                {message.id === "welcome" &&
                  message.role === "assistant" &&
                  isGeneratingRoutine && (
                    <div className="w-full max-w-2xl mx-auto p-6 border rounded-lg bg-card">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Generating your personalized workout routine...
                        </p>
                      </div>
                    </div>
                  )}

                {/* Tool invocations */}
                {message.parts.map((part, i) => {
                  // Type-safe tool rendering - TypeScript knows all tools in AppTools!
                  if (part.type === "tool-showWorkoutPlanQuestions") {
                    if (part.state === "output-available") {
                      return (
                        <WorkoutPlanQuestions
                          key={`${message.id}-${i}`}
                          userName={part.output.userName}
                          options={part.output.options}
                          onSelect={(level) => {
                            sendMessage({
                              text: `I'm ${level.toLowerCase()} level`,
                            });
                          }}
                        />
                      );
                    }
                  }

                  if (part.type === "tool-showWorkoutDaysSelector") {
                    if (part.state === "output-available") {
                      return (
                        <WorkoutDaysSelector
                          key={`${message.id}-${i}`}
                          experienceLevel={part.output.experienceLevel}
                          daysOptions={part.output.daysOptions}
                          onSelect={(days) => {
                            sendMessage({
                              text: `I want to train ${days} ${
                                days === 1 ? "day" : "days"
                              } per week`,
                            });
                          }}
                        />
                      );
                    }
                  }

                  if (part.type === "tool-generateWorkoutPlan") {
                    if (part.state === "output-available") {
                      return (
                        <WorkoutPlanDisplay
                          key={`${message.id}-${i}`}
                          plan={part.output.plan}
                          split={part.output.split}
                          daysPerWeek={part.output.daysPerWeek}
                        />
                      );
                    }
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {(status === "submitted" || status === "streaming") && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=coach&backgroundColor=b6e3f4" />
                <AvatarFallback>🏋️</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2 max-w-[70%] items-start">
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
