export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ToolResult = {
  ok: boolean;
  data?: JsonValue;
  error?: string;
};

export type ToolDefinition = {
  name: string;
  description: string;
  /** JSON-schema-like parameter description for agents */
  parameters: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<ToolResult>;
};

export type TraceStep = {
  id: string;
  at: string;
  type: "thought" | "tool" | "observe" | "verify" | "decision";
  message: string;
  toolName?: string;
  input?: JsonValue;
  output?: JsonValue;
  ok?: boolean;
};

export type VerifierResult = {
  passed: boolean;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    detail?: string;
  }>;
};

export type AgentRunStatus = "running" | "completed" | "failed" | "stopped";

export type AgentRun = {
  id: string;
  goal: string;
  status: AgentRunStatus;
  createdAt: string;
  updatedAt: string;
  steps: TraceStep[];
  artifacts?: Record<string, JsonValue>;
  verifier?: VerifierResult;
  maxSteps: number;
};

export type AgentDecision =
  | { type: "tool"; toolName: string; input: Record<string, unknown>; thought?: string }
  | { type: "verify"; thought?: string }
  | { type: "stop"; reason: string; thought?: string };
