import test from "node:test";
import assert from "node:assert/strict";

import { createAppBanner } from "@flowforge/shared";

test("api can consume shared workspace utilities", () => {
  assert.equal(createAppBanner("api"), "[flowforge:api]");
});
