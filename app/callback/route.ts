import { handleAuth } from "@workos-inc/authkit-nextjs";
import { syncUser } from "@/lib/user-sync";

export const GET = handleAuth({
  async onSuccess({ user }) {
    // Sync user to database on successful authentication
    await syncUser(user);
  },
});
