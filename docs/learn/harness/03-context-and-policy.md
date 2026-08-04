# Month 3 · Context + Policy（Outer Harness）

**时长：** 约 4 周  
**前置：** [02-verify-and-trace.md](./02-verify-and-trace.md)

---

## 本阶段目标

分清两层 harness：

| 层 | 在本仓库 | 职责 |
|---|---|---|
| **Inner** | `src/harness/*` | 单次 run 的 loop / tools / verify / trace |
| **Outer** | `AGENTS.md`、`.cursor/rules`、CI、release cadence | 给**写代码的 agent**注入规则与反馈 |

学会 **feedforward**（事先约束）与 **feedback**（事后传感器）：

- Feedforward：项目规则、目录地图、禁止项、工具说明  
- Feedback：测试、lint、CI、Trace、人工 review  

**产出门槛：**

1. 一版你自己维护的高质量学习笔记用 `AGENTS.md`（或扩展本仓个人约定小节）  
2. 一条**可复现的 agent 任务剧本**（输入 → 期望步骤 → 验收命令）

---

## 必读

### 内仓

- [`AGENTS.md`](../../../AGENTS.md)  
- [`.cursor/rules/free-myself.mdc`](../../../.cursor/rules/free-myself.mdc)  
- [`src/harness/README.md`](../../../src/harness/README.md) — slice → test → commit → push  
- CI workflows（若有）：看 push/PR 跑了什么  

### 外读

- [Harness Engineering 总览](https://harness-engineering.net/)  
- [amux — Harness Engineering](https://amux.io/guides/harness-engineering/)（Guides / Context pipelines）  
- Anthropic / 社区关于 `AGENTS.md`、长任务上下文的实践文（见 [resources.md](./resources.md)）

---

## 动手任务

### Task 1：解剖 outer harness

用表格列出本仓至少 8 条「约束」，标注类型：

- 上下文注入（读什么文件）  
- 禁止项（不提交什么）  
- 反馈环（什么命令必须绿）  
- 流程（一个 slice 如何结束）

### Task 2：写任务剧本

模板：

```markdown
## Goal
...

## Allowed tools / files
...

## Forbidden
...

## Acceptance
- [ ] npm test
- [ ] 具体文件变更说明
- [ ] Trace / 截图（如适用）
```

用 Cursor / 任一 coding agent 跑一遍；记录：哪里靠规则避免了跑偏，哪里仍失败。

### Task 3：上下文卫生

练习「少而准」：

- 长日志不要整段塞进 prompt，只留摘要或路径指针  
- 规则文件保持可 review、可版本化（和代码一样）

---

## Policy 在本仓库的含义

`runAgentLoop` 的 `policy` 可以是：

- 手写状态机（测试 / 确定性流程）  
- 将来换成「调用 LLM + 解析 tool call」  

Month 3 重点不是接大模型，而是：**先把决策接口与上下文边界设计清楚**，模型只是 policy 的一种实现。

---

## 检查清单

- [ ] 能讲清 inner vs outer harness  
- [ ] 任务剧本跑通至少一次  
- [ ] 理解「release cadence」为何属于 harness（流程即护栏）  
- [ ] 周记：一次 agent 跑偏复盘（规则缺了什么）  

---

## 下一阶段

→ [04-mcp-and-sdk.md](./04-mcp-and-sdk.md)：MCP 与 Agents SDK。
