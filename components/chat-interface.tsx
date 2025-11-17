"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useChat } from "@ai-sdk/react";

export function ChatInterface() {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat();

  const [inputValue, setInputValue] = useState("");
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
                className={`flex flex-col max-w-[70%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "assistant"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <p
                            key={`${message.id}-${i}`}
                            className="text-sm whitespace-pre-wrap"
                          >
                            {part.text}
                          </p>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            </div>
          ))}

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
