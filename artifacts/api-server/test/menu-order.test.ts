import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { db, pool, adminUsersTable, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { hashPassword } from "../src/lib/auth";

// Avoid public GET's unrelated Untappd import. Admit only uniquely named test
// categories in this isolated test module, never in the running application.
vi.mock("../src/lib/untappdSync", async (importOriginal) => {
  const original = await importOriginal<typeof import("../src/lib/untappdSync")>();
  return { ...original, PROTECTED_SLUGS: [...original.PROTECTED_SLUGS],
    autoSyncUntappdMenu: vi.fn(async () => false) };
});
import app from "../src/app";
import { PROTECTED_SLUGS } from "../src/lib/untappdSync";

const suffix = `order-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = `${suffix}@example.test`;
const password = "order-test-not-a-real-password";
let categoryId: number;
let otherCategoryId: number;
let emptyCategoryId: number;
let singleCategoryId: number;
let singleItemId: number;
let ids: number[] = [];
let outsiderId: number;
let agent: ReturnType<typeof request.agent>;
const categoryIds: number[] = [];

beforeAll(async () => {
  await db.insert(adminUsersTable).values({ email, passwordHash: hashPassword(password) });
  for (const slug of [suffix, `${suffix}-other`, `${suffix}-empty`, `${suffix}-single`]) {
    const [category] = await db.insert(menuCategoriesTable)
      .values({ slug, label: slug, sortOrder: 999 }).returning();
    categoryIds.push(category.id);
  }
  [categoryId, otherCategoryId, emptyCategoryId, singleCategoryId] = categoryIds;
  PROTECTED_SLUGS.push(suffix, `${suffix}-empty`, `${suffix}-single`);
  const items = await db.insert(menuItemsTable).values(
    ["A", "B", "C"].map((name, index) => ({
      categoryId, name: `${suffix}-${name}`, price: `${index + 10} $`,
      description: `Description ${name}`, image: `/images/${name}.jpg`, sortOrder: index * 3,
    }))
  ).returning();
  ids = items.map((item) => item.id);
  const [outsider] = await db.insert(menuItemsTable).values({ categoryId: otherCategoryId, name: "Other" }).returning();
  outsiderId = outsider.id;
  const [single] = await db.insert(menuItemsTable).values({ categoryId: singleCategoryId, name: "Single" }).returning();
  singleItemId = single.id;
  agent = request.agent(app);
  expect((await agent.post("/api/auth/login").send({ email, password })).status).toBe(200);
});

beforeEach(async () => {
  for (let index = 0; index < ids.length; index++) {
    await db.update(menuItemsTable).set({ sortOrder: index * 3 }).where(eq(menuItemsTable.id, ids[index]));
  }
});

afterAll(async () => {
  for (const id of categoryIds) await db.delete(menuCategoriesTable).where(eq(menuCategoriesTable.id, id));
  await db.delete(adminUsersTable).where(eq(adminUsersTable.email, email));
  await pool.end();
});

const endpoint = () => `/api/menu/categories/${categoryId}/items/order`;
async function snapshot() {
  return db.select().from(menuItemsTable).where(eq(menuItemsTable.categoryId, categoryId))
    .orderBy(menuItemsTable.sortOrder, menuItemsTable.id);
}

describe("atomic menu item reordering", () => {
  it("requires an authenticated admin", async () => {
    expect((await request(app).put(endpoint()).send({ itemIds: ids, expectedItemIds: ids })).status).toBe(401);
  });
  it("persists a full permutation publicly without changing content", async () => {
    const before = await snapshot();
    const reverse = [...ids].reverse();
    const response = await agent.put(endpoint()).send({ itemIds: reverse, expectedItemIds: ids });
    expect(response.status).toBe(200);
    expect(response.body.items.map((item: { id: number }) => item.id)).toEqual(reverse);
    const after = await snapshot();
    expect(after.map((item) => item.sortOrder)).toEqual([0, 1, 2]);
    for (const item of after) {
      const original = before.find((entry) => entry.id === item.id)!;
      for (const key of ["name", "price", "description", "image", "categoryId", "createdAt"] as const) {
        expect(item[key]).toEqual(original[key]);
      }
    }
    const publicMenu = await request(app).get("/api/menu");
    expect(publicMenu.body.find((category: { id: number }) => category.id === categoryId).items.map((item: { id: number }) => item.id)).toEqual(reverse);
    expect((await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, outsiderId)))[0].sortOrder).toBe(0);
  });
  it.each([
    ["duplicates", () => [ids[0], ids[0], ids[2]], 400],
    ["missing item", () => ids.slice(0, 2), 409],
    ["outside-category item", () => [ids[0], ids[1], outsiderId], 409],
    ["nonexistent item", () => [ids[0], ids[1], 2147483647], 409],
    ["fractional item", () => [ids[0], ids[1], 1.5], 400],
    ["negative item", () => [ids[0], ids[1], -1], 400],
  ] as const)("rejects %s without any partial updates", async (_name, invalidIds, status) => {
    const before = await snapshot();
    const response = await agent.put(endpoint()).send({ itemIds: invalidIds(), expectedItemIds: ids });
    expect(response.status).toBe(status);
    expect(await snapshot()).toEqual(before);
  });
  it("rejects stale order, duplicate baseline and malformed bodies", async () => {
    const before = await snapshot();
    expect((await agent.put(endpoint()).send({ itemIds: ids, expectedItemIds: [...ids].reverse() })).status).toBe(409);
    expect((await agent.put(endpoint()).send({ itemIds: ids, expectedItemIds: [ids[0], ids[0], ids[2]] })).status).toBe(400);
    expect((await agent.put(endpoint()).send({ itemIds: "bad" })).status).toBe(400);
    expect((await agent.put(`/api/menu/categories/1.5/items/order`).send({ itemIds: [], expectedItemIds: [] })).status).toBe(400);
    expect(await snapshot()).toEqual(before);
  });
  it("rejects stale membership after a new item is added", async () => {
    const [newItem] = await db.insert(menuItemsTable).values({ categoryId, name: `${suffix}-new`, sortOrder: 99 }).returning();
    try {
      const before = await snapshot();
      expect((await agent.put(endpoint()).send({ itemIds: [...ids].reverse(), expectedItemIds: ids })).status).toBe(409);
      expect(await snapshot()).toEqual(before);
    } finally {
      await db.delete(menuItemsTable).where(eq(menuItemsTable.id, newItem.id));
    }
  });
  it("serializes simultaneous reorders, rejecting the stale second writer", async () => {
    const responses = await Promise.all([
      agent.put(endpoint()).send({ itemIds: [...ids].reverse(), expectedItemIds: ids }),
      agent.put(endpoint()).send({ itemIds: [ids[1], ids[0], ids[2]], expectedItemIds: ids }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    const winner = responses.find((response) => response.status === 200)!;
    expect((await snapshot()).map((item) => item.id)).toEqual(winner.body.items.map((item: { id: number }) => item.id));
  });
  it("handles empty, single and unchanged lists", async () => {
    expect((await agent.put(`/api/menu/categories/${emptyCategoryId}/items/order`).send({ itemIds: [], expectedItemIds: [] })).status).toBe(200);
    expect((await agent.put(`/api/menu/categories/${singleCategoryId}/items/order`).send({ itemIds: [singleItemId], expectedItemIds: [singleItemId] })).status).toBe(200);
    expect((await agent.put(endpoint()).send({ itemIds: ids, expectedItemIds: ids })).status).toBe(200);
  });
  it("leaves imported categories untouched and reports nonexistent categories", async () => {
    expect((await agent.put(`/api/menu/categories/${otherCategoryId}/items/order`).send({ itemIds: [outsiderId], expectedItemIds: [outsiderId] })).status).toBe(403);
    expect((await agent.put("/api/menu/categories/2147483647/items/order").send({ itemIds: [], expectedItemIds: [] })).status).toBe(404);
  });
  it("preserves append, edit, and delete behavior after reorder", async () => {
    expect((await agent.put(endpoint()).send({ itemIds: [...ids].reverse(), expectedItemIds: ids })).status).toBe(200);
    const created = await agent.post("/api/menu/items").send({ categoryId, name: `${suffix}-appended`, sortOrder: 3 });
    expect(created.status).toBe(201);
    try {
      expect((await snapshot()).at(-1)?.id).toBe(created.body.id);
      expect((await agent.patch(`/api/menu/items/${ids[0]}`).send({ description: "Edited description" })).status).toBe(200);
      expect((await snapshot()).map((item) => item.id)).toEqual([...ids].reverse().concat(created.body.id));
      expect((await agent.delete(`/api/menu/items/${created.body.id}`)).status).toBe(204);
      expect((await snapshot()).map((item) => item.id)).toEqual([...ids].reverse());
      await agent.patch(`/api/menu/items/${ids[0]}`).send({ description: "Description A" });
    } finally {
      await db.delete(menuItemsTable).where(eq(menuItemsTable.id, created.body.id));
    }
  });
});
