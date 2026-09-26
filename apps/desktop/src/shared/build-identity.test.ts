// @vitest-environment node
import { describe, expect, it } from "vitest";
import { desktopBuildIdentity } from "./build-identity";

describe("Desktop build identity", () => {
  it("preserves the upstream identity by default", () => {
    expect(desktopBuildIdentity(false)).toEqual({
      localFork: false,
      appId: "ai.multica.desktop",
      appName: "Multica",
      protocol: "multica",
      handoffPlatform: "desktop",
    });
  });

  it("gives the local fork a separate name and deep-link protocol", () => {
    expect(desktopBuildIdentity(true)).toEqual({
      localFork: true,
      appId: "com.kevinlin.multica.cowork",
      appName: "Multica Cowork",
      protocol: "multica-cowork",
      handoffPlatform: "desktop-cowork",
    });
  });
});
