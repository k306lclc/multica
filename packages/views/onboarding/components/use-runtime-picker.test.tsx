import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@multica/core/api";
import type { AgentRuntime } from "@multica/core/types";
import { useRuntimePicker } from "./use-runtime-picker";

vi.mock("@multica/core/api", () => ({
  api: { listRuntimes: vi.fn() },
}));
vi.mock("@multica/core/realtime", () => ({
  useWSEvent: vi.fn(),
}));

function runtime(
  id: string,
  ownerId: string | null,
  visibility: "private" | "public",
): AgentRuntime {
  return {
    id,
    owner_id: ownerId,
    visibility,
    status: "online",
  } as AgentRuntime;
}

describe("useRuntimePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("offers another member's public Mini without exposing private or ownerless runtimes", async () => {
    vi.mocked(api.listRuntimes).mockResolvedValue([
      runtime("other-private", "assistant", "private"),
      runtime("mini-public", "assistant", "public"),
      runtime("ownerless", null, "public"),
      runtime("my-macbook", "owner", "private"),
    ]);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () => useRuntimePicker("workspace", "owner", "kevin-cowork"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.runtimes.map((rt) => rt.id)).toEqual([
        "mini-public",
        "my-macbook",
      ]);
      expect(result.current.selectedId).toBe("mini-public");
    });
    expect(api.listRuntimes).toHaveBeenCalledWith(
      { workspace_id: "workspace", owner: undefined },
      "kevin-cowork",
    );
  });
});
