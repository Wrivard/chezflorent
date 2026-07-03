import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// The scrolling suppliers band on the Menu page is bespoke, single-instance
// content. Like the "À propos" and "Groupes" pages, the whole editable document
// is stored as one JSON row (validated at the API boundary by the generated Zod
// schema). `id` is a stable slug.
export const menuMarqueeTable = pgTable("menu_marquee", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type MenuMarqueeRow = typeof menuMarqueeTable.$inferSelect;
