import { ChatInterface } from "@/components/chat-interface-compact";
import { ErrorBoundary } from "@/components/error-boundary";

export default function HomePage() {
  return (
    <ErrorBoundary>
      <ChatInterface />
    </ErrorBoundary>
  );
}
