import { withAuth } from "@workos-inc/authkit-nextjs";
import { ChatInterface } from "@/components/chat-interface";

export default async function HomePage() {
  // User is guaranteed to exist because of proxy.ts protection
  const { user } = await withAuth();

  return (
    <ChatInterface
      userName={user?.firstName || undefined}
      userProfilePicture={user?.profilePictureUrl || undefined}
    />
  );
}
