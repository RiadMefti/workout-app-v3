import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// User table synced with WorkOS
export const users = pgTable("users", {
  id: text("id").primaryKey(), // WorkOS user ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePictureUrl: text("profile_picture_url"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
});
