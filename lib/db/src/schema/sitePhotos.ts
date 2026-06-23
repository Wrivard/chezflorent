import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sitePhotosTable = pgTable("site_photos", {
  id: serial("id").primaryKey(),
  slot: text("slot").notNull().unique(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SitePhotoRow = typeof sitePhotosTable.$inferSelect;
