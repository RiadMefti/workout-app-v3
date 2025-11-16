import Link from "next/link";
import { getSignUpUrl, withAuth, signOut } from "@workos-inc/authkit-nextjs";

export default async function HomePage() {
  // Retrieves the user from the session or returns `null` if no user is signed in
  const { user } = await withAuth();

  // Get the URL to redirect the user to AuthKit to sign up
  const signUpUrl = await getSignUpUrl();

  if (!user) {
    return (
      <div>
        <a href="/login">Sign in</a>
        <Link href={signUpUrl}>Sign up</Link>
      </div>
    );
  }

  return (
    <div>
      <p>Hello{user.firstName && `, ${user.firstName}`}!</p>
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
