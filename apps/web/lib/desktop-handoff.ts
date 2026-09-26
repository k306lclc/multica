export interface DesktopHandoff {
  platform: "desktop" | "desktop-cowork";
  protocol: "multica" | "multica-cowork";
}

const UPSTREAM_HANDOFF: DesktopHandoff = { platform: "desktop", protocol: "multica" };
const COWORK_HANDOFF: DesktopHandoff = {
  platform: "desktop-cowork",
  protocol: "multica-cowork",
};

export function desktopHandoffForPlatform(platform: string | null): DesktopHandoff | null {
  if (platform === "desktop") return UPSTREAM_HANDOFF;
  if (platform === "desktop-cowork") return COWORK_HANDOFF;
  return null;
}

export function desktopHandoffFromOAuthState(state: string | null): DesktopHandoff | null {
  const parts = (state ?? "").split(",");
  if (parts.includes("platform:desktop-cowork")) return COWORK_HANDOFF;
  if (parts.includes("platform:desktop")) return UPSTREAM_HANDOFF;
  return null;
}

export function desktopAuthUrl(handoff: DesktopHandoff, token: string): string {
  return `${handoff.protocol}://auth/callback?token=${encodeURIComponent(token)}`;
}
