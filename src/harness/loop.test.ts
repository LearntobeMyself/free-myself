import { describe, expect, it } from "vitest";
import { createWorkbenchRegistry, runAgentLoop } from "@/harness";

describe("mini harness", () => {
  it("runs echo_structured then assert_schema", async () => {
    const registry = createWorkbenchRegistry();
    const run = await runAgentLoop({
      goal: "smoke echo + schema",
      registry,
      persist: false,
      maxSteps: 6,
      policy: ({ lastTool, lastOk }) => {
        if (!lastTool) {
          return {
            type: "tool",
            toolName: "echo_structured",
            input: { message: "free-myself" },
          };
        }
        if (lastTool === "echo_structured" && lastOk) {
          return {
            type: "tool",
            toolName: "assert_schema",
            input: { value: { echo: "free-myself" } },
          };
        }
        if (lastTool === "assert_schema" && lastOk) {
          return { type: "stop", reason: "ok" };
        }
        return { type: "stop", reason: "failed" };
      },
    });

    expect(run.status).toBe("completed");
    expect(run.steps.some((s) => s.toolName === "echo_structured" && s.ok)).toBe(true);
    expect(run.steps.some((s) => s.toolName === "assert_schema" && s.ok)).toBe(true);
  });
});
