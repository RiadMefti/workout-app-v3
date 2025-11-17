import { withAuth, signOut } from "@workos-inc/authkit-nextjs";

export default async function HomePage() {
  // User is guaranteed to exist because of proxy.ts protection
  const { user } = await withAuth();

  return (
    <div>
      <p>Hello{user?.firstName && `, ${user.firstName}`}!</p>
      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}
