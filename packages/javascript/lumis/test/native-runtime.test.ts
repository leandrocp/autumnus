import { describe, expect, it } from "vitest";

import { loadNativeBinding } from "../src/native-binding.js";

describe("native runtime", () => {
  it.runIf(process.env.LUMIS_REQUIRE_NATIVE === "1")(
    "loads the platform addon when required by native CI",
    () => {
      expect(loadNativeBinding()?.runtimeKind()).toBe("native");
    },
  );
});
