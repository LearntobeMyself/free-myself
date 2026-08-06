# Day 7 细案 · 第三工具、并行调用、Week1 验收（约 7 小时）

> 上级：[month-01-week1.md](./month-01-week1.md) · 总览：[month-01-plan.md](./month-01-plan.md)  
> 上一天：[month-01-day06.md](./month-01-day06.md) · 下一周：[month-01-week2.md](./month-01-week2.md)  
> **今日唯一目标：** 巩固 Week1；并行 tool_calls 概念落地；闭卷周测 ≥8/10；lab README 可交付

Lab：`D:/learn-agent-lab/`

---

## 开场（5min）— 今天要交什么

交不出下面 8 样，不算完成 Day 7（**也不进 Week2**）：

1. `src/tools/word-count.ts` + 注册进 `registry-mini.ts`  
2. `fake-model` 支持 **一轮返回 2 个** `tool_call`  
3. `single-round.ts` 能串行执行多 call 再汇总（Day7 串行即可，但笔记要说清并行取舍）  
4. Demo goal G3 跑通：`"把 3 和 5 相加，并统计句子『Hello harness』的字数"`  
5. `D:/learn-agent-lab/README.md`（安装、测试、day6/7 demo 命令）  
6. `notes/week1-exam.md`（闭卷作答全文）  
7. `notes/day-07.md` + 三角图 **v3**  
8. `notes/week1-misconceptions.md`（「我曾误解」≥10 条）

**今天不做：** 完整 `runAgentLoop`（Week2）、改 Free Myself 源码、多轮 while。

---

## 时段 A · 学（50min）

### A1（0:00–0:30）parallel tool calls 概念

查阅 OpenAI / Anthropic 文档中 **parallel tool use** 小节，笔记回答：

1. 模型何时会在 **一条** assistant 消息里返回多个 `tool_call`？  
2. Harness 执行顺序：并行 Promise.all vs 串行 for-await——各 1 优点 1 缺点  
3. 全部执行完后，messages 里应出现几条 `role: tool`？（答案：与 call 数相同，各带不同 `tool_call_id`）

**Java 类比：**

- 并行 ≈ `CompletableFuture.allOf(...)` 调多个下游  
- 串行 ≈ for 循环调 Feign，实现简单但延迟累加  
- lint（Day5）≈ 网关校验：N 个 request id 必须 N 个 response 才能放行走下一跳 user

### A2（0:30–0:50）Week1 门禁对照

打开 [month-01-week1.md](./month-01-week1.md) 末尾「本周门禁」，逐项自查缺什么：

| 门禁 | 你已有？ | 今天补 |
|---|---|---|
| Schema 10 测绿 | Day2 | 跑 `npx vitest run` 确认 |
| 单轮 fake 多工具 | | Day7 G3 |
| 周测 ≥8/10 | | 本节 C2 |
| `lab/README.md` | | B4 |

---

## 时段 B · 做（260min）

### B1（1:00–1:40）第三工具 word-count

**`src/tools/word-count.ts`**

```ts
import type { JsonSchemaLike } from "../schema";

export const wordCountSchema: JsonSchemaLike = {
  type: "object",
  properties: {
    text: { type: "string", minLength: 1 },
  },
  required: ["text"],
  additionalProperties: false,
};

/** 按空白切分；中文无空格时按字符数（简化版） */
export function wordCount(input: { text: string }) {
  const t = input.text.trim();
  const words = t.split(/\s+/).filter(Boolean);
  const count = words.length === 1 && /[\u4e00-\u9fff]/.test(t) ? t.length : words.length;
  return { count, text: t };
}
```

在 `registry-mini.ts` 的 `defs` 增加：

```ts
word_count: { schema: wordCountSchema, run: wordCount },
```

### B2（1:40–2:40）扩展 fake-model — 双 tool_call

在 `fake-model.ts` 的 **首轮**（无 `lastTool`）增加分支：

```ts
if (/相加|加法|\+/.test(user) && /字数|统计|word/i.test(user)) {
  const nums = user.match(/-?\d+/g)?.map(Number) ?? [3, 5];
  const textMatch = user.match(/[「『'"](.+?)[」』'"]/) ?? user.match(/Hello harness/i);
  const text = textMatch ? (textMatch[1] ?? textMatch[0]) : "Hello harness";
  return {
    kind: "tool_calls",
    content: null,
    tool_calls: [
      {
        id: `call_add_${Date.now()}`,
        type: "function",
        function: {
          name: "add",
          arguments: JSON.stringify({ a: nums[0] ?? 3, b: nums[1] ?? 5 }),
        },
      },
      {
        id: `call_wc_${Date.now()}`,
        type: "function",
        function: {
          name: "word_count",
          arguments: JSON.stringify({ text }),
        },
      },
    ],
  };
}
```

在 **第二轮**（已有 tool results）合并回答：

```ts
const tools = messages.filter((m) => m.role === "tool");
const parts = tools.map((t) => JSON.parse(t.content));
// 组合 sum + count 成一句自然语言
```

### B3（2:40–3:30）扩展 single-round — 多 call 串行

Day6 的 `for (const tc of r1.tool_calls)` **已支持多个 call**；确认：

1. 每个 call 都 `validateToolArgs` + `executeTool`  
2. 每个结果各 push 一条 `role: tool`  
3. 第二次 `fakeModel` 前 `lintMessages` 为空  

运行 G3：

```bash
npx tsx src/single-round.ts "把 3 和 5 相加，并统计句子「Hello harness」的字数"
```

期望 FINAL 同时提到 `8` 与字数（`Hello harness` → 按你的算法 2 词或 13 字符，笔记里说明规则）。

**并行笔记（写入 `day-07.md`）：** 若改成 `Promise.all(tool_calls.map(...))`，对 **无依赖** 的 add 与 word_count 可降延迟；有依赖（B 依赖 A 输出）必须串行——Week2 再自动化。

### B4（3:30–4:20）整理 lab README

**`D:/learn-agent-lab/README.md`** 模板（填满真实命令）：

```markdown
# learn-agent-lab

Free Myself 第一个月 Harness 实验场（TypeScript + Vitest）。

## 环境

- Node 20+
- `npm install`

## 测试

```bash
npx vitest run
```

## Day 2 — Schema

- `src/schema.ts` — `validateToolArgs`
- `tests/schema.test.ts`

## Day 5 — Messages

- `src/messages/fixtures.ts` — 4 fixtures
- `src/messages/lint.ts` — `lintMessages`

## Day 6–7 — 单轮 Tool Calling

```bash
npx tsx src/single-round.ts "帮我把 3 和 5 加起来"
npx tsx src/single-round.ts "现在几点？"
npx tsx src/single-round.ts "把 3 和 5 相加，并统计句子「Hello harness」的字数"
```

Trace 输出：`traces/day-06-*.json`

## 真模型（可选）

```bash
set OPENAI_API_KEY=sk-...
set REAL_MODEL=1
npx tsx src/single-round.ts "你的 goal"
```

## 目录

```text
src/
  schema.ts
  messages/
  tools/
  fake-model.ts
  single-round.ts
tests/
notes/
traces/
```

## 课程链接

- [month-01-week1.md](file:///D:/DESKTOP/free%20myself/docs/learn/harness/month-01-week1.md)（本机路径按你的 clone 调整）
```

### B5（4:20–5:00）「我曾误解」清单

**`notes/week1-misconceptions.md`** — 至少 10 条，格式：

```markdown
1. 我曾以为模型会直接执行工具 → 实际是 Harness execute
2. ...
```

覆盖：Schema、messages 协议、fake vs real、AgentDecision、parallel calls、system 重复、additionalProperties 等。

### B6（5:00–5:20）三角图 v3

`notes/day-07-triangle-v3.md`：在 v2 上标 Week1 已实现的模块（schema / lint / tools / fake / single-round / traces），并虚线标 Week2 将造的 `runLoop`。

---

## 时段 C · 验（70min）

### C1（5:20–5:40）全量测试

```bash
cd D:/learn-agent-lab
npx vitest run
```

必须全绿（schema + messages + 你若有的 smoke）。

### C2（5:40–6:50）闭卷周测 — `notes/week1-exam.md`

**合上所有资料**，逐题作答（每题 ≥3 句，第 5、9 题可画图）：

1. Agent 与单次补全的本质差  
2. Harness 六块  
3. 谁执行工具  
4. required 缺失谁拒绝  
5. 画出单轮 tool 序列（角色：user / assistant / tool）  
6. 解释 `additionalProperties: false`  
7. fakeModel 在训练里的作用  
8. 非法 tool 序列一例（用 Day5 某个 fixture 名）  
9. 本仓 `AgentDecision` 三种 `type`  
10. 下周要造的 Registry 职责三句话  

### C3（6:50–7:00）对答案自评

打开 [month-01-day04.md](./month-01-day04.md) 映射表、[src/harness/types.ts](../../../src/harness/types.ts)、[month-01-week2.md](./month-01-week2.md) 开头，订正 exam；统计得分，**≥8/10 才勾选 Week1 完成**。

**参考答案要点（订正用，闭卷时不可看）：**

| # | 要点 |
|---|---|
| 1 | Agent = 多步 + 工具副作用 + Harness 编排；补全 = 单次文本、无执行 |
| 2 | Loop / Tools / Context / Verify / Trace / Guardrails |
| 3 | Harness 代码 `execute` / `ToolRegistry`，不是模型 |
| 4 | Harness `validateToolArgs`，错误以 tool 或 user 消息回注 |
| 5 | 四帧：user → assistant+tool_calls → tool(s) → assistant |
| 6 | 拒绝 schema 未声明字段，防模型乱传键 |
| 7 | 确定性、无 Key、可故障注入、CI 友好 |
| 8 | 如 `invalidOrphanToolResult` |
| 9 | `tool` / `verify` / `stop` |
| 10 | 注册工具、按名 execute、describe 给模型 |

---

## 时段 D · 记（40min，穿插在 C 之后）

```markdown
# Day 07
## 并行 vs 串行取舍（≥6 句）
## G3 运行摘要
## 周测得分：X/10
## 订正摘要
## week1-misconceptions 路径
## README 路径
## 三角图 v3 路径
## Week2 第一天要做什么（读 week2 Day8 标题即可）
## 用时实际：Xh
```

---

## 收工清单（Week1 总门禁）

- [ ] `word-count` 工具注册  
- [ ] 双 tool_call fake + G3 成功  
- [ ] `npx vitest run` 全绿  
- [ ] `README.md` 含三条 demo 命令  
- [ ] `week1-exam.md` 作答 + 订正  
- [ ] 周测 ≥8/10  
- [ ] `week1-misconceptions` ≥10 条  
- [ ] 三角图 v3  
- [ ] 未改 Free Myself 源码  

---

## 卡住时

| 现象 | 处理 |
|---|---|
| 双 call 只执行了一个 | 检查 `for (const tc of r1.tool_calls)` 是否 break 过早 |
| lint 报未闭合 | 两个 call 必须两条 tool 消息，id 各对应 |
| 周测不及格 | 重读 day04 映射 + day05 fixtures，隔天重考同一文件 |
| README 链接 404 | 用相对路径或写本机绝对路径 |

---

## Week1 完成后

→ 进入 [month-01-week2.md](./month-01-week2.md)（自研完整 mini harness：Registry + runLoop + maxSteps）  
→ 总览：[month-01-plan.md](./month-01-plan.md)

把 `week1-exam.md` 得分和 G3 的 FINAL 输出贴给教练/未来的你，作为 Week2 起点快照。
