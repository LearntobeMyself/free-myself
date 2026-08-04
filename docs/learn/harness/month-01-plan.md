# 第一个月细化计划 · 从小白到落地

> 对应总纲里的 **Month 0（地基）+ Month 1 前半（开始摸本仓库）**  
> 时长：4 周 · 每周约 **15–18 小时**（工作日 2h × 5 + 周末 5–8h）  
> 你有一点 Java 后端即可；本月不要求会训练模型。

配套总览：[00-foundations.md](./00-foundations.md) → 第 3–4 周接 [01-loop-and-tools.md](./01-loop-and-tools.md)

---

## 这一个月结束时，你必须交出的东西

| # | 产出 | 怎么算过关 |
|---|---|---|
| 1 | 口述 60 秒 | 说清：模型只提议工具调用，Harness 才执行；没有 loop 就不是 Agent |
| 2 | 三角图一张 | 纸上或 Excalidraw：`Model ↔ Harness ↔ Tools`，标出 messages 往返 |
| 3 | 可运行最小 loop | 本地脚本，至少调用成功 1 次工具（`add` 或 `get_time`） |
| 4 | 本仓库对照笔记 | 指出 `policy` / `tool` / `verify` / `stop` 在哪些文件、哪类类型上 |
| 5 | 跑通 harness 测试 | `npm test -- src/harness/loop.test.ts` 绿，并能用自己的话解释 policy |
| 6 | 周记 2 篇 | 第 2 周末 + 第 4 周末各一篇（CSDN/掘金均可） |

**本月不做：** 加 MCP、接生产模型平台、改 Document Studio 大功能、死磕 Transformer 公式。

---

## 环境准备（第 1 天晚上做完，约 1 小时）

在仓库根目录：

```bash
node -v          # 建议 20+
npm install
npm test         # 应全绿；若红，先修好环境再开学
npm run dev      # 浏览器打开 http://localhost:3000/learn/harness
```

再建一个**旁路练习目录**（不要和产品代码搅在一起），任选其一：

- `D:/learn-agent-lab/`（推荐独立小文件夹）  
- 或本仓外的 `agent-lab/`  

语言：**Python 或 TypeScript 二选一**（Java 同学更熟哪门就用哪门；官方 tool-calling 示例更全的是 Py/TS）。

准备：

- [ ] 一个可用的 LLM API Key（OpenAI / 国产兼容 OpenAI 协议的都行）；**只放环境变量，永不提交 git**  
- [ ] 笔记本：本地 Markdown 或语雀均可，目录建议 `week1/` … `week4/`  
- [ ] 收藏本页 + [resources.md](./resources.md)

---

## 每日模板（每天收工前勾选）

```text
[ ] 今天学了什么（3 条以内）
[ ] 今天敲/读了哪段代码
[ ] 还有哪个词不懂（明天优先）
[ ] 算法（第 3 周起）：是否做了 1 题
```

卡住超过 45 分钟：写下「卡点 + 已试过什么」，再问人或查文档；不要空转。

---

## 第 1 周 · 建立世界观（约 15h）

**主题：** 聊天补全 ≠ Agent；先会讲，再动手。  
**对应：** Month 0 前半。

### Day 1（2h）— 安装 + 读总纲

- [ ] 做完「环境准备」  
- [ ] 精读 [README.md](./README.md)（总纲）到「每周固定节奏」  
- [ ] 用自己的话写 5 行：`Agent = Model + Harness` 是什么意思  
- [ ] 打开 `/learn/harness`，点开本页，确认路线图能用  

**收工题：** Harness 里有哪 6 块？（Loop / Tools / Context / Verify / Trace / Guardrails）

### Day 2（2h）— Java 对照表吃透

- [ ] 抄写 [00-foundations.md](./00-foundations.md) 里的「概念速记」表到笔记，每格加一句自己的例子  
- [ ] 类比练习：把 `ToolDefinition` 想成「带 JSON 参数的 Service 接口」；把 `runAgentLoop` 想成「带预算的编排器」  
- [ ] 画三角图第一版（丑没关系）  

### Day 3（2.5h）— 必读文 1

读：[Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)

笔记必须回答（各 2–4 句）：

1. Workflow 和 Agent 差在哪？  
2. 文中推荐从简单模式起步的原因？  
3. 工具调用在流程里处在哪一步？  

### Day 4（2.5h）— 必读文 2

读：[LangChain — The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)

笔记必须回答：

1. 为什么说 raw model 不是 agent？  
2. Harness 至少包含哪些部件？  
3. 和 Free Myself 公式哪些能对上号？  

### Day 5（2h）— 消息与 Schema 扫盲

自学（任选官方文档一节即可）：

- Chat messages：`system` / `user` / `assistant` / `tool`（或 `tool_result`）  
- Tool / function schema：`name`、`description`、`parameters`（JSON Schema）  

练习：手写一个工具契约（不用跑）：

```text
name: add_numbers
description: 将两个数字相加，返回 { sum: number }
parameters: { a: number, b: number } 均为必填
```

用 Java 思维检查：缺字段时谁报错？——应是 **Harness 校验**，不是模型「感觉」。

### Day 6–7 周末（5–6h）— 第一次「真的调用工具」

目标：**跑通 SDK 官方 tool-calling 示例一次**（还不必写完整 while loop）。

- [ ] 按 OpenAI 或 Anthropic 官方「function/tool calling」快速入门敲一遍  
- [ ] 工具实现：`add_numbers(a, b)` 本地函数  
- [ ] 打印：模型返回的 tool call 名称与参数 → 你执行 → 把结果再发给模型  
- [ ] 在笔记里贴一段（可打码 key）「assistant 要调工具」的原始结构  

**周末检查：**

- [ ] 能口述：单次 completion 和「带工具的一轮」差在哪  
- [ ] 三角图第二版：补上「tool_result 回到 messages」  

---

## 第 2 周 · 手写最小 Loop（约 16h）

**主题：** 把「一轮工具」变成 `while`；你就是 Harness。  
**对应：** Month 0 后半。产出 #3。

### Day 8（2h）— 伪代码默写

不看资料，默写 [00-foundations.md](./00-foundations.md) 里的 loop 伪代码，再对照修正。

额外写清两个退出条件：

1. 模型不再请求工具 → 正常结束  
2. `max_turns` / 步数到了 → 强制停止  

### Day 9–10（2h + 2.5h）— 实现 50 行级 loop

在 `agent-lab` 里实现：

```text
messages = [user_goal]
while turns < MAX:
  response = model(messages, tools)
  append assistant
  if no tool_calls: return text
  for call in tool_calls:
    if args invalid: result = { ok:false, error:"..." }  # 回注，别崩进程
    else: result = execute(call)
    append tool_result
```

要求：

- [ ] `MAX` 默认 5–8  
- [ ] 至少 2 个工具：`add_numbers`、`get_time`（或 `echo`）  
- [ ] 非法参数走错误回注分支（可手工构造错误测一次）  

### Day 11（2h）— 对照本仓库（只读）

打开这些文件，在笔记里填表「文件 → 职责 → 我看到的关键符号」：

| 文件 | 你要找到的 |
|---|---|
| [`src/harness/types.ts`](../../../src/harness/types.ts) | `AgentDecision`、`TraceStep`、`ToolDefinition` |
| [`src/harness/loop.ts`](../../../src/harness/loop.ts) | `runAgentLoop`、`PolicyFn`、`maxSteps` |
| [`docs/harness.md`](../../harness.md) | 产品地图一句话总结 |

**本周仍不要改产品代码。**

### Day 12（2h）— 口述 + 周记草稿

- [ ] 对着手机录音 60 秒讲「模型 vs Harness」  
- [ ] 起草周记：《Agent = Model + Harness：先搭骨架再谈聪明》  

### Day 13–14 周末（5–6h）— 固化产出

- [ ] 最小 loop 再跑 3 个目标句（例如「3+5 是多少」「现在几点」）  
- [ ] 发布周记 #1，链接记到稍后要加进 `/learn/harness` 索引的清单里  
- [ ] Month 0 检查清单全部勾完（见 [00-foundations.md](./00-foundations.md)）  

**第 2 周门禁（不过不准进第 3 周改仓库）：**

- [ ] 可运行 loop  
- [ ] 三角图定稿  
- [ ] 能指出本仓 `AgentDecision` 的三种 `type`：`tool` / `verify` / `stop`  

---

## 第 3 周 · 落地本仓库：读懂 + 跑通（约 16h）

**主题：** 从旁路 lab 切到 Free Myself `src/harness`。  
**对应：** [01-loop-and-tools.md](./01-loop-and-tools.md) W1。

### Day 15（2h）— 跑测试当说明书

```bash
npm test -- src/harness/loop.test.ts
```

- [ ] 打开 [`src/harness/loop.test.ts`](../../../src/harness/loop.test.ts)  
- [ ] 逐步注释：policy 第 1 步调什么、第 2 步调什么、何时 `stop`  
- [ ] 笔记标题：`手写 policy = 没有模型的 Agent`  

### Day 16（2.5h）— `types.ts` + `registry.ts`

- [ ] 精读 [`types.ts`](../../../src/harness/types.ts)：`ToolResult.ok` 为何重要  
- [ ] 精读 [`registry.ts`](../../../src/harness/registry.ts)：`register` / `execute` / `describeForAgent`  
- [ ] 用 Java 话总结：Registry ≈ `Map<String, ToolDefinition>` + 统一执行入口  

### Day 17（2.5h）— `tools.ts` 三个现成工具

读 [`tools.ts`](../../../src/harness/tools.ts)：

- [ ] `echo_structured` 干什么  
- [ ] `assert_schema` 干什么  
- [ ] `ingest_spec` 和 FormatSpec 的关系（先建立印象，Month 2 再深挖）  

### Day 18（2h）— `loop.ts` 主路径

带着问题读 [`loop.ts`](../../../src/harness/loop.ts)：

1. `maxSteps` 默认多少？用尽后 status 是什么？  
2. `decision.type === "tool"` 时，成功/失败如何变成 `observe`？  
3. `verify` 分支把结果写到哪里？  

### Day 19（2h）— 时序图（产出 #4 加强）

自画一张（必须含）：

```text
goal → thought → policy → tool → observe → policy → … → stop/verify
```

对照 `TraceStep.type`：`thought` | `tool` | `observe` | `verify` | `decision`。

### Day 20–21 周末（5h）— Trace UI + 算法启动

- [ ] `npm run dev` → 打开 `/workbench/traces`，看文案「出错先看工具和校验」  
- [ ] 读 [`trace-store.ts`](../../../src/harness/trace-store.ts)：run 如何落盘（了解路径即可，勿提交 `data/**/*.json`）  
- [ ] 算法启动：本周完成 **4 题**（数组/哈希即可），记到 `/learn/leetcode` 思路草稿  

**第 3 周门禁：**

- [ ] 不看文件能说出 loop 的三种决策  
- [ ] 时序图能给别人讲懂  
- [ ] harness 单测绿且你能讲解  

---

## 第 4 周 · 开始改代码：设计你的第一个工具（约 16h）

**主题：** 落地「加一个确定性小工具」的设计与骨架；测通优先，完美其次。  
**对应：** Month 1 Task 2 启动（若本周只完成设计+半实现也算达标，但力争测通）。

### 推荐工具（选一个，别贪多）

`normalize_whitespace`：

- 输入：`{ text: string }`  
- 行为：裁剪首尾空白、把连续空白压成单空格  
- 输出：`{ ok: true, data: { text, length } }`  
- 非法：缺 `text` 或类型不对 → `{ ok: false, error: "..." }`  

### Day 22（2h）— 写工具契约（先文档后代码）

在笔记写清：

- [ ] `name` / `description`（高密度：动词 + 边界 + 返回形态）  
- [ ] parameters JSON Schema  
- [ ] 3 个用例：正常 / 全空格 / 缺字段  

对比练习：再写一版「含糊 description」，并写一句它会怎样害模型。

### Day 23–24（2.5h + 2.5h）— 注册进 `createWorkbenchRegistry`

- [ ] 在 [`tools.ts`](../../../src/harness/tools.ts) 实现并 `register`  
- [ ] 在测试里：直接 `registry.execute(...)` 测正常 + 非法  
- [ ] `npm test` 全绿  

### Day 25（2h）— 可选：接到 hand-written policy

仿 `loop.test.ts` 写一条短测试：policy 调用你的新工具 → `stop`。  
（接模型不是本月目标。）

### Day 26（2h）— 外读一篇工程文

读：[Addy Osmani — Agent Harness Engineering](https://addyosmani.com/blog/agent-harness-engineering/)  
笔记 5 条：哪些句子能用来面试开场。

### Day 27–28 周末（5–6h）— 周记 #2 + 月复盘

周记建议标题：《我在 Free Myself 里读懂了 Agent Loop》

必须包含：

1. 你的时序图（可文字版）  
2. 新工具的契约与测试结论  
3. 一句原则：**工具定义要像代码一样 review**  

月复盘勾选：

- [ ] 本页顶部 6 项产出全齐  
- [ ] 算法本月累计 ≥ 8 题  
- [ ] 清楚下周 Month 1 后半要做什么：Trace 回放加强、工具描述对比笔记、补完未完成测试  

---

## 每周时间怎么切（怕没时间就看这个）

| 块 | 占比 | 例子 |
|---|---|---|
| 理论 | 30% | 必读文、概念对照、口述 |
| 代码 | 50% | lab loop、读 harness、加工具 |
| 输出 | 20% | 笔记整理、周记、时序图 |

压缩版（每周只有 10h）：保住 **Day 的「代码」任务**，必读文改「只答笔记三问」，算法减到每周 2 题。

---

## 卡点速查

| 症状 | 先做什么 |
|---|---|
| API Key / 账单搞不定 | 先用「假模型」：手写一个 `fakeModel()` 固定返回 tool_call，照样练 loop |
| TS 语法怕 | lab 用 Python；读本仓时只盯类型名与控制流 |
| 读 loop.ts 晕 | 先只跟 `loop.test.ts` 的调用链，再回 loop |
| 想一口气学 MCP / LangGraph | 停下；本月范围以外的都记到「Month 4 清单」 |
| 想改很多文件 | 一次只加一个工具；红测不提交 |

---

## 与总纲阶段的衔接

```text
第 1–2 周  = Month 0 完成
第 3–4 周  = Month 1 启动（读懂 + 第一个工具）
第 5 周起  = 继续 01-loop-and-tools.md 的 W2–W4
             （Trace 回放、描述质量笔记、算法 4–6/周）
```

第一个月结束后，打开 [01-loop-and-tools.md](./01-loop-and-tools.md) 检查清单，把未勾项当作第 5 周任务。

---

## 今日就做（从这里开始）

1. `npm install && npm test && npm run dev`  
2. 读完本页到「第 1 周」  
3. 完成 **Day 1** 全部勾选  
4. 把 Day 1 笔记路径记下来  

下一枪：按 Day 2 抄概念表，不要跳周。
