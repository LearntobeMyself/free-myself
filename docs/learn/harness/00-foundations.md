# Month 0 · 地基：LLM 与 Tool Calling

**时长：** 1–2 周（约 20–30 小时）  
**前置：** 有一点 Java 后端即可；TypeScript / Python 会读代码就行。

**第一个月逐日计划（小白 → 落地）：** 先跟 [month-01-plan.md](./month-01-plan.md) 打卡；本页是阶段目标与检查清单。

---

## 本阶段目标

搞清楚三件事：

1. **补全（completion）** 与 **工具调用（tool calling）** 的差别  
2. **模型只提议调用，Harness 才真正执行**  
3. 消息角色（system / user / assistant / tool）与 JSON Schema 参数长什么样  

**产出门槛：** 能口述上面三点，并手写一个约 50 行的 `while tool_use` 循环（Python 或 TS）。

---

## 概念速记（Java 对照）

| Agent 概念 | 你可以怎么想 |
|---|---|
| Model | 无状态函数：输入上下文 → 输出文本或「想调哪个工具」 |
| Tool schema | 接口契约（类似 OpenAPI / 方法签名 + JSON Schema） |
| Harness / Orchestrator | 控制器：解析工具调用 → 执行 → 把结果塞回对话 → 再问模型 |
| Agent loop | `while` 直到「无工具调用」或「预算用尽」 |
| Trace | 每次决策与工具结果的审计日志 |

记住：**模型从不直接碰数据库或文件系统**；它只返回结构化意图。

---

## 必做练习

### 练习 A：读两篇（各做 5 条笔记）

1. [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)  
2. [LangChain — The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)

笔记至少回答：

- Agent 与「单次聊天补全」差在哪？  
- Harness 里至少有哪几块？  
- 为什么简单可组合模式往往比重框架更稳？  

### 练习 B：手写最小 loop

伪代码（你必须自己敲一遍可运行的）：

```text
messages = [user_goal]
loop:
  response = model(messages, tools)
  append assistant message
  if no tool_calls: return final text
  for each tool_call:
    validate args against schema
    result = execute(tool_call)   # 你的代码，不是模型
    append tool_result
```

可用任意官方 SDK 的 tool-calling 示例（OpenAI / Anthropic）。  
工具先做 1–2 个：`get_time`、`add_numbers` 即可。

### 练习 C：对照本仓库（只读）

打开并标出对应关系：

- [`src/harness/types.ts`](../../../src/harness/types.ts) — `AgentDecision` / `TraceStep`  
- [`src/harness/loop.ts`](../../../src/harness/loop.ts) — `runAgentLoop`  
- [`docs/harness.md`](../../harness.md) — 产品地图  

本阶段**不必改代码**，但要能指出「policy / tool / verify / stop」在哪里。

---

## 检查清单

- [ ] 能画一张「模型 ↔ Harness ↔ 工具」三角图  
- [ ] 能解释 malformed tool args 时该由谁报错、如何回注给模型  
- [ ] 本地跑通最小 loop，至少成功调用一个工具  
- [ ] 周记一篇（标题建议：`Agent = Model + Harness：先搭骨架再谈聪明`）  

---

## 下一阶段

→ [01-loop-and-tools.md](./01-loop-and-tools.md)：吃透本仓库 Loop + ToolRegistry，并贡献一个真实工具。
