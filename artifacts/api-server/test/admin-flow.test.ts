import { unlink } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import {
  db,
  pool,
  adminUsersTable,
  eventsTable,
  menuCategoriesTable,
  menuItemsTable,
  hoursTable,
  sitePhotosTable,
} from "@workspace/db";
import app from "../src/app";
import { hashPassword } from "../src/lib/auth";
import { uploadsDir } from "../src/lib/storage";

// These integration tests drive the real Express app against the real database
// (the same code path the /admin panel and public site use). Everything they
// create is namespaced with a unique suffix and cleaned up in afterAll so the
// suite is self-contained and does not depend on, or clobber, seed data.

const SUFFIX = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const TEST_EMAIL = `vitest-admin-${SUFFIX}@chez-florent.test`;
const TEST_PASSWORD = "vitest-secret-password";
const TEST_DAY_OF_WEEK = 99; // out of the normal 0-6 range to avoid clobbering real hours
const TEST_SLOT = `vitest-slot-${SUFFIX}`;

// 1x1 transparent PNG — a real image so the upload magic-byte check passes.
const PNG_FIXTURE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

let agent: ReturnType<typeof request.agent>;
let categoryId: number;
const createdEventIds: number[] = [];
const createdItemIds: number[] = [];
const uploadedFiles: string[] = [];

beforeAll(async () => {
  await db.insert(adminUsersTable).values({
    email: TEST_EMAIL,
    passwordHash: hashPassword(TEST_PASSWORD),
  });

  const [category] = await db
    .insert(menuCategoriesTable)
    .values({
      slug: `vitest-cat-${SUFFIX}`,
      label: "Catégorie de test",
      tagline: "",
      sortOrder: 999,
    })
    .returning();
  categoryId = category.id;

  await db.insert(sitePhotosTable).values({
    slot: TEST_SLOT,
    url: "/images/original.jpg",
    alt: "Photo originale",
  });

  await db.insert(hoursTable).values({
    dayOfWeek: TEST_DAY_OF_WEEK,
    closed: true,
    openHour: null,
    closeHour: null,
  });

  // A logged-in agent that carries the signed session cookie across requests,
  // exactly like the browser does for the admin panel.
  agent = request.agent(app);
});

afterAll(async () => {
  for (const id of createdItemIds) {
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
  }
  for (const id of createdEventIds) {
    await db.delete(eventsTable).where(eq(eventsTable.id, id));
  }
  await db.delete(menuCategoriesTable).where(eq(menuCategoriesTable.id, categoryId));
  await db.delete(sitePhotosTable).where(eq(sitePhotosTable.slot, TEST_SLOT));
  await db.delete(hoursTable).where(eq(hoursTable.dayOfWeek, TEST_DAY_OF_WEEK));
  await db.delete(adminUsersTable).where(eq(adminUsersTable.email, TEST_EMAIL));

  for (const file of uploadedFiles) {
    await unlink(file).catch(() => {});
  }

  await pool.end();
});

describe("auth guard — unauthenticated mutations are rejected", () => {
  it("rejects creating an event without a session", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ isoDate: "2026-07-01", title: "Hack" });
    expect(res.status).toBe(401);
  });

  it("rejects updating an event without a session", async () => {
    const res = await request(app)
      .patch("/api/events/1")
      .send({ title: "Hack" });
    expect(res.status).toBe(401);
  });

  it("rejects deleting an event without a session", async () => {
    const res = await request(app).delete("/api/events/1");
    expect(res.status).toBe(401);
  });

  it("rejects creating a menu item without a session", async () => {
    const res = await request(app)
      .post("/api/menu/items")
      .send({ categoryId: 1, name: "Hack" });
    expect(res.status).toBe(401);
  });

  it("rejects updating a menu item without a session", async () => {
    const res = await request(app)
      .patch("/api/menu/items/1")
      .send({ name: "Hack" });
    expect(res.status).toBe(401);
  });

  it("rejects updating hours without a session", async () => {
    const res = await request(app)
      .patch("/api/hours/2")
      .send({ closed: true });
    expect(res.status).toBe(401);
  });

  it("rejects updating a photo without a session", async () => {
    const res = await request(app)
      .patch("/api/photos/hero")
      .send({ url: "/images/hack.jpg" });
    expect(res.status).toBe(401);
  });

  it("rejects uploading an image without a session", async () => {
    const res = await request(app)
      .post("/api/upload")
      .attach("file", PNG_FIXTURE, { filename: "x.png", contentType: "image/png" });
    expect(res.status).toBe(401);
  });
});

describe("login flow", () => {
  it("rejects wrong credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("logs in with valid credentials and exposes the session", async () => {
    const login = await agent
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(login.status).toBe(200);
    expect(login.body.email).toBe(TEST_EMAIL);

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(TEST_EMAIL);
  });
});

describe("events editing flow", () => {
  let eventId: number;

  it("creates an event", async () => {
    const res = await agent.post("/api/events").send({
      isoDate: "2026-08-15",
      title: "Soirée de test",
      description: "Créée par les tests automatisés.",
      tag: "Test · 20h",
      soldOut: false,
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Soirée de test");
    eventId = res.body.id;
    createdEventIds.push(eventId);
  });

  it("shows the new event on the public site", async () => {
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    const found = res.body.find((e: { id: number }) => e.id === eventId);
    expect(found).toBeDefined();
    expect(found.title).toBe("Soirée de test");
  });

  it("edits the event and reflects the change publicly", async () => {
    const patch = await agent
      .patch(`/api/events/${eventId}`)
      .send({ title: "Soirée de test (modifiée)", soldOut: true });
    expect(patch.status).toBe(200);
    expect(patch.body.title).toBe("Soirée de test (modifiée)");
    expect(patch.body.soldOut).toBe(true);

    const publicRes = await request(app).get("/api/events");
    const found = publicRes.body.find((e: { id: number }) => e.id === eventId);
    expect(found.title).toBe("Soirée de test (modifiée)");
    expect(found.soldOut).toBe(true);
  });

  it("deletes the event and removes it from the public site", async () => {
    const del = await agent.delete(`/api/events/${eventId}`);
    expect(del.status).toBe(204);

    const publicRes = await request(app).get("/api/events");
    const found = publicRes.body.find((e: { id: number }) => e.id === eventId);
    expect(found).toBeUndefined();
    // Already gone; nothing left to clean up for this id.
    createdEventIds.length = 0;
  });
});

describe("menu editing flow", () => {
  let itemId: number;

  it("creates a menu item", async () => {
    const res = await agent.post("/api/menu/items").send({
      categoryId,
      name: "Plat de test",
      price: "12,95 $",
      description: "Description initiale.",
    });
    expect(res.status).toBe(201);
    itemId = res.body.id;
    createdItemIds.push(itemId);
  });

  it("edits the menu item and reflects it in the public menu", async () => {
    const patch = await agent
      .patch(`/api/menu/items/${itemId}`)
      .send({ name: "Plat de test (modifié)", price: "14,95 $" });
    expect(patch.status).toBe(200);
    expect(patch.body.name).toBe("Plat de test (modifié)");

    const menu = await request(app).get("/api/menu");
    expect(menu.status).toBe(200);
    const category = menu.body.find((c: { id: number }) => c.id === categoryId);
    expect(category).toBeDefined();
    const item = category.items.find((i: { id: number }) => i.id === itemId);
    expect(item.name).toBe("Plat de test (modifié)");
    expect(item.price).toBe("14,95 $");
  });
});

describe("hours editing flow", () => {
  it("updates the hours for a day", async () => {
    const res = await agent
      .patch(`/api/hours/${TEST_DAY_OF_WEEK}`)
      .send({ closed: false, openHour: 16, closeHour: 23 });
    expect(res.status).toBe(200);
    expect(res.body.closed).toBe(false);
    expect(res.body.openHour).toBe(16);

    const list = await request(app).get("/api/hours");
    const day = list.body.find(
      (h: { dayOfWeek: number }) => h.dayOfWeek === TEST_DAY_OF_WEEK,
    );
    expect(day.openHour).toBe(16);
    expect(day.closeHour).toBe(23);
  });
});

describe("photos & upload flow", () => {
  it("updates a photo slot", async () => {
    const res = await agent
      .patch(`/api/photos/${TEST_SLOT}`)
      .send({ url: "/images/updated.jpg", alt: "Photo mise à jour" });
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("/images/updated.jpg");

    const list = await request(app).get("/api/photos");
    const photo = list.body.find((p: { slot: string }) => p.slot === TEST_SLOT);
    expect(photo.url).toBe("/images/updated.jpg");
    expect(photo.alt).toBe("Photo mise à jour");
  });

  it("uploads a valid image and returns a url", async () => {
    const res = await agent
      .post("/api/upload")
      .attach("file", PNG_FIXTURE, {
        filename: "test.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(201);
    expect(typeof res.body.url).toBe("string");
    expect(res.body.url).toContain("/api/uploads/");
    uploadedFiles.push(path.join(uploadsDir(), path.basename(res.body.url)));
  });

  it("rejects a non-image upload", async () => {
    const res = await agent
      .post("/api/upload")
      .attach("file", Buffer.from("this is not an image"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
  });
});
