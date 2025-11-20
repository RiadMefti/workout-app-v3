import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  real,
} from "drizzle-orm/pg-core";

// =============================================================================
// USERS
// =============================================================================

// User table synced with WorkOS
export const users = pgTable("users", {
  id: text("id").primaryKey(), // WorkOS user ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePictureUrl: text("profile_picture_url"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
});

// =============================================================================
// WORKOUT ROUTINES (The Plan)
// =============================================================================

// Main workout routine/program (e.g., "5-Day PPL", "Upper/Lower Split")
export const workoutRoutines = pgTable("workout_routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Individual workout days within a routine (e.g., "Push Day", "Leg Day")
export const workoutDays = pgTable("workout_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id")
    .notNull()
    .references(() => workoutRoutines.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dayOrder: integer("day_order").notNull(), // 1, 2, 3...
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Exercises within a workout day (e.g., "Barbell Squat", "Bench Press")
export const dayExercises = pgTable("day_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => workoutDays.id, { onDelete: "cascade" }),
  exerciseName: text("exercise_name").notNull(), // Any exercise name
  exerciseOrder: integer("exercise_order").notNull(), // Order within the workout
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Planned sets for each exercise (multiple rows per exercise for different weights/reps)
export const exerciseSets = pgTable("exercise_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => dayExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(), // 1, 2, 3...
  targetReps: integer("target_reps").notNull(), // Target number of reps
  targetWeight: real("target_weight"), // Target weight in lbs/kg (nullable for bodyweight)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =============================================================================
// COMPLETED WORKOUTS (The Reality)
// =============================================================================

// Actual workout sessions completed by the user
export const completedWorkouts = pgTable("completed_workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Optional references to planned routine/day (can be null for ad-hoc workouts)
  routineId: uuid("routine_id").references(() => workoutRoutines.id, {
    onDelete: "set null",
  }),
  dayId: uuid("day_id").references(() => workoutDays.id, {
    onDelete: "set null",
  }),
  workoutName: text("workout_name").notNull(), // Name of the workout (e.g., "Leg Day")
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Individual exercises completed in a workout
export const completedExercises = pgTable("completed_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => completedWorkouts.id, { onDelete: "cascade" }),
  exerciseName: text("exercise_name").notNull(), // Store the actual exercise name
  exerciseOrder: integer("exercise_order").notNull(), // Order within the workout
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Individual sets completed (multiple rows per exercise for different weights/reps)
export const completedSets = pgTable("completed_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => completedExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(), // 1, 2, 3...
  reps: integer("reps").notNull(), // Actual reps completed
  weight: real("weight"), // Actual weight used (nullable for bodyweight)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
