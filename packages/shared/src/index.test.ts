import test from "node:test";
import assert from "node:assert/strict";

import { createAppBanner } from "./index";

test("createAppBanner formats the workspace target", () => {
  assert.equal(createAppBanner("web"), "[flowforge:web]");
  assert.equal(createAppBanner("api"), "[flowforge:api]");
});
