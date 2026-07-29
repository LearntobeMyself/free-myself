import { randomUUID } from "node:crypto";
import { ToolRegistry } from "./registry";
import { appendStep, saveRun } from "./trace-store";
import type {
  AgentDecision,
  AgentRun,
  JsonValue,
  VerifierResult,
} from "./types";

export type PolicyFn = (ctx: {
  run: AgentRun;
  lastTool?: string;
  lastOk?: boolean;
  verifier?: VerifierResult;
}) => AgentDecision;

export type VerifyFn = (run: AgentRun) => Promise<VerifierResult>;

export type LoopOptions = {
  goal: string;
  registry: ToolRegistry;
  policy: PolicyFn;
  verify?: VerifyFn;
  maxSteps?: number;
  persist?: boolean;
};

export async function runAgentLoop(options: LoopOptions): Promise<AgentRun> {
  const maxSteps = options.maxSteps ?? 8;
  let run: AgentRun = {
    id: randomUUID(),
    goal: options.goal,
    status: "running",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [],
    maxSteps,
    artifacts: {},
  };

  run = appendStep(run, {
    type: "thought",
    message: `Start: ${options.goal}`,
  });

  let lastTool: string | undefined;
  let lastOk: boolean | undefined;
  let verifier: VerifierResult | undefined;

  for (let i = 0; i < maxSteps; i++) {
    const decision = options.policy({ run, lastTool, lastOk, verifier });

    if (decision.thought) {
      run = appendStep(run, {
        type: "thought",
        message: decision.thought,
      });
    }

    if (decision.type === "stop") {
      run = appendStep(run, {
        type: "decision",
        message: decision.reason,
        ok: true,
      });
      run = {
        ...run,
        status: "completed",
        verifier,
        updatedAt: new Date().toISOString(),
      };
      break;
    }

    if (decision.type === "verify") {
      if (!options.verify) {
        run = appendStep(run, {
          type: "verify",
          message: "No verifier configured",
          ok: false,
        });
        lastOk = false;
        continue;
      }
      verifier = await options.verify(run);
      run = appendStep(run, {
        type: "verify",
        message: verifier.passed
          ? "All checks passed"
          : `Failed: ${verifier.checks.filter((c) => !c.passed).map((c) => c.id).join(", ")}`,
        output: verifier as unknown as JsonValue,
        ok: verifier.passed,
      });
      run = { ...run, verifier };
      lastOk = verifier.passed;
      if (verifier.passed) {
        run = appendStep(run, {
          type: "decision",
          message: "Verification passed — stopping",
          ok: true,
        });
        run = { ...run, status: "completed", updatedAt: new Date().toISOString() };
        break;
      }
      continue;
    }

    const result = await options.registry.execute(decision.toolName, decision.input);
    lastTool = decision.toolName;
    lastOk = result.ok;
    run = appendStep(run, {
      type: "tool",
      message: `Tool ${decision.toolName}`,
      toolName: decision.toolName,
      input: decision.input as JsonValue,
      output: (result.data ?? result.error ?? null) as JsonValue,
      ok: result.ok,
    });

    if (result.ok && result.data && typeof result.data === "object" && !Array.isArray(result.data)) {
      run = {
        ...run,
        artifacts: {
          ...run.artifacts,
          ...(result.data as Record<string, JsonValue>),
        },
      };
    }

    run = appendStep(run, {
      type: "observe",
      message: result.ok ? "Tool succeeded" : `Tool failed: ${result.error ?? "unknown"}`,
      ok: result.ok,
    });
  }

  if (run.status === "running") {
    run = {
      ...run,
      status: verifier?.passed ? "completed" : "stopped",
      verifier,
      updatedAt: new Date().toISOString(),
    };
    run = appendStep(run, {
      type: "decision",
      message: "Reached max steps",
      ok: Boolean(verifier?.passed),
    });
  }

  if (options.persist !== false) {
    await saveRun(run);
  }

  return run;
}
