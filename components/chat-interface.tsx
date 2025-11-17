"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

interface Message {
  id: string;
  content: string;
  sender: "coach" | "user";
  timestamp: Date;
}

export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "1",
      content:
        "Hey! I'm your personal fitness coach powered by AI. I'm here to help you achieve your fitness goals. What would you like to work on today?",
      sender: "coach",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isCoachTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsCoachTyping(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: currentInput,
          model: "gpt-4o-mini",
        }),
      });

      const result = await response.json();

      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: result.success && result.text
          ? result.text
          : "I'm sorry, I couldn't generate a response right now. Please try again.",
        sender: "coach",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, coachResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        sender: "coach",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsCoachTyping(false);
    }
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
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                {message.sender === "coach" ? (
                  <>
                    <AvatarImage src="/avatar.svg" />
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
                className={`flex flex-col max-w-[70%] ${
                  message.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender === "coach"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toTimeString().slice(0, 5)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isCoachTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=coach&backgroundColor=b6e3f4" />
                <AvatarFallback>🏋️</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <div className="rounded-lg px-4 py-3 bg-muted">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
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
