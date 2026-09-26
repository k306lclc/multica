"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWSEvent } from "@multica/core/realtime";
import { isRuntimeUsableForUser } from "@multica/core/runtimes";
import {
  runtimeKeys,
  runtimeListOptions,
} from "@multica/core/runtimes/queries";
import type { AgentRuntime } from "@multica/core/types";

/**
 * Step 3's runtime data layer, shared by Desktop (`StepRuntimeConnect`)
 * and Web (`StepPlatformFork`):
 *
 *   - Polls every 2s while the list is empty so the UI flips to
 *     "found" the moment a runtime registers.
 *   - `daemon:register` WS event triggers an instant refetch — no
 *     polling lag for online users.
 *   - Auto-selects online first, falls back to the first runtime.
 *     A manual selection survives refetches while that runtime remains usable.
 *   - Includes workspace-shared machines, but never offers another member's
 *     private or ownerless runtime as an execution target.
 */
export function useRuntimePicker(wsId: string, currentUserId: string, wsSlug?: string): {
  runtimes: AgentRuntime[];
  selected: AgentRuntime | null;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  hasRuntimes: boolean;
} {
  const qc = useQueryClient();

  const { data: listedRuntimes = [] } = useQuery({
    ...runtimeListOptions(wsId, undefined, wsSlug),
    refetchInterval: (q) =>
      q.state.data?.some((runtime) =>
        isRuntimeUsableForUser(runtime, currentUserId),
      )
        ? false
        : 2000,
  });
  const runtimes = useMemo(
    () =>
      listedRuntimes.filter((runtime) =>
        isRuntimeUsableForUser(runtime, currentUserId),
      ),
    [listedRuntimes, currentUserId],
  );

  const handleDaemonEvent = useCallback(() => {
    qc.invalidateQueries({ queryKey: runtimeKeys.all(wsId) });
  }, [qc, wsId]);
  useWSEvent("daemon:register", handleDaemonEvent);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId && runtimes.some((runtime) => runtime.id === selectedId)) return;
    const preferred =
      runtimes.find((r) => r.status === "online") ?? runtimes[0];
    setSelectedId(preferred?.id ?? null);
  }, [runtimes, selectedId]);

  const selected = runtimes.find((r) => r.id === selectedId) ?? null;

  return {
    runtimes,
    selected,
    selectedId,
    setSelectedId,
    hasRuntimes: runtimes.length > 0,
  };
}
