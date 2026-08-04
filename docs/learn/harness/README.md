# Harness Agent 学习总纲

> Free Myself · 5 个月从零到大厂可面  
> 公式：`Agent = Model + Harness`  
> `Harness = Loop + Tools + Context + Verify + Trace + Guardrails`

本目录是站内 [Harness 学习](/learn/harness) 的课程本体。先读本页，再按阶段文档推进；笔记发到 CSDN / 掘金后，回链到学习页索引。

---

## 你要成为什么样的人

**主路线：Harness / Agent 工程**（造循环、工具、校验、轨迹、MCP）  
**辅路线：后端 + Agent 落地**（用已有 Java 扛编码面与业务系统感）

| 目标岗位 | 说明 |
|---|---|
| AI 应用 / Agent 平台 / LLM 工程 / 智能体研发 | 主投 |
| 后端（JD 含工具调用 / Agent / RAG） | 备选，用本项目拉开差距 |

**5 个月内不要冲：** 训练大模型、纯算法研究、从零转 ML Research。

---

## 本仓库对照

```text
goal → policy → tool execute → observe → verify → continue | stop
```

| 层 | 代码 | 你要掌握 |
|---|---|---|
| Loop | [`src/harness/loop.ts`](../../../src/harness/loop.ts) | 步数预算、决策、完成 |
| Tools | [`src/harness/tools.ts`](../../../src/harness/tools.ts) / [`registry.ts`](../../../src/harness/registry.ts) | 注册、schema、执行 |
| Trace | [`src/harness/trace-store.ts`](../../../src/harness/trace-store.ts) | 落盘与回放 |
| Spec | [`src/lib/format-spec.ts`](../../../src/lib/format-spec.ts) | 确定性结构 |
| Outer | [`AGENTS.md`](../../../AGENTS.md)、CI | 规则注入与反馈环 |
| 地图 | [`docs/harness.md`](../../harness.md) | 产品架构 |

练兵 UI：`/workbench/traces`、`/workbench/docs`、`/workbench/open-loop`。

---

## 5 个月日历

假设每周 **15–20 小时**。不够就压缩阅读、保住动手与输出。

**现在就开始（第一个月深度日程）：** [month-01-plan.md](./month-01-plan.md)  
每周细分：[W1](./month-01-week1.md) · [W2](./month-01-week2.md) · [W3](./month-01-week3.md) · [W4](./month-01-week4.md)  
负荷约 **110–120h/月**（工作日 3.5–4h，周末 7h）；每天「学/做/验/记」，不是只读。

| 阶段 | 文档 | 核心产出 |
|---|---|---|
| Month 0（1–2 周） | [00-foundations.md](./00-foundations.md) | 口述「模型只提议，Harness 才执行」+ 50 行 loop |
| 第一个月深度打卡 | [month-01-plan.md](./month-01-plan.md) + week1–4 | 自研 lab harness + 故障报告 + 合入本仓工具 + 月考 |
| Month 1 | [01-loop-and-tools.md](./01-loop-and-tools.md) | 给本仓库加 1 个工具 + 测试 + Trace 回放 |
| Month 2 | [02-verify-and-trace.md](./02-verify-and-trace.md) | 失败可诊断的演示轨迹 |
| Month 3 | [03-context-and-policy.md](./03-context-and-policy.md) | 高质量 `AGENTS.md` + 可复现任务剧本 |
| Month 4 | [04-mcp-and-sdk.md](./04-mcp-and-sdk.md) | 最小 MCP server + 与自研 harness 对比笔记 |
| Month 5 | [05-evals-and-prod.md](./05-evals-and-prod.md) + [06-job-ready.md](./06-job-ready.md) | Eval + 简历项目话术 + Agent 系统设计白板 |

外链精选：[resources.md](./resources.md)

---

## 每周固定节奏

1. **理论 30%**：本阶段必读 1–2 篇 + 笔记  
2. **代码 50%**：改本仓库或最小 demo  
3. **输出 20%**：周记发外站，链回 `/learn/harness`

算法维持（Month 1 起）：每周 4–6 题，记在 [`/learn/leetcode`](/learn/leetcode)。

---

## 5 个月结束检查清单

- [ ] 不看框架源码也能画出并实现 agent loop  
- [ ] 能实现并解释：tool registry、schema 校验、verify gate、trace 持久化  
- [ ] 独立做一个 MCP 工具并接到 agent  
- [ ] 用 eval 证明「改 harness」比「换更大模型」更管用  
- [ ] 30 分钟讲完 Free Myself 架构，并回答「模型错了你怎么发现」  
- [ ] 编码面（Java/算法）+ Agent 系统设计面都能完整走一遍  

---

## 怎么用本站

1. 打开 [/learn/harness](/learn/harness) 看路线图  
2. 按阶段读 `docs/learn/harness/*.md`  
3. 在本仓库动手，Trace UI 回放  
4. 发周记 → 把链接加进学习页「文章索引」  
