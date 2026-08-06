# Day 4 细案 · Anatomy of Harness + 映射到本仓（约 4 小时）

> 上级：[month-01-week1.md](./month-01-week1.md) · 总览：[month-01-plan.md](./month-01-plan.md)  
> 上一天：[month-01-day03.md](./month-01-day03.md) · 下一天：[month-01-day05.md](./month-01-day05.md)  
> 精读：[LangChain — The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)  
> **今日唯一目标：** 外文 Harness 部件能一一落到 Free Myself 文件路径；画出 messages 四帧漫画

Lab：`D:/learn-agent-lab/` · 本仓只读：`src/harness/`、`docs/harness.md`

---

## 开场（5min）— 今天要交什么

交不出下面 5 样，不算完成 Day 4：

1. `D:/learn-agent-lab/notes/day-04-mapping.md`（概念映射表填满，含「我的 lab 将放在哪」列）  
2. `D:/learn-agent-lab/notes/day-04-frames.md`（messages 四帧漫画 + 每帧角色说明）  
3. `D:/learn-agent-lab/notes/day-04-recall.md`（闭卷 `AgentDecision` 默写 + 订正）  
4. 三角图 **v2**（在 Day1 v1 基础上标出 messages 流向）— 路径记入 `notes/day-04.md`  
5. `D:/learn-agent-lab/notes/day-04.md`（必答题三题 + 概念 ≥400 字）

**今天不做：** 写 `lintMessages`、写 `single-round`、改 Free Myself 任何源码、接 API Key。

---

## 时段 A · 学（80min）

### A1（0:00–0:35）精读 LangChain Anatomy 文章

打开 [The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)，边读边在草稿区抄关键词：

- Harness 与 raw model 的分工  
- Loop / state / feedback / constraints 各指什么  
- Tool registry、trace、verification 在文中的位置  

**边读边写（笔记草稿）：**

| 外文词 | 文中一句话定义（你的中文） |
|---|---|
| Harness | |
| Agent loop | |
| State | |
| Feedback | |
| Constraints | |

### A2（0:35–1:00）Java 对照 — 编排 vs 模型

在草稿区回答（每题 ≥3 句）：

1. **Harness 像 Spring 里的什么？**  
   提示：`@Service` 编排、`ApplicationContext`、工作流引擎、AOP 切面——选 1–2 个类比并写「像在哪 / 不像在哪」。  
2. **`PolicyFn` 像什么？**  
   提示：Strategy 接口、规则引擎、或「if-else 决策器」——本仓里 policy 返回 `AgentDecision`，谁调用它？  
3. **`TraceStep` 像什么？**  
   提示：审计日志、`@Slf4j` 结构化日志、分布式 trace span。

### A3（1:00–1:20）必答题 — 先猜再验证

在 `notes/day-04.md` 写三题（每题 ≥4 句，禁止抄标题）：

1. **文中 Harness 的定义用你的话重写**（必须含「执行」「校验」「预算/停止」中至少 2 个词）。  
2. **列出文中 ≥5 个部件，并猜测本仓对应文件**（先猜，下午 B 段再打开文件验证）。  
3. **`state / feedback / constraints` 各举本仓一例**（允许先凭记忆写「我猜是 loop.ts 里 xxx」，下午订正）。

---

## 时段 B · 做（140min）

### B1（1:20–1:50）只读本仓三文件 — 建立符号表

在 Free Myself 根目录，**只读**打开（禁止改）：

1. [`src/harness/types.ts`](../../../src/harness/types.ts) — 重点：`AgentDecision`、`AgentRun`、`TraceStep`、`ToolDefinition`、`ToolResult`  
2. [`src/harness/loop.ts`](../../../src/harness/loop.ts) — 重点：`runAgentLoop`、`PolicyFn`、`VerifyFn`、`maxSteps`  
3. [`docs/harness.md`](../../harness.md) — 重点：Layer 表（Loop / Tools / Trace / Spec / Eval）

另扫一眼（各 5min，仍只读）：

- [`src/harness/registry.ts`](../../../src/harness/registry.ts) — `ToolRegistry.register` / `execute`  
- [`src/harness/trace-store.ts`](../../../src/harness/trace-store.ts) — `appendStep` / `saveRun`  

**检查点：** 能在纸上写出 `AgentDecision` 的三种 `type` 值。

### B2（1:50–2:40）填写映射表 — 核心交付

创建 `D:/learn-agent-lab/notes/day-04-mapping.md`，填满下表（「本仓符号/文件」列必须具体到类型名或函数名）：

| 概念 | 外文说法 | 本仓符号/文件 | 我的 lab 将放在哪 |
|---|---|---|---|
| Loop | orchestration / agent loop | `runAgentLoop` · `src/harness/loop.ts` | `src/single-round.ts`（Day6）→ `src/run-loop.ts`（Week2） |
| Tool registry | tool registry | `ToolRegistry` · `src/harness/registry.ts` | `src/registry.ts`（Week2） |
| Trace | tracing / observability | `TraceStep` · `appendStep` · `trace-store.ts` | `traces/*.json`（Day6 起） |
| Decision | policy / next action | `AgentDecision` · `PolicyFn` · `types.ts` | `src/fake-model.ts` 返回值（Day6） |
| Verify | verification / eval | `VerifierResult` · `VerifyFn` · `loop.ts` 中 verify 分支 | Week2 `src/verify.ts` |
| State | run state | `AgentRun`（`steps` / `artifacts` / `status`） | messages 数组 + run meta（lab） |
| Feedback | observe / tool result | `type:"observe"` step · `ToolResult` 回注 policy | tool role message 回注（Day5–6） |
| Constraints | budget / guardrails | `maxSteps` · `run.status` stopped | `maxSteps` 常量（Week2） |
| Tools | side effects | `ToolDefinition.execute` · `tools.ts` | `src/tools/*.ts`（Day6 起） |
| Context | goal / messages | `LoopOptions.goal` · 未来 messages | `messages[]`（Day5 起） |

**参考核对（写完再对照，差项补进「验收订正」）：**

- `AgentDecision` 三种形态：`tool` / `verify` / `stop`  
- loop 里 tool 执行后必有 `observe` step  
- trace 落盘路径：`data/traces/{run.id}.json`（本仓产品侧）

### B3（2:40–3:20）messages 四帧漫画

创建 `notes/day-04-frames.md`，按下面模板画四帧（ASCII 或 Mermaid 均可，但必须标 **role** 与 **关键字段**）：

```text
Frame 0 — 仅 user
  [user] "帮我把 3 和 5 加起来"
  messages.length === 1

Frame 1 — assistant 提议 tool_call
  [assistant] content 可为空或简短说明
              tool_calls: [{ id, name:"add", arguments:"{\"a\":3,\"b\":5}" }]
  ⚠ 此时还没有 tool_result

Frame 2 — tool 回传结果
  [tool] tool_call_id 必须对上 Frame1 的 id
         content: "{\"sum\":8}" 或等价 JSON 字符串
  ⚠ role 是 tool，不是 user

Frame 3 — assistant 最终自然语言
  [assistant] "3 加 5 等于 8。"
              无 tool_calls（或空数组）
```

每帧下写 **2 句**：Harness 在这一帧做了什么？模型在这一帧做了什么？

**Java 类比（写在 frames 文件末尾）：**

- Frame1 的 `tool_calls` ≈ Controller 收到「请调用某 Service 方法」的 **意图 DTO**，尚未执行  
- Frame2 的 `tool_result` ≈ Service 返回值包装成 **统一 Response**  
- 把 tool 结果当普通 user 字符串塞进去 ≈ 把 HTTP 500 堆栈直接当 200 body 返回——协议层就乱了

### B4（3:20–3:40）三角图 v2

复制 Day1 的 `notes/day-01-triangle.md` 为 `notes/day-04-triangle-v2.md`，新增：

```text
        [Model]
    读 messages → 提议 tool_call 或 final text
          ↑↓  messages[]（四帧协议）
      [Harness/Loop]
   lint → validate → execute → append tool_result
          ↓                    ↑
       [Tools]            [Trace JSON]
```

必须标出：Frame0→3 各落在三角图的哪条边上。

---

## 时段 C · 验（30min）

### C1（3:40–4:00）闭卷默写 AgentDecision

合上所有文件，在 `notes/day-04-recall.md` 写：

1. `AgentDecision` 三种 `type` 及每种必填字段（允许自然语言，不必一字不差）  
2. `runAgentLoop` 收到 `decision.type === "stop"` 时做什么？（≥3 步）  
3. tool 执行失败后，loop 会不会立刻 exit？引用 `observe` step 说明  

### C2（4:00–4:10）对照订正

打开 `types.ts` 与 `loop.ts`，红笔改 `day-04-recall.md`；把正确版摘要贴进 `day-04.md` 末尾「验收订正」。

---

## 时段 D · 记（20min，4:10–4:30）

补全 `notes/day-04.md`：

```markdown
# Day 04
## 概念（≥3 条，每条 ≥2 句，合计 ≥400 字）
## 必答题（三题全文）
## 映射表路径
## 四帧漫画路径
## 三角图 v2 路径
## AgentDecision 闭卷订正摘要
## 今天搞错又改对的一件事
## 明日最大坑（Day5：非法 messages 序列 + lintMessages）
## 用时实际：Xh
```

---

## 收工清单（全部勾完才能睡）

- [ ] LangChain 文章读完，草稿关键词表完成  
- [ ] 映射表 9 行填满（含 lab 列）  
- [ ] 四帧漫画每帧有 Harness/Model 各 2 句  
- [ ] 三角图 v2 含 messages 与 trace  
- [ ] 闭卷 AgentDecision + 订正  
- [ ] 必答题三题 ≥4 句/题  
- [ ] 概念段 ≥400 字  
- [ ] **未改** Free Myself 源码  

---

## 卡住时

| 现象 | 处理 |
|---|---|
| 英文文章太长 | 先读小标题 + 结论段，再按映射表反查正文 |
| 猜不对本仓文件 | 在 repo 根 `rg "AgentDecision\|ToolRegistry\|appendStep" src/harness` |
| 四帧和三角图对不上 | 以 Frame 编号为准重画；三角图只画数据流，不画 UI |
| 想写 lint / single-round | 停；Day5–6 的事 |

---

## 做完 Day 4 之后

→ 下一枪：[month-01-day05.md](./month-01-day05.md)（messages fixtures + `lintMessages`）  
→ 回顾周计划：[month-01-week1.md](./month-01-week1.md) Day 5 节
