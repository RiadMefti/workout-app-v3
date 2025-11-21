import { SimplifiedRoutineManager } from "@/components/simplified-routine-manager";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function RoutinesPage() {
  const { user } = await withAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <SimplifiedRoutineManager userId={user.id} />
    </div>
  );
}
