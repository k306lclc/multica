import { app } from "electron";
import { readFile } from "fs/promises";
import { join } from "path";
import {
  DEFAULT_RUNTIME_CONFIG,
  parseRuntimeConfig,
  runtimeConfigFromDevEnv,
  type RuntimeConfig,
  type RuntimeConfigEnv,
  type RuntimeConfigResult,
} from "../shared/runtime-config";
import { DESKTOP_BUILD_IDENTITY } from "../shared/build-identity";

export async function loadRuntimeConfig(options: {
  isDev: boolean;
  env: RuntimeConfigEnv;
  configPath?: string;
  localFork?: boolean;
}): Promise<RuntimeConfigResult> {
  if (options.isDev) {
    try {
      return { ok: true, config: runtimeConfigFromDevEnv(options.env) };
    } catch (err) {
      return { ok: false, error: { message: errorMessage(err) } };
    }
  }

  const localFork = options.localFork ?? DESKTOP_BUILD_IDENTITY.localFork;
  const configPath = options.configPath ?? desktopConfigPath(localFork);
  try {
    const raw = await readFile(configPath, "utf-8");
    return { ok: true, config: parseRuntimeConfig(raw) };
  } catch (err) {
    if (isMissingFileError(err)) {
      if (localFork) {
        return {
          ok: false,
          error: {
            message: `Missing ${configPath}: Multica Cowork requires an explicit local runtime config`,
          },
        };
      }
      return { ok: true, config: { ...DEFAULT_RUNTIME_CONFIG } };
    }
    return {
      ok: false,
      error: {
        message: `Invalid ${configPath}: ${errorMessage(err)}`,
      },
    };
  }
}

export function desktopConfigPath(
  localFork = DESKTOP_BUILD_IDENTITY.localFork,
  home = app.getPath("home"),
): string {
  return join(
    home,
    ".multica",
    localFork ? "desktop-cowork.json" : "desktop.json",
  );
}

function isMissingFileError(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT",
  );
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export type { RuntimeConfig, RuntimeConfigResult };
