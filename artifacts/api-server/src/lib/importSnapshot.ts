import {
  db,
  eventsTable,
  menuCategoriesTable,
  menuItemsTable,
  hoursTable,
  sitePhotosTable,
  groupContentTable,
  aboutContentTable,
  menuMarqueeTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { GROUP_CONTENT_ID } from "./groupContent";
import { ABOUT_CONTENT_ID } from "./aboutContent";
import { MENU_MARQUEE_ID } from "./menuMarquee";
import snapshotJson from "../data/contentSnapshot.json";

/**
 * A one-time content snapshot exported from the development database, bundled
 * into the server. Production has its own database (separate from dev) that only
 * the deployment can write to, so the local seed script never reaches it.
 * Importing this on startup makes a freshly published site show the exact
 * content we curated in development.
 *
 * The whole import runs inside a SINGLE transaction so it is:
 *  - Atomic / self-healing: if any step fails, nothing is committed and the next
 *    boot retries (no permanently half-populated database).
 *  - Idempotent: every step is gated on the target table (or singleton row)
 *    still being empty, so once the CMS is used in production this is a no-op and
 *    never overwrites edits made through the admin.
 *  - Race-safe under autoscale: if two instances boot against an empty DB, the
 *    loser hits a unique-constraint conflict and its transaction rolls back
 *    entirely, leaving the winner's complete snapshot intact.
 */
interface ContentSnapshot {
  menu: {
    slug: string;
    label: string;
    tagline: string;
    sortOrder: number;
    items: {
      name: string;
      price: string;
      description: string;
      image: string | null;
      sortOrder: number;
    }[];
  }[];
  events: {
    isoDate: string;
    title: string;
    description: string;
    tag: string;
    soldOut: boolean;
    sortOrder: number;
  }[];
  hours: {
    dayOfWeek: number;
    closed: boolean;
    openHour: number | null;
    closeHour: number | null;
  }[];
  sitePhotos: { slot: string; url: string; alt: string }[];
  groupContent: unknown | null;
  aboutContent: unknown | null;
  menuMarquee: { id: string; data: unknown } | null;
}

const snapshot = snapshotJson as unknown as ContentSnapshot;

export async function importContentSnapshot(): Promise<void> {
  try {
    const imported = await db.transaction(async (tx) => {
      const counts = {
        categories: 0,
        items: 0,
        events: 0,
        hours: 0,
        photos: 0,
        groupContent: false,
        aboutContent: false,
        menuMarquee: false,
      };

      // Menu (categories + their items).
      const existingCats = await tx
        .select({ id: menuCategoriesTable.id })
        .from(menuCategoriesTable);
      if (existingCats.length === 0) {
        for (let c = 0; c < snapshot.menu.length; c++) {
          const category = snapshot.menu[c];
          const [inserted] = await tx
            .insert(menuCategoriesTable)
            .values({
              slug: category.slug,
              label: category.label,
              tagline: category.tagline,
              sortOrder: category.sortOrder ?? c,
            })
            .returning();
          counts.categories += 1;
          if (category.items.length > 0) {
            await tx.insert(menuItemsTable).values(
              category.items.map((item, index) => ({
                categoryId: inserted.id,
                name: item.name,
                price: item.price,
                description: item.description,
                image: item.image,
                sortOrder: item.sortOrder ?? index,
              })),
            );
            counts.items += category.items.length;
          }
        }
      }

      // Events.
      const existingEvents = await tx.select({ id: eventsTable.id }).from(eventsTable);
      if (existingEvents.length === 0 && snapshot.events.length > 0) {
        await tx.insert(eventsTable).values(
          snapshot.events.map((e, index) => ({
            isoDate: e.isoDate,
            title: e.title,
            description: e.description,
            tag: e.tag,
            soldOut: e.soldOut,
            sortOrder: e.sortOrder ?? index,
          })),
        );
        counts.events = snapshot.events.length;
      }

      // Opening hours.
      const existingHours = await tx.select({ id: hoursTable.id }).from(hoursTable);
      if (existingHours.length === 0 && snapshot.hours.length > 0) {
        await tx.insert(hoursTable).values(
          snapshot.hours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            closed: h.closed,
            openHour: h.openHour,
            closeHour: h.closeHour,
          })),
        );
        counts.hours = snapshot.hours.length;
      }

      // Site photos.
      const existingPhotos = await tx.select({ id: sitePhotosTable.id }).from(sitePhotosTable);
      if (existingPhotos.length === 0 && snapshot.sitePhotos.length > 0) {
        await tx.insert(sitePhotosTable).values(
          snapshot.sitePhotos.map((p) => ({ slot: p.slot, url: p.url, alt: p.alt })),
        );
        counts.photos = snapshot.sitePhotos.length;
      }

      // Singleton documents (Groupes / À propos / Menu marquee).
      if (snapshot.groupContent) {
        const [existing] = await tx
          .select({ id: groupContentTable.id })
          .from(groupContentTable)
          .where(eq(groupContentTable.id, GROUP_CONTENT_ID));
        if (!existing) {
          await tx
            .insert(groupContentTable)
            .values({ id: GROUP_CONTENT_ID, data: snapshot.groupContent })
            .onConflictDoNothing({ target: groupContentTable.id });
          counts.groupContent = true;
        }
      }

      if (snapshot.aboutContent) {
        const [existing] = await tx
          .select({ id: aboutContentTable.id })
          .from(aboutContentTable)
          .where(eq(aboutContentTable.id, ABOUT_CONTENT_ID));
        if (!existing) {
          await tx
            .insert(aboutContentTable)
            .values({ id: ABOUT_CONTENT_ID, data: snapshot.aboutContent })
            .onConflictDoNothing({ target: aboutContentTable.id });
          counts.aboutContent = true;
        }
      }

      if (snapshot.menuMarquee) {
        const [existing] = await tx
          .select({ id: menuMarqueeTable.id })
          .from(menuMarqueeTable)
          .where(eq(menuMarqueeTable.id, MENU_MARQUEE_ID));
        if (!existing) {
          await tx
            .insert(menuMarqueeTable)
            .values({ id: MENU_MARQUEE_ID, data: snapshot.menuMarquee.data })
            .onConflictDoNothing({ target: menuMarqueeTable.id });
          counts.menuMarquee = true;
        }
      }

      return counts;
    });

    const didWork =
      imported.categories > 0 ||
      imported.events > 0 ||
      imported.hours > 0 ||
      imported.photos > 0 ||
      imported.groupContent ||
      imported.aboutContent ||
      imported.menuMarquee;
    if (didWork) {
      logger.info(imported, "Content snapshot imported into empty database");
    }
  } catch (err) {
    logger.error(
      { err },
      "Content snapshot import failed and was rolled back; will retry on next boot",
    );
  }
}
