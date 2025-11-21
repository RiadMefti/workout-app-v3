import { SimplifiedWorkoutRecorder } from "@/components/simplified-workout-recorder";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function WorkoutPage() {
  const { user } = await withAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <SimplifiedWorkoutRecorder userId={user.id} />
    </div>
  );
}
