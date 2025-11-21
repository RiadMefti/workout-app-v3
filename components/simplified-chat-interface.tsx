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
import type { UIMessage } from "ai";
import type { AppTools } from "@/ai/tools";

export function SimplifiedChatInterface() {
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
            text: `Hello ${
              user?.firstName || "there"
            }! What would you like to do today?`,
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
                            if (
                              prompt.toLowerCase().includes("workout history")
                            ) {
                              setShowWorkoutHistory(true);
                              return;
                            }
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

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-4 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
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
