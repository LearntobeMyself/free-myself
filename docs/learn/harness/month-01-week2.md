# 第一个月 · Week 2（Day 8–14）自研完整 Mini Harness

> 总览：[month-01-plan.md](./month-01-plan.md) · 上周：[month-01-week1.md](./month-01-week1.md)  
> 目标：lab 具备本仓能力的**简化镜像**——Registry + Loop + Budget + Trace + 结构化错误  
> 禁止本周改 Free Myself 产品代码（只读对照）

---

## Day 8（4h）— `ToolDefinition` 与工具包重构

**今日目标：** 把 Day6 散落工具收成统一契约，对齐本仓思想。

### 学（70min）

精读本仓 [`src/harness/types.ts`](../../../src/harness/types.ts) 中 `ToolDefinition` / `ToolResult`。

**必答题：**

1. 为什么 `ToolResult` 要有 `ok` 而不是靠 throw 表达一切？  
2. `parameters` 字段给谁看？  
3. `execute` 异步的理由？  

### 做（150min）

1. `src/types.ts`：定义与本仓同构的（可简化）类型  
2. 把 add / get-time / word-count 改成 `ToolDefinition`  
3. 每个工具内部：先 `validateToolArgs`，再执行；校验失败返回 `{ ok:false, error }`，**禁止抛给 loop**  
4. `tests/tools.test.ts`：每工具 ≥2 测（正常 + 非法）  

对照笔记一行：`notes/day-08-vs-repo.md` — 你的类型与本仓差在哪（允许更窄）。

### 验（30min）

对某个工具 `execute` 里故意 `throw new Error("boom")`，先看现状；记下「Day9 要在 registry 接住」。

### 记（20min）

**今日交付物：** 三工具均实现 `ToolDefinition`；工具测绿。

---

## Day 9（4h）— `ToolRegistry`

**今日目标：** 统一注册、查询、执行、描述。

### 学（60min）

精读本仓 [`src/harness/registry.ts`](../../../src/harness/registry.ts)。

**必答题：**

1. `describeForAgent` 输出应包含哪些字段？  
2. 重复 register 同名工具应怎样？  
3. 未知 toolName 执行时返回什么？  

### 做（160min）

实现 `src/registry.ts`：

- `register(tool)`  
- `has(name)` / `list()`  
- `execute(name, input)` → 始终 `ToolResult`（捕获 throw → `{ ok:false, error }`）  
- `describeForAgent()` → 纯数据，可供 fake/LLM 使用  

`tests/registry.test.ts` 覆盖：

- 注册成功  
- 重复注册（拒绝或覆盖，选一种并文档化）  
- 未知工具  
- 工具内部 throw 被接住  
- describe 快照（字段齐全）  

把三个工具注册进 `createLabRegistry()`。

### 验（30min）

打印 `describeForAgent()` JSON，检查 description 是否「高密度」（动词+边界+返回）。不达标就改文案。

### 记（20min）

**今日交付物：** registry + 测试绿；`createLabRegistry()`。

---

## Day 10（4h）— `runLoop` 骨架 + 步数预算

**今日目标：** while 循环跑起来；超预算必须停。

### 学（60min）

精读本仓 [`src/harness/loop.ts`](../../../src/harness/loop.ts) 的 `for` + `maxSteps` 逻辑（先抓主路径）。

**必答题：**

1. 默认 maxSteps 是多少？（本仓）  
2. 用尽预算后 status 应是什么？  
3. policy 返回 `stop` 与预算用尽的语义差？  

### 做（160min）

`src/loop.ts`：

```ts
export type Decision =
  | { type: "tool"; toolName: string; input: Record<string, unknown>; thought?: string }
  | { type: "stop"; reason: string; thought?: string };

export type PolicyFn = (ctx: {
  step: number;
  lastTool?: string;
  lastOk?: boolean;
  history: Array<{ toolName?: string; ok?: boolean; output?: unknown }>;
}) => Decision;

export async function runLoop(opts: {
  goal: string;
  registry: /* your registry */;
  policy: PolicyFn;
  maxSteps?: number;
}): Promise<{ status: string; steps: unknown[]; reason?: string }>;
```

要求：

- 每步记录 thought（若有）、tool、observe  
- `maxSteps` 默认 8  
- 用尽 → `status: "stopped"`（或你文档化的等价名），reason=`max_steps`  

先写 **FakePolicy**（状态机）：goal 含 add 时调用 add，成功后 stop。  
`tests/loop-budget.test.ts`：`maxSteps: 1` 且 policy 一直要调工具 → 必须停且不死循环。

### 验（30min）

手写 policy 故意永远返回同一 tool；确认预算砍死。

### 记（20min）

**今日交付物：** `runLoop` + budget 测试绿。

---

## Day 11（4h）— JSONL Trace + Observe 细节

**今日目标：** 每一步可回放；失败可诊断。

### 学（50min）

读本仓 [`src/harness/trace-store.ts`](../../../src/harness/trace-store.ts)（了解 persist 思路即可）。

**必答题：** Trace 最少应记录哪些字段才能排障？

### 做（170min）

1. `src/trace.ts`：`appendStep`、`saveRunJsonl(run, path)`  
2. loop 每步写入：`thought` / `tool` / `observe` / `decision`  
3. observe 必须含：`ok`、`error?`、`data?`、耗时 ms  
4. `npm` script：`npm run demo:loop` 跑一次并把 trace 写到 `traces/run-*.jsonl`  
5. `tests/trace.test.ts`：跑完后文件存在且行数 ≥ 步数  

写 `notes/day-11-read-trace.md`：人为读一条失败 observe，写出「下一步该修工具还是修 policy」。

### 验（30min）

关掉 persist 路径权限或写到非法路径时，loop 仍应返回结果（trace 失败不应吞掉主结果——按你的设计文档化）。

### 记（20min）

**今日交付物：** JSONL trace 可生成；读 trace 笔记。

---

## Day 12（4h）— FakePolicy 强化 + LlmPolicy 接口

**今日目标：** 分清「决策策略」与「循环引擎」；无 Key 也能验收。

### 学（60min）

重读本仓 [`loop.test.ts`](../../../src/harness/loop.test.ts)：手写 policy 如何串联 echo → assert → stop。

**必答题：** 为什么测试里可以没有真实 LLM？这对工程意味着什么？

### 做（160min）

1. `src/policy/fake-policy.ts`：支持多步脚本（数组决策或状态机），覆盖：add → word_count → stop  
2. `src/policy/llm-policy.ts`：定义接口  

```ts
export interface ModelClient {
  complete(args: {
    messages: unknown[];
    tools: unknown[];
  }): Promise<{ toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>; text?: string }>;
}
```

实现一个 `buildLlmPolicy(client)`：把 model 输出映射为 `Decision`（无 toolCalls → stop）。  
3. 无 Key：用 fakeModel 充当 `ModelClient` 跑通 1 条 goal  
4. 有 Key：真实 client 跑通 1 条（仍保留 fake 测试）  

`tests/policy.test.ts`：fake 多步路径断言 step 顺序。

### 验（30min）

模型返回未知工具名：loop/registry 应 `ok:false`，policy 下一跳可 stop 或重试（你选一种并测）。

### 记（20min）

**今日交付物：** 双 Policy；至少 fake 路径多步绿。

---

## Day 13（7h）— 故障注入日（≥6 场景）

**今日目标：** 写出 `reports/fault-injection.md`；Harness 在恶意输入下不崩。

### 学（40min）

列出生产 Agent 常见失败：幻觉工具名、烂 JSON、重复失败、成本爆炸。

### 做（300min）

对 lab 逐项注入并记录表格（现象 → 根因 → 哪一层修复 → 是否已有测试）：

1. 未知工具名  
2. 缺 required 参数  
3. 类型错误（string 当 number）  
4. 工具内部 throw  
5. policy 死循环（同工具反复失败）— 需 **loop detection 或失败计数停止**（今天实现最小版：同一 tool 连续失败 ≥3 则 stop）  
6. 超预算 maxSteps  

每个场景：复现命令或测试名 + trace 片段（可截断）。

补测试使以上 6 个都有自动化覆盖（可集中在 `tests/faults.test.ts`）。

### 验（50min）

找一个你认为「还不够结构化」的 error 字符串，改成机器可解析 + 人可读，再跑全测。

### 记（30min）

**今日交付物：** `reports/fault-injection.md` ≥6 行场景；faults 测试绿。

---

## Day 14（7h）— 加固、演示脚本、周记 #1

**今日目标：** Week2 门禁过关；对外讲得清。

### 学（40min）

浏览 [Addy Osmani — Agent Harness Engineering](https://addyosmani.com/blog/agent-harness-engineering/) 前半，摘 5 条金句到笔记（后面面试用）。

### 做（280min）

1. 整理 API：`src/index.ts` 导出 registry/loop/types  
2. `README.md` 更新：架构图（mermaid 或 ASCII）、如何跑 vitest、如何看 jsonl  
3. Demo 脚本跑 5 个 goal（fake）：加减、时间、字数、非法参、超预算  
4. 与本仓再对照：`notes/week2-vs-freemyself.md` 表（至少 8 行差异/相同点）  
5. **周记 #1**（≥1500 字）发 CSDN/掘金，标题建议：  
   `我手写了一个 Agent Harness：Registry、预算与故障回注`  
   必须含：架构图、一段代码、至少 1 个失败复盘  

### 验（50min）

录音 **5 分钟**：白板讲 loop（可看自己的图，不可看源码）。路径记入笔记。

### 记（30min）

自检 Week2 门禁清单（总览）。

**本周门禁：** 完整 lab harness；fault 报告；周记 #1；5 分钟口述。

→ 下一周：[month-01-week3.md](./month-01-week3.md)
