import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@workos-inc/node";

export async function syncUser(workosUser: User) {
  // Check if user exists by ID
  const existingUserById = await getUserById(workosUser.id);

  if (existingUserById) {
    // User exists with this ID, do nothing
    return;
  }

  // Check if user exists by email (with different ID)
  const existingUserByEmail = await getUserByEmail(workosUser.email);

  if (existingUserByEmail) {
    // Email exists but different ID - delete old record and create new one
    await db.delete(users).where(eq(users.email, workosUser.email));
  }

  // Create new user record
  await db.insert(users).values({
    id: workosUser.id,
    email: workosUser.email,
    firstName: workosUser.firstName ?? null,
    lastName: workosUser.lastName ?? null,
    profilePictureUrl: workosUser.profilePictureUrl ?? null,
    createdAt: workosUser.createdAt,
  });
}

export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}
