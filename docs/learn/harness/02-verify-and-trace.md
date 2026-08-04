# Month 2 · Verify + Trace（确定性优先）

**时长：** 约 4 周  
**前置：** [01-loop-and-tools.md](./01-loop-and-tools.md)

---

## 本阶段目标

建立一条硬原则：

> **校验与评测优先用确定性工具；模型只负责自然语言理解与提议。**

学会：步数/成本预算、工具失败回注、停止条件、用 Trace 排障（先看工具与校验，再怪模型）。

**产出门槛：** 一次「故意让工具或校验失败 → 轨迹可诊断」的演示（截图或本地 replay 说明即可）。

---

## 必读路径

### 内仓

- Loop 中的 `verify` 分支：[`src/harness/loop.ts`](../../../src/harness/loop.ts)  
- Trace 落盘：[`src/harness/trace-store.ts`](../../../src/harness/trace-store.ts)  
- FormatSpec：[`src/lib/format-spec.ts`](../../../src/lib/format-spec.ts)  
- 工具 `ingest_spec`：[`src/harness/tools.ts`](../../../src/harness/tools.ts)  
- 文档工坊与 doc-engine：[`docs/harness.md`](../../harness.md)、`services/doc-engine/`  
- UI 文案对照：`/workbench/traces`（「出错先看工具和校验」）

### 外读

- [amux — Harness Engineering Guide](https://amux.io/guides/harness-engineering/) 中 Sensors / feedback 部分  
- 面试向：[Design an AI Agent](https://www.systemdesign.academy/interview/design-ai-agent) 里 budget / guardrails / traces

---

## 动手任务

### Task 1：读一条真实轨迹

在本地跑一次会写 Trace 的流程（open-loop / harness 测试 / 你 Month 1 的工具），打开 `/workbench/traces`：

- 标出 `thought` / `tool` / `observe` / `verify` / `decision`  
- 写 3 条「如果这里失败，下一跳该怎么修」

### Task 2：故意失败

任选其一：

- 给工具非法参数，确认错误以**结构化结果**回到观察，而不是把整个进程打崩  
- 让 verify 返回 fail，观察 loop 如何记录并停止/重试  

写出：**故障注入步骤 → 期望轨迹 → 实际轨迹**。

### Task 3：FormatSpec 链路

走通「NL/JSON → `ingest_spec` → 规范化 FormatSpec」：

- 合法 spec 与非法 spec 各一例  
- 说明：为什么排版要用 Format Spec + verifier，而不是「让模型直接美化 Word」

---

## 预算与停止（必记）

生产 harness 至少要有：

| 控制 | 作用 |
|---|---|
| max steps / max turns | 防死循环 |
| wall-clock / cost ceiling | 防烧钱 |
| loop detection | 同一失败动作反复出现则停 |
| verify gate | 未通过不得宣称完成 |

本仓库已有 step budget；Month 5 再扩展成本与护栏概念。

---

## 检查清单

- [ ] 能解释「模型自评」为什么不够  
- [ ] 有一份失败轨迹复盘（可放进周记）  
- [ ] 能讲清 FormatSpec 在 harness 里扮演的 verify 角色  
- [ ] 算法题保持每周 4–6  

---

## 下一阶段

→ [03-context-and-policy.md](./03-context-and-policy.md)：上下文工程与 outer harness（AGENTS.md / CI）。
