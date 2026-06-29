import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// The "Groupes" page is bespoke, single-instance content. Rather than many
// tables, the whole editable document is stored as one JSON row (validated at
// the API boundary by the generated Zod schema). `id` is a stable slug.
export const groupContentTable = pgTable("group_content", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type GroupContentRow = typeof groupContentTable.$inferSelect;
