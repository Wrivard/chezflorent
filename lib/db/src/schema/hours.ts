import {
  pgTable,
  serial,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const hoursTable = pgTable("hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull().unique(),
  closed: boolean("closed").notNull().default(false),
  openHour: real("open_hour"),
  closeHour: real("close_hour"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type HoursRow = typeof hoursTable.$inferSelect;
