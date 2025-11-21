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
import { CompactWorkoutRecorder } from "./compact-workout-recorder";
import { CompactRoutineManager } from "./compact-routine-manager";
import { CompactRoutineCreator } from "./compact-routine-creator";
import type { UIMessage } from "ai";
import type { AppTools } from "@/ai/tools";

export function ChatInterface() {
  const { user } = useAuth();

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
            text: `Hey ${user?.firstName || "there"}! 👋 What would you like to do today?`,
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
  const [showRoutineCreator, setShowRoutineCreator] = useState(false);
  const [showWorkoutRecorder, setShowWorkoutRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    sendMessage({ text: inputValue });
    setInputValue("");
  };

  const handleQuickAction = (prompt: string) => {
    if (prompt.toLowerCase().includes("record a workout")) {
      setShowWorkoutRecorder(true);
      setShowRoutineManager(false);
      setShowRoutineCreator(false);
      setShowWorkoutHistory(false);
    } else if (prompt.toLowerCase().includes("manage my workout routines")) {
      setShowRoutineManager(true);
      setShowWorkoutRecorder(false);
      setShowRoutineCreator(false);
      setShowWorkoutHistory(false);
    } else if (prompt.toLowerCase().includes("create a new workout plan")) {
      setShowRoutineCreator(true);
      setShowWorkoutRecorder(false);
      setShowRoutineManager(false);
      setShowWorkoutHistory(false);
    } else if (prompt.toLowerCase().includes("workout history")) {
      setShowWorkoutHistory(true);
      setShowWorkoutRecorder(false);
      setShowRoutineManager(false);
      setShowRoutineCreator(false);
    } else {
      sendMessage({ text: prompt });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Chat Header */}
      <div className="shrink-0 border-b p-3 bg-background">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=coach&backgroundColor=b6e3f4" />
            <AvatarFallback>🏋️</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">Your Coach</h2>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        <div className="space-y-3 max-w-2xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-7 w-7 shrink-0">
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
                    : `max-w-[80%] ${
                        message.role === "user" ? "items-end" : "items-start"
                      }`
                }`}
              >
                {/* Text messages */}
                {message.parts.some((p) => p.type === "text") && (
                  <>
                    <div
                      className={`rounded-lg px-3 py-2 ${
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
                        <QuickActions onActionClick={handleQuickAction} />
                      )}
                  </>
                )}

                {/* Show compact components */}
                {message.id === "welcome" && message.role === "assistant" && (
                  <>
                    {showWorkoutRecorder && user?.id && (
                      <CompactWorkoutRecorder
                        userId={user.id}
                        onComplete={() => setShowWorkoutRecorder(false)}
                        onCancel={() => setShowWorkoutRecorder(false)}
                      />
                    )}

                    {showRoutineManager && user?.id && (
                      <CompactRoutineManager
                        userId={user.id}
                        onCreateNew={() => {
                          setShowRoutineManager(false);
                          setShowRoutineCreator(true);
                        }}
                      />
                    )}

                    {showRoutineCreator && user?.id && (
                      <CompactRoutineCreator
                        userId={user.id}
                        onComplete={() => {
                          setShowRoutineCreator(false);
                          setShowRoutineManager(true);
                        }}
                        onCancel={() => {
                          setShowRoutineCreator(false);
                        }}
                      />
                    )}

                    {showWorkoutHistory && <WorkoutHistoryCalendar />}
                  </>
                )}

                {/* Tool invocations */}
                {message.parts.map((part, i) => {
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
            <div className="flex gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=coach&backgroundColor=b6e3f4" />
                <AvatarFallback>🏋️</AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-3 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 max-w-2xl mx-auto"
        >
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            aria-label="Chat message input"
          />
          <Button type="submit" size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
