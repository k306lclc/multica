declare const __MULTICA_COWORK_BUILD__: boolean;

export interface DesktopBuildIdentity {
  localFork: boolean;
  appId: string;
  appName: string;
  protocol: string;
  handoffPlatform: string;
}

export function desktopBuildIdentity(localFork: boolean): DesktopBuildIdentity {
  return localFork
    ? {
        localFork: true,
        appId: "com.kevinlin.multica.cowork",
        appName: "Multica Cowork",
        protocol: "multica-cowork",
        handoffPlatform: "desktop-cowork",
      }
    : {
        localFork: false,
        appId: "ai.multica.desktop",
        appName: "Multica",
        protocol: "multica",
        handoffPlatform: "desktop",
      };
}

export const DESKTOP_BUILD_IDENTITY = desktopBuildIdentity(
  typeof __MULTICA_COWORK_BUILD__ !== "undefined" && __MULTICA_COWORK_BUILD__,
);
