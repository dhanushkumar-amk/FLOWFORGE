import test from "node:test";
import assert from "node:assert/strict";

import { createAppBanner } from "@flowforge/shared";

test("shared utilities remain available to the web workspace", () => {
  assert.equal(createAppBanner("web"), "[flowforge:web]");
});
