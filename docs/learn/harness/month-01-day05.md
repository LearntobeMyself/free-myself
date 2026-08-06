# Day 5 细案 · messages fixtures + `lintMessages`（约 4 小时）

> 上级：[month-01-week1.md](./month-01-week1.md) · 总览：[month-01-plan.md](./month-01-plan.md)  
> 上一天：[month-01-day04.md](./month-01-day04.md) · 下一天：[month-01-day06.md](./month-01-day06.md)  
> **今日唯一目标：** 对「对话协议」过敏——1 合法 + 3 非法 fixture；`lintMessages` 单测全绿

Lab：`D:/learn-agent-lab/`

---

## 开场（5min）— 今天要交什么

交不出下面 5 样，不算完成 Day 5：

1. `D:/learn-agent-lab/src/messages/types.ts`（消息与 tool 块类型）  
2. `D:/learn-agent-lab/src/messages/fixtures.ts`（4 个具名 fixture）  
3. `D:/learn-agent-lab/src/messages/lint.ts`（`lintMessages` 实现）  
4. `D:/learn-agent-lab/tests/messages.test.ts`（≥4 测，覆盖 4 fixture）  
5. `D:/learn-agent-lab/notes/day-05.md`（必答题 + 口述提纲）

**今天不做：** `single-round`、fake-model、接真 API、改 Free Myself 源码。

---

## 时段 A · 学（60min）

### A1（0:00–0:25）精读官方 Messages / Tool use 文档

任选 **其一** 精读（建议 OpenAI，字段名与 lab 一致）：

- [OpenAI — Function calling / Chat Completions tools](https://platform.openai.com/docs/guides/function-calling)  
- 或 [Anthropic — Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)（读时用表格对照 `tool_use_id` ↔ `tool_call_id`）

**边读边抄字段表：**

| 字段 | 出现在哪个 role | 作用 |
|---|---|---|
| `role: "user" \| "assistant" \| "tool" \| "system"` | | |
| `tool_calls[].id` | assistant | |
| `tool_calls[].function.name` | assistant | |
| `tool_calls[].function.arguments` | assistant | JSON **字符串** |
| `tool_call_id` | tool | 必须对上某条 call |
| `content` | 各 role | tool 结果通常是 JSON 字符串 |

### A2（0:25–0:45）Java 对照 — 协议 vs 实现

在笔记草稿写（每题 ≥3 句）：

1. **`tool_call_id` 像 HTTP 里的什么？**  
   提示：`X-Request-Id`、JMS `correlationId`、Future 的 key——没有它会怎样？  
2. **多个 tool_call 一轮返回时，tool_result 怎么配对？**  
   提示：N 个 call → N 条 tool message，各带不同 id；像批量 RPC 每个 request 独立 response。  
3. **system 每轮都重复发送的代价？**  
   提示：token 成本、上下文窗口、与 Spring `@Configuration` 一次注入 vs 每次手动 set 的对比。

### A3（0:45–1:00）必答题

写入 `notes/day-05.md`（每题 ≥4 句）：

1. `tool_call_id` / `tool_use_id` 存在的意义？  
2. 多个 `tool_call` 一轮时，`tool_result` 应如何回传？  
3. system 消息是否应每轮重复发送？代价是什么？

---

## 时段 B · 做（150min）

### B1（1:00–1:25）定义消息类型

创建 `src/messages/types.ts`：

```ts
export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };
```

**检查点：** `fixtures.ts` 与 `lint.ts` 能 import 上述类型。

### B2（1:25–2:15）编写 4 个 fixture

创建 `src/messages/fixtures.ts`：

```ts
import type { ChatMessage } from "./types";

/** 完整一轮：user → assistant+tool_calls → tool → assistant final */
export const validRoundTrip: ChatMessage[] = [
  { role: "user", content: "把 3 和 5 加起来，再说现在几点。" },
  {
    role: "assistant",
    content: null,
    tool_calls: [
      {
        id: "call_add_1",
        type: "function",
        function: { name: "add", arguments: '{"a":3,"b":5}' },
      },
    ],
  },
  {
    role: "tool",
    tool_call_id: "call_add_1",
    content: '{"sum":8}',
  },
  {
    role: "assistant",
    content: "3 加 5 等于 8。",
  },
];

/** 有 tool_call，缺对应 tool result */
export const invalidMissingToolResult: ChatMessage[] = [
  { role: "user", content: "加 1 和 2" },
  {
    role: "assistant",
    content: null,
    tool_calls: [
      {
        id: "call_orphan_exec",
        type: "function",
        function: { name: "add", arguments: '{"a":1,"b":2}' },
      },
    ],
  },
  { role: "assistant", content: "等于 3 吧。" }, // 跳过了 tool
];

/** 有 tool result，无对应 call（孤儿 result） */
export const invalidOrphanToolResult: ChatMessage[] = [
  { role: "user", content: "现在几点？" },
  {
    role: "tool",
    tool_call_id: "call_never_happened",
    content: '{"iso":"2026-08-06T14:00:00+08:00"}',
  },
];

/** role 顺序错误：assistant final 出现在未闭合的 tool_call 之前 */
export const invalidRoleOrder: ChatMessage[] = [
  { role: "user", content: "统计字数" },
  {
    role: "assistant",
    content: "好的。", // 有 text 但同一轮还有未完成的 call 协议（见下一行）
    tool_calls: [
      {
        id: "call_wc",
        type: "function",
        function: { name: "word_count", arguments: '{"text":"hello"}' },
      },
    ],
  },
  // 错误：在 tool result 之前又来一条 user
  { role: "user", content: "等等先别算" },
  {
    role: "tool",
    tool_call_id: "call_wc",
    content: '{"count":1}',
  },
];
```

可按需微调文案，但 **四个 export 名不可改**。

### B3（2:15–3:15）实现 `lintMessages`

创建 `src/messages/lint.ts`：

```ts
import type { ChatMessage } from "./types";

/**
 * 返回人类可读问题列表；空数组 = 通过。
 * 最低规则（必须实现）：
 * 1. 每条 tool 消息的 tool_call_id 必须对应之前某条 assistant.tool_calls[].id
 * 2. 每条 assistant.tool_calls 中的 id，必须在后续出现匹配 tool 消息后才允许下一条 user
 * 3. tool 消息不能出现在任何 assistant.tool_calls 之前
 * 4. assistant 同时有 tool_calls 时，content 可为 null；若无 tool_calls 则 content 不应为 null（除非空串）
 */
export function lintMessages(messages: ChatMessage[]): string[] {
  const issues: string[] = [];
  const pending = new Set<string>();

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === "assistant" && m.tool_calls?.length) {
      for (const tc of m.tool_calls) {
        if (!tc.id) issues.push(`[${i}] tool_call 缺少 id`);
        else pending.add(tc.id);
      }
    }
    if (m.role === "tool") {
      if (!pending.has(m.tool_call_id)) {
        issues.push(`[${i}] 孤儿 tool_result：${m.tool_call_id} 无对应 call`);
      } else {
        pending.delete(m.tool_call_id);
      }
    }
    if (m.role === "user" && pending.size > 0) {
      issues.push(
        `[${i}] 仍有未闭合 tool_call：${[...pending].join(", ")}`,
      );
    }
  }
  if (pending.size > 0) {
    issues.push(`末尾缺失 tool_result：${[...pending].join(", ")}`);
  }
  return issues;
}
```

实现时可比上面更严（例如禁止连续两条 assistant），但 **至少** 覆盖四条最低规则。

### B4（3:15–3:30）单测

创建 `tests/messages.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import {
  invalidMissingToolResult,
  invalidOrphanToolResult,
  invalidRoleOrder,
  validRoundTrip,
} from "../src/messages/fixtures";
import { lintMessages } from "../src/messages/lint";

describe("lintMessages", () => {
  it("validRoundTrip 无问题", () => {
    expect(lintMessages(validRoundTrip)).toEqual([]);
  });
  it("invalidMissingToolResult 报未闭合 call", () => {
    const issues = lintMessages(invalidMissingToolResult);
    expect(issues.some((s) => s.includes("call_orphan_exec"))).toBe(true);
  });
  it("invalidOrphanToolResult 报孤儿 result", () => {
    const issues = lintMessages(invalidOrphanToolResult);
    expect(issues.some((s) => s.includes("孤儿"))).toBe(true);
  });
  it("invalidRoleOrder 报 user 打断未闭合 call", () => {
    const issues = lintMessages(invalidRoleOrder);
    expect(issues.length).toBeGreaterThan(0);
  });
});
```

运行：

```bash
cd D:/learn-agent-lab
npx vitest run tests/messages.test.ts
```

**检查点：** 4 测全绿。

---

## 时段 C · 验（35min）

### C1（3:30–3:50）口述练习（自讲自听）

在 `notes/day-05.md` 写 **≥8 句** 提纲，主题：

> 为什么「把 tool 结果当普通 user 字符串糊进去」长期会不稳？

必须提到：协议丢失 `tool_call_id`、模型无法对齐哪次调用、多工具并行时混乱、与 Day4 四帧漫画的关系。

### C2（3:50–4:05）故障注入

手动改 `validRoundTrip`：把某条 `tool_call_id` 改成 `"wrong_id"`，跑测确认 lint 能抓；改回后再跑绿。

---

## 时段 D · 记（25min，4:05–4:30）

```markdown
# Day 05
## 必答题
## fixtures 路径与四个 export 名
## lint 规则清单（你实现了哪几条）
## 口述提纲（8 句+）
## 与 Day4 四帧对应关系（各帧哪条 lint 规则在守）
## 今天搞坏又修好的一件事
## 明日最大坑（Day6：single-round + fake-model + traces）
## 用时实际：Xh
```

---

## 收工清单

- [ ] `types.ts` / `fixtures.ts` / `lint.ts` 存在  
- [ ] 4 fixture 名正确 export  
- [ ] `npx vitest run tests/messages.test.ts` 绿  
- [ ] 必答题三题  
- [ ] 口述提纲 ≥8 句  
- [ ] 未写 single-round / fake-model  

---

## 卡住时

| 现象 | 处理 |
|---|---|
| lint 抓不到 orphan | 先打印 `pending` Set 调试；确认 for 循环顺序 |
| arguments 类型纠结 | OpenAI 规范里就是 **string**；parse 在 execute 前做 |
| 想接模型 | 停；Day6 用 `validRoundTrip` 当 append 模板 |
| vitest 找不到模块 | 检查 `tsconfig.json` 的 `include: ["src","tests"]` |

---

## 做完 Day 5 之后

→ 下一枪：[month-01-day06.md](./month-01-day06.md)（单轮 Tool Calling：fake 先，真模型后）  
→ 周计划：[month-01-week1.md](./month-01-week1.md) Day 6 节
