import assert from "node:assert/strict";
import { test } from "node:test";
import { splitMenuIntoColumns } from "./menuColumns.ts";

test("numbers eleven menu items as 1–5 down the left and 6–11 down the right", () => {
  const items = Array.from({ length: 11 }, (_, index) => `Drink ${index + 1}`);
  const [left, right] = splitMenuIntoColumns(items);
  assert.deepEqual(left.map(({ index }) => index + 1), [1, 2, 3, 4, 5]);
  assert.deepEqual(right.map(({ index }) => index + 1), [6, 7, 8, 9, 10, 11]);
  assert.deepEqual([...left, ...right].map(({ item }) => item), items);
});

test("splits even-sized menus equally without changing their reading order", () => {
  const [left, right] = splitMenuIntoColumns(Array.from({ length: 10 }, (_, index) => index + 1));
  assert.deepEqual(left.map(({ index }) => index), [0, 1, 2, 3, 4]);
  assert.deepEqual(right.map(({ index }) => index), [5, 6, 7, 8, 9]);
});

test("keeps empty and single-item menus in the left column", () => {
  assert.deepEqual(splitMenuIntoColumns([]), [[], []]);
  const [left, right] = splitMenuIntoColumns(["One drink"]);
  assert.deepEqual(left.map(({ index }) => index), [0]);
  assert.deepEqual(right, []);
});
