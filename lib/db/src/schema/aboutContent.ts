import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// The "À propos" page is bespoke, single-instance content. Like the Groupes
// page, the whole editable document is stored as one JSON row (validated at the
// API boundary by the generated Zod schema). `id` is a stable slug.
export const aboutContentTable = pgTable("about_content", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type AboutContentRow = typeof aboutContentTable.$inferSelect;
