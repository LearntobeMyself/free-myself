# 第一个月 · Week 1（Day 1–7）协议与首轮 Tool Call

> 总览：[month-01-plan.md](./month-01-plan.md)  
> 目标：搞懂「消息 / Schema / 单轮工具调用」；**每天都有可运行代码**  
> 目录：`D:/learn-agent-lab/`

---

## Day 1（4h）— 环境、总纲、三种请求对照

**细案（按分钟执行）：** [month-01-day01.md](./month-01-day01.md) ← 今天从这里开始

**今日目标：** Lab 能跑 TS；说清 HTTP API / Chat Completions / Tool Call 三层差别。

### 学（70min）

1. 精读 [README.md](./README.md) + [month-01-plan.md](./month-01-plan.md)  
2. 精读 [00-foundations.md](./00-foundations.md)「概念速记」表  

**必答题（写进笔记）：**

1. 为什么 raw model 不是 Agent？  
2. Harness 六块各自用一句话解释  
3. Java 里什么角色最像 `ToolRegistry`？什么最像 `runAgentLoop`？  

### 做（140min）

1. 本仓：`npm install && npm test && npm run dev`，打开 `/learn/harness`  
2. 创建 `D:/learn-agent-lab/` 脚手架（见总览），确认：

```bash
npx tsx -e "console.log('lab-ok')"
```

3. 新建 `notes/day-01.md`，手写对照表（每格 ≥2 句）：

| 层 | 请求长什么样 | 谁执行副作用 | 失败谁先负责 |
|---|---|---|---|
| 普通 HTTP API | | | |
| Chat Completions（纯文本） | | | |
| Tool Calling 一轮 | | | |

4. 新建 `src/compare-layers.md`（可放 notes）并画三角图 v1：`Model ↔ Harness ↔ Tools`

### 验（35min）

闭卷（不看资料）默写：Harness 六块 + 「模型从不直接碰文件系统」这句话的展开解释（≥5 句）。对照笔记改错。

### 记（25min）

按总览模板写 `notes/day-01.md`，概念段 ≥400 字。

**今日交付物：** `lab-ok` 能跑；`notes/day-01.md`；对照表；三角图 v1。

---

## Day 2（4h）— JSON Schema 深挖 + `validateToolArgs`

**今日目标：** 参数校验是 Harness 的活，不是模型的活；交出带 10 测的校验器。

### 学（70min）

阅读并笔记（自搜官方 JSON Schema 文档对应章节即可）：

- `type` / `properties` / `required`  
- `enum` / `minimum` / `minLength`  
- `additionalProperties: false` 的意义  

**必答题：**

1. 模型漏传 required 字段时，应在哪一层拒绝？返回给模型的形态应是什么？  
2. `additionalProperties: true` 在 Agent 工具里有什么风险？  
3. 和 Java Bean Validation / `@NotNull` 的对应关系？  

### 做（150min）

实现 `src/schema.ts`：

```ts
// 目标 API（可微调，但必须有单测）
export type JsonSchemaLike = {
  type?: string;
  properties?: Record<string, JsonSchemaLike>;
  required?: string[];
  enum?: unknown[];
  additionalProperties?: boolean;
};

export function validateToolArgs(
  schema: JsonSchemaLike,
  input: unknown,
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string };
```

要求至少支持：object、string、number、boolean、required、enum、additionalProperties:false。  
可用 Zod 实现内部，但 **对外 API 保持上面签名**（方便 Week2 接入）。

`tests/schema.test.ts`：**至少 10 个用例**，覆盖：

- 正常  
- 缺 required  
- 类型错误  
- enum 不匹配  
- 多余字段（additionalProperties false）  
- null / 非 object 根  
- 空 properties  
- 嵌套一层 object（若时间不够，嵌套可做「尽力」但至少 1 测）  

```bash
npx vitest run
```

### 验（30min）

故意写一个「模型常犯」输入（字符串数字 `"3"` 当 number），记录校验器报错文案是否对模型友好；若不友好，改文案再测。

### 记（20min）

`notes/day-02.md`：列出 10 测清单与 2 个设计取舍。

**今日交付物：** `src/schema.ts` + `tests/schema.test.ts` 全绿。

---

## Day 3（4h）— Building Effective Agents + 三种模式伪代码

**今日目标：** 分清 workflow 与 agent；能手写 3 种模式伪代码。

### 学（90min）

精读：[Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)

**必答题（每题 ≥4 句）：**

1. 文中认为何时该用 Agent，何时不该？  
2. 「简单可组合模式」比重框架更稳的原因？  
3. 工具调用失败后，理想反馈长什么样？  

### 做（130min）

在 `notes/patterns/` 写下三个文件（伪代码必须可被你朗读成代码）：

1. `prompt-chain.md`：多步 prompt 固定流水线（无动态选工具）  
2. `router.md`：分类后再走不同分支  
3. `tool-use-agent.md`：while tool_use 循环  

每个文件包含：适用场景、伪代码、失败模式各 3 条。

再写 `notes/day-03-java-map.md`：把三种模式映射到「Spring 里你会怎么搭」（Controller / Strategy / 状态机）。

### 验（30min）

口述录音 3 分钟：只讲「为什么工具调用 Agent 需要 Harness」。

### 记（20min）

`notes/day-03.md` 汇总。

**今日交付物：** 三份模式伪代码 + 录音（文件路径记在笔记里）。

---

## Day 4（4h）— Anatomy of Harness + 映射到本仓

**今日目标：** 外文概念能一一落到 Free Myself 文件路径。

### 学（80min）

精读：[LangChain — The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)

**必答题：**

1. 文中 Harness 的定义用你的话重写  
2. 列出文中部件，并猜测本仓对应文件（先猜再验证）  
3. 「state / feedback / constraints」各举本仓一例  

### 做（140min）

1. 打开本仓只读：  
   - [`src/harness/types.ts`](../../../src/harness/types.ts)  
   - [`src/harness/loop.ts`](../../../src/harness/loop.ts)  
   - [`docs/harness.md`](../../harness.md)  
2. 填写并保存 `notes/day-04-mapping.md`：

| 概念 | 外文说法 | 本仓符号/文件 | 我的 lab 将放在哪 |
|---|---|---|---|
| Loop | | | |
| Tool registry | | | |
| Trace | | | |
| Decision | | | |
| Verify | | | |

3. 画「messages 四帧漫画」（`notes/day-04-frames.md`）：  
   Frame0 仅 user → Frame1 assistant+tool_call → Frame2 tool_result → Frame3 最终文本  

### 验（30min）

不看文件，默写 `AgentDecision` 可能的形态（允许用自然语言）；再打开 `types.ts` 对照，差几条补几条。

### 记（20min）

**今日交付物：** mapping 表 + 四帧漫画；三角图升级为 v2（带 messages）。

---

## Day 5（4h）— 手工构造合法 / 非法 messages

**今日目标：** 对「对话协议」过敏：非法序列能指出炸点。

### 学（60min）

任选 OpenAI 或 Anthropic 官方「Messages / Tool use」文档，精读角色与 tool 块字段。

**必答题：**

1. `tool_call_id` / `tool_use_id` 存在的意义？  
2. 多个 tool_call 一轮时，tool_result 应如何回传？  
3. system 消息是否应每轮重复发送？代价是什么？  

### 做（150min）

创建 `src/messages/fixtures.ts`（或 `.json`）：

1. `validRoundTrip`：完整一轮（user → assistant tool_calls → tool → assistant final）  
2. `invalidMissingToolResult`：有 tool_call 无 result  
3. `invalidOrphanToolResult`：有 result 无对应 call  
4. `invalidRoleOrder`：role 顺序错误  

再写 `src/messages/lint.ts`：`lintMessages(messages) => string[]`（返回问题列表）。  
单测至少覆盖上述 4 个 fixture。

### 验（35min）

给同学/自己讲解：为什么「把 tool 结果当普通 user 字符串糊进去」长期会不稳。

### 记（25min）

**今日交付物：** fixtures + lint + 测试绿。

---

## Day 6（7h）— 实现单轮 Tool Calling（Fake 先，真模型后）

**今日目标：** 跑通「模型提议 → 你执行 → 再问模型」的**单轮**（还未 while 多步）。

### 学（60min）

重读 Day3 的 `tool-use-agent.md` 里「单轮」子集；浏览你选的 SDK 官方 tool calling 示例（只看一轮）。

### 做（280min）

1. `src/tools/add.ts`、`src/tools/get-time.ts`：纯函数 + schema  
2. `src/fake-model.ts`：根据 messages 末尾内容，**确定性**返回 tool_call 或最终文本（可用简单字符串匹配：含「加」→ add；含「几点」→ get_time）  
3. `src/single-round.ts`：  

```text
call model → if tool_calls → validate → execute → append results → call model again → print final
```

4. 打印每一步的 **原始 JSON**（打码 secret）到 `traces/day-06-*.json`  
5. 写 `notes/day-06-diff.md`：`completion-only` vs `tool-round` 对照（输入、控制流、失败点）  

若有 API Key：再写 `src/real-model.ts` 最小封装，用**同一** `single-round` 跑 2 个 goal；无 Key 则跳过，但 fake 路径必须演示 2 个 goal。

### 验（50min）

故障：让 fake 返回错误参数类型；确认走 `validateToolArgs`，进程不崩，错误进下一轮 messages。

### 记（30min）

**今日交付物：** `single-round` 可跑；至少 2 个 goal 成功；diff 笔记。

---

## Day 7（7h）— 第三工具、并行调用概念、周验收

**今日目标：** 巩固 Week1；闭卷达标才能进 Week2。

### 学（50min）

查阅「parallel tool calls」：模型一轮返回多个 tool_call 时 harness 如何执行（串行也可，但要说清取舍）。

### 做（260min）

1. 第三工具 `src/tools/word-count.ts`  
2. 扩展 `fake-model`：支持一轮返回 **两个** tool_call；`single-round` 全部执行再汇总  
3. 整理 Week1 代码结构，补 README：`D:/learn-agent-lab/README.md`（如何跑测试与 day6 demo）  
4. 周记素材：列出本周 10 个「我曾误解」  

### 验（70min）— 闭卷周测（≥8/10 才过）

不看资料作答 `notes/week1-exam.md`：

1. Agent 与单次补全的本质差  
2. Harness 六块  
3. 谁执行工具  
4. required 缺失谁拒绝  
5. 画出单轮 tool 序列（角色）  
6. 解释 additionalProperties:false  
7. fakeModel 在训练里的作用  
8. 非法 tool 序列一例  
9. 本仓 `AgentDecision` 三种 type（允许先凭记忆）  
10. 下周要造的 Registry 职责三句话  

做完对答案（自查总览与 types），改错。

### 记（40min）

`notes/day-07.md` + 更新三角图 v3。

**本周门禁：** Schema 10 测绿；单轮 fake 多工具；周测 ≥8/10；`lab/README.md` 存在。

→ 下一周：[month-01-week2.md](./month-01-week2.md)
