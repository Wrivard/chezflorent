import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { mockupPreviewPlugin } from "../mockupPreviewPlugin.ts";

test("discovers nested TSX mockups but excludes private and unrelated files", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-preview-"));
  try {
    for (const relative of [
      "First.tsx",
      "nested/Second.tsx",
      "_private/Hidden.tsx",
      "nested/_private/Hidden.tsx",
      "nested/_Helper.tsx",
      "notes.ts",
    ]) {
      const file = path.join(root, "src/components/mockups", relative);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, "export default function Mockup() {}");
    }
    const plugin = mockupPreviewPlugin();
    // Run the same discovery hooks used by the Vite build without a server.
    plugin.configResolved({ root });
    await plugin.buildStart();
    const source = await readFile(
      path.join(root, "src/.generated/mockup-components.ts"),
      "utf8",
    );
    assert.match(source, /"\.\/components\/mockups\/First\.tsx"/);
    assert.match(source, /"\.\/components\/mockups\/nested\/Second\.tsx"/);
    assert.doesNotMatch(source, /Hidden|Helper|notes/);
    assert.equal((source.match(/=> import\(/g) ?? []).length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generates an empty module map when no mockup directory exists", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-preview-"));
  try {
    const plugin = mockupPreviewPlugin();
    plugin.configResolved({ root });
    await plugin.buildStart();
    const source = await readFile(
      path.join(root, "src/.generated/mockup-components.ts"),
      "utf8",
    );
    assert.match(source, /export const modules: ModuleMap = \{\n\n\};/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
