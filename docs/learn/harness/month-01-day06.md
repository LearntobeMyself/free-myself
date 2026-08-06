# Day 6 细案 · 单轮 Tool Calling（Fake 先，真模型后）（约 7 小时）

> 上级：[month-01-week1.md](./month-01-week1.md) · 总览：[month-01-plan.md](./month-01-plan.md)  
> 上一天：[month-01-day05.md](./month-01-day05.md) · 下一天：[month-01-day07.md](./month-01-day07.md)  
> **今日唯一目标：** 跑通「模型提议 → 校验 → 执行 → 再问模型 → 最终文本」的**单轮**（尚未 while 多步）

Lab：`D:/learn-agent-lab/` · 前置：`src/schema.ts`（Day2）、`src/messages/*`（Day5）

---

## 开场（5min）— 今天要交什么

交不出下面 7 样，不算完成 Day 6：

1. `src/tools/add.ts` + `src/tools/get-time.ts`（纯函数 + JSON schema）  
2. `src/fake-model.ts`（确定性返回 tool_call 或 final text）  
3. `src/single-round.ts`（可 `npx tsx src/single-round.ts "goal"` 运行）  
4. `traces/day-06-add.json` + `traces/day-06-time.json`（每步原始 JSON，secret 打码）  
5. `notes/day-06-diff.md`（`completion-only` vs `tool-round` 对照）  
6. **2 个 goal** 在 fake 路径跑通（见下方 Goal 表）  
7. `notes/day-06.md`（概念 + 故障注入记录）

**今天不做：** while 多步 loop、第三工具 `word-count`（Day7）、Week2 完整 Registry、改 Free Myself 源码。

---

## 时段 A · 学（60min）

### A1（0:00–0:25）重读 Day3 单轮子集

打开 `D:/learn-agent-lab/notes/patterns/tool-use-agent.md`，只读 **单轮** 部分（if tool_calls → execute → call again → return）。

在草稿画控制流：

```text
messages₀ → model → (tool_calls?) → validate → execute → append tool → model → final
```

### A2（0:25–0:45）浏览 SDK 官方 tool calling 示例（只看一轮）

任选 OpenAI / Anthropic 官方「single turn tool use」示例，对照：

- 第一次 completion 返回什么 JSON 形状  
- 第二次 completion 的 messages 数组比第一次多了什么  

**Java 类比：** 第一次像 Feign 接口声明调用意图；第二次像拿到 `ResponseEntity` 后再问编排器「要不要继续」。

### A3（0:45–1:00）Goal 表 — 今天必须跑通的输入

| # | 命令示例 | 期望 fake 行为 | 期望最终输出含 |
|---|---|---|---|
| G1 | `"帮我把 3 和 5 加起来"` | 调 `add` | `8` |
| G2 | `"现在几点？"` | 调 `get_time` | 日期或 ISO 字符串 |

有 API Key 者额外：同一 `single-round.ts` 用 `REAL_MODEL=1` 跑 G1、G2 各一次（可选，不替代 fake）。

---

## 时段 B · 做（280min）

### B1（1:00–1:50）两个工具 + schema

**`src/tools/add.ts`**

```ts
import type { JsonSchemaLike } from "../schema";

export const addSchema: JsonSchemaLike = {
  type: "object",
  properties: {
    a: { type: "number" },
    b: { type: "number" },
  },
  required: ["a", "b"],
  additionalProperties: false,
};

export function add(input: { a: number; b: number }) {
  return { sum: input.a + input.b };
}
```

**`src/tools/get-time.ts`**

```ts
import type { JsonSchemaLike } from "../schema";

export const getTimeSchema: JsonSchemaLike = {
  type: "object",
  properties: {
    timezone: { type: "string", enum: ["Asia/Shanghai", "UTC"] },
  },
  required: [],
  additionalProperties: false,
};

export function getTime(input: { timezone?: string }) {
  const tz = input.timezone ?? "Asia/Shanghai";
  const iso = new Date().toLocaleString("sv-SE", { timeZone: tz });
  return { iso, timezone: tz };
}
```

**`src/tools/registry-mini.ts`**（Day6 最小注册表，Week2 再升级）：

```ts
import { validateToolArgs } from "../schema";
import { add, addSchema } from "./add";
import { getTime, getTimeSchema } from "./get-time";

const defs = {
  add: { schema: addSchema, run: add },
  get_time: { schema: getTimeSchema, run: getTime },
} as const;

export type ToolName = keyof typeof defs;

export function executeTool(name: string, rawArgs: unknown) {
  const def = defs[name as ToolName];
  if (!def) return { ok: false as const, error: `Unknown tool: ${name}` };
  const parsed = validateToolArgs(def.schema, rawArgs);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };
  try {
    const data = def.run(parsed.value as never);
    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}

export function toolDefinitionsForPrompt() {
  return Object.entries(defs).map(([name, d]) => ({
    name,
    parameters: d.schema,
  }));
}
```

### B2（1:50–2:50）`fake-model.ts` — 确定性、可测

**`src/fake-model.ts`**

```ts
import type { ChatMessage, ToolCall } from "./messages/types";

function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

function hasPendingTool(messages: ChatMessage[]): boolean {
  const pending = new Set<string>();
  for (const m of messages) {
    if (m.role === "assistant" && m.tool_calls) {
      for (const tc of m.tool_calls) pending.add(tc.id);
    }
    if (m.role === "tool") pending.delete(m.tool_call_id);
  }
  return pending.size > 0;
}

export type ModelResponse =
  | { kind: "tool_calls"; tool_calls: ToolCall[]; content?: null }
  | { kind: "text"; content: string };

export function fakeModel(messages: ChatMessage[]): ModelResponse {
  if (hasPendingTool(messages)) {
    throw new Error("fakeModel: 不应在 pending tool 时再次被调用");
  }

  const lastTool = [...messages].reverse().find((m) => m.role === "tool");
  if (lastTool) {
    const data = JSON.parse(lastTool.content) as Record<string, unknown>;
    if ("sum" in data) {
      return { kind: "text", content: `结果是 ${data.sum}。` };
    }
    if ("iso" in data) {
      return { kind: "text", content: `现在是 ${data.iso}（${data.timezone}）。` };
    }
    return { kind: "text", content: JSON.stringify(data) };
  }

  const user = lastUserText(messages);
  if (/加|\+|add/i.test(user)) {
    const nums = user.match(/-?\d+/g)?.map(Number) ?? [0, 0];
    const [a, b] = [nums[0] ?? 0, nums[1] ?? 0];
    return {
      kind: "tool_calls",
      content: null,
      tool_calls: [
        {
          id: `call_add_${Date.now()}`,
          type: "function",
          function: { name: "add", arguments: JSON.stringify({ a, b }) },
        },
      ],
    };
  }
  if (/几点|时间|time/i.test(user)) {
    return {
      kind: "tool_calls",
      content: null,
      tool_calls: [
        {
          id: `call_time_${Date.now()}`,
          type: "function",
          function: {
            name: "get_time",
            arguments: JSON.stringify({ timezone: "Asia/Shanghai" }),
          },
        },
      ],
    };
  }
  return { kind: "text", content: "请说明要「加法」还是「查时间」。" };
}
```

### B3（2:50–4:30）`single-round.ts` — 核心 Harness 片段

**`src/single-round.ts`**

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fakeModel } from "./fake-model";
import { lintMessages } from "./messages/lint";
import type { ChatMessage } from "./messages/types";
import { executeTool } from "./tools/registry-mini";

const goal = process.argv.slice(2).join(" ") || "帮我把 3 和 5 加起来";
const trace: unknown[] = [];

function log(step: string, payload: unknown) {
  trace.push({ at: new Date().toISOString(), step, payload });
  console.log(`\n--- ${step} ---\n`, JSON.stringify(payload, null, 2));
}

function appendAssistantToolCalls(
  messages: ChatMessage[],
  tool_calls: NonNullable<Extract<ReturnType<typeof fakeModel>, { kind: "tool_calls" }>["tool_calls"]>,
): ChatMessage[] {
  return [...messages, { role: "assistant", content: null, tool_calls }];
}

async function main() {
  let messages: ChatMessage[] = [
    {
      role: "system",
      content: "你是 lab 助手。需要计算或查时间时必须调用工具，不要心算。",
    },
    { role: "user", content: goal },
  ];

  log("0_initial_messages", messages);

  // 第一次 model
  const r1 = fakeModel(messages);
  log("1_first_model_response", r1);

  if (r1.kind === "text") {
    log("final_early", r1.content);
    writeTrace(goal, trace);
    return;
  }

  messages = appendAssistantToolCalls(messages, r1.tool_calls);
  log("2_after_assistant_tool_calls", messages);

  const lint1 = lintMessages(messages);
  if (lint1.length) throw new Error(lint1.join("; "));

  // 执行每个 tool_call（Day6 串行即可）
  for (const tc of r1.tool_calls) {
    const args = JSON.parse(tc.function.arguments);
    const result = executeTool(tc.function.name, args);
    log(`3_tool_execute_${tc.function.name}`, { input: args, result });

    messages.push({
      role: "tool",
      tool_call_id: tc.id,
      content: JSON.stringify(result.ok ? result.data : { error: result.error }),
    });
  }
  log("4_after_tool_results", messages);

  const lint2 = lintMessages(messages);
  if (lint2.length) throw new Error(lint2.join("; "));

  // 第二次 model
  const r2 = fakeModel(messages);
  log("5_second_model_response", r2);

  if (r2.kind !== "text") {
    throw new Error("Day6 只要求单轮：第二次应返回 text");
  }

  messages.push({ role: "assistant", content: r2.content });
  log("6_final_messages", messages);
  console.log("\n=== FINAL ===\n", r2.content);
  writeTrace(goal, trace);
}

function writeTrace(goal: string, steps: unknown[]) {
  mkdirSync(join(process.cwd(), "traces"), { recursive: true });
  const slug = /加|add/i.test(goal) ? "add" : /时间|几点|time/i.test(goal) ? "time" : "run";
  const file = join(process.cwd(), "traces", `day-06-${slug}.json`);
  writeFileSync(
    file,
    JSON.stringify({ goal, steps }, null, 2),
    "utf8",
  );
  console.log("\nTrace written:", file);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

运行：

```bash
cd D:/learn-agent-lab
npx tsx src/single-round.ts "帮我把 3 和 5 加起来"
npx tsx src/single-round.ts "现在几点？"
```

### B4（4:30–5:20）真模型封装（有 Key 才做）

**`src/real-model.ts`**（可选）

```ts
/**
 * 最小 OpenAI 兼容封装：与 fakeModel 同签名返回 ModelResponse。
 * 环境变量：OPENAI_API_KEY, OPENAI_BASE_URL（可选）, OPENAI_MODEL（默认 gpt-4o-mini）
 */
export async function realModel(messages: unknown[]): Promise<import("./fake-model").ModelResponse> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");

  const res = await fetch(
    `${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages,
        tools: [/* 从 toolDefinitionsForPrompt 转换 */],
      }),
    },
  );
  const json = await res.json();
  // 解析 message.tool_calls 或 message.content → ModelResponse
  throw new Error("按 SDK 响应形状补全解析逻辑");
}
```

在 `single-round.ts` 顶部用 `const model = process.env.REAL_MODEL ? realModel : fakeModel` 切换。**无 Key 不算未完成**，fake 两 goal 必须绿。

### B5（5:20–5:40）`notes/day-06-diff.md`

| 维度 | completion-only | tool-round（今天） |
|---|---|---|
| 输入 | 单条 user prompt | messages 数组 + tool 定义 |
| 控制流 | 一次 forward | 两次 model + 中间 execute |
| 副作用 | 无（模型幻觉风险） | Harness 执行 `add` / `get_time` |
| 失败点 | 胡编数字 | schema 校验、lint、unknown tool |
| 本仓对应 | 无 | 接近 `loop.ts` 一轮 tool 分支 |

每格 ≥2 句。

---

## 时段 C · 验（50min）

### C1（5:40–6:10）故障注入 — 错误参数类型

临时改 `fake-model.ts`：对 add 返回 `arguments: '{"a":"3","b":5}'`（a 为字符串）。

运行 `single-round.ts`，确认：

1. `validateToolArgs` 返回 `ok: false`  
2. 进程 **不崩**（或你 catch 后把 error 写进 tool content 再调第二次 model）  
3. trace JSON 里能看到错误步骤  

改回正确 fake，再跑 G1、G2 绿。

### C2（6:10–6:30）对照本仓 loop（只读 10min）

读 Free Myself [`src/harness/loop.ts`](../../../src/harness/loop.ts) 中 tool 分支：你的 `single-round` 对应哪几行？写 5 句进 `day-06.md`。

---

## 时段 D · 记（30min，6:30–7:00）

```markdown
# Day 06
## 概念（≥400 字：单轮 vs while、fake 的价值）
## Goal G1/G2 命令与 FINAL 输出摘要
## trace 文件路径
## 故障注入：错误参数时发生了什么
## 与 loop.ts 对照 5 句
## 明日最大坑（Day7：并行 tool_calls + word-count + 周测）
## 用时实际：Xh
```

---

## 收工清单

- [ ] `add` / `get_time` 工具 + schema  
- [ ] `fake-model.ts` 确定性  
- [ ] `single-round.ts` 可运行  
- [ ] G1、G2 fake 成功  
- [ ] `traces/day-06-*.json` 各至少 1 个  
- [ ] `day-06-diff.md` 对照表  
- [ ] 故障注入记录  
- [ ] 未改 Free Myself 源码  

---

## 卡住时

| 现象 | 处理 |
|---|---|
| `JSON.parse(arguments)` 崩 | 先 try/catch；arguments 必须是合法 JSON 字符串 |
| lint 在 step2 红 | 对照 Day5 四帧，缺 tool 或 id 不对 |
| fake 第二次仍返回 tool_calls | 检查 `hasPendingTool` 与 `lastTool` 分支 |
| 想写 while | 停；Week2 Day8+；今天只单轮 |

---

## 做完 Day 6 之后

→ 下一枪：[month-01-day07.md](./month-01-day07.md)（第三工具、并行调用、周验收）  
→ 周计划：[month-01-week1.md](./month-01-week1.md) Day 7 节
