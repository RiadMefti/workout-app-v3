import { RoutineCreationWizard } from "@/components/routine-creation-wizard";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function CreateRoutinePage() {
  const { user } = await withAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <RoutineCreationWizard userId={user.id} />
    </div>
  );
}
