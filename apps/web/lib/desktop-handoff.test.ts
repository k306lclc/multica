// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  desktopAuthUrl,
  desktopHandoffForPlatform,
  desktopHandoffFromOAuthState,
} from "./desktop-handoff";

describe("Desktop login handoff", () => {
  it("keeps the upstream protocol unchanged", () => {
    const handoff = desktopHandoffForPlatform("desktop");
    expect(handoff).toEqual({ platform: "desktop", protocol: "multica" });
    expect(desktopAuthUrl(handoff!, "a b")).toBe("multica://auth/callback?token=a%20b");
  });

  it("routes the local fork to its own protocol", () => {
    const handoff = desktopHandoffForPlatform("desktop-cowork");
    expect(handoff).toEqual({ platform: "desktop-cowork", protocol: "multica-cowork" });
    expect(desktopAuthUrl(handoff!, "a b")).toBe("multica-cowork://auth/callback?token=a%20b");
  });

  it("does not accept arbitrary schemes from the URL", () => {
    expect(desktopHandoffForPlatform("https://evil.example")).toBeNull();
    expect(desktopHandoffForPlatform(null)).toBeNull();
  });

  it("keeps the fixed fork identity through an OAuth state round trip", () => {
    expect(desktopHandoffFromOAuthState("next:/inbox,platform:desktop-cowork"))
      .toEqual({ platform: "desktop-cowork", protocol: "multica-cowork" });
    expect(desktopHandoffFromOAuthState("platform:https://evil.example")).toBeNull();
  });
});
