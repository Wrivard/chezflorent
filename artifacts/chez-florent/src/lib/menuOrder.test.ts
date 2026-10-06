import assert from "node:assert/strict";
import { test } from "node:test";
import { moveMenuItem, sameMenuOrder } from "./menuOrder.ts";

const items = [{ id: 1, name: "A" }, { id: 2, name: "B" }, { id: 3, name: "C" }];
test("moves down without mutating items or content", () => {
  const next = moveMenuItem(items, 1, 3);
  assert.deepEqual(next.map((item) => item.id), [2, 3, 1]);
  assert.deepEqual(items.map((item) => item.id), [1, 2, 3]);
  assert.equal(next[2], items[0]);
});
test("moves up and supports adjacent keyboard moves", () => {
  assert.deepEqual(moveMenuItem(items, 3, 1).map((item) => item.id), [3, 1, 2]);
  assert.deepEqual(moveMenuItem(items, 2, 1).map((item) => item.id), [2, 1, 3]);
});
test("same position, outside-category IDs, empty and single-item moves are no-ops", () => {
  assert.equal(moveMenuItem(items, 1, 1), items);
  assert.equal(moveMenuItem(items, 10, 1), items);
  assert.equal(moveMenuItem(items, 1, 10), items);
  assert.deepEqual(moveMenuItem([], 1, 2), []);
  assert.deepEqual(moveMenuItem([{ id: 1 }], 1, 2), [{ id: 1 }]);
});
test("compares ordering by ID and membership, not mutable content", () => {
  assert(sameMenuOrder(items, items.map((item) => ({ ...item, name: "Changed" }))));
  assert(!sameMenuOrder(items, [...items].reverse()));
  assert(!sameMenuOrder(items, items.slice(1)));
  assert(sameMenuOrder([], []));
});
