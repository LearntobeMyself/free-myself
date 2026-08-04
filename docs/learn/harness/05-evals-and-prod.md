# Month 5a · Evals + 生产硬化

**时长：** 与 [06-job-ready.md](./06-job-ready.md) 共用约 4 周  
**前置：** [04-mcp-and-sdk.md](./04-mcp-and-sdk.md)

---

## 本阶段目标

把 harness 从「能跑」推到「能量化、能护栏、能讲清生产风险」。

**产出门槛：**

1. 一组 golden tasks（≥5）+ 自动化或半自动评分  
2. 一篇短文：用数据说明「改工具描述 / 加 verify」比「换更大模型」更有效（至少一次对照实验）

---

## 必读

- 本仓 evals：[`evals/`](../../../evals/) + `npm test`  
- [CompoundLearn — Building Your First AI Agent](https://www.compoundlearn.ai/topics/building-your-first-ai-agent)（Quality layer）  
- Sensors / guardrails：amux 指南与 [systemdesign.academy Design an AI Agent](https://www.systemdesign.academy/interview/design-ai-agent)

---

## 生产清单（面试也能背）

| 主题 | 你要说得出的点 |
|---|---|
| Evals | golden tasks、回归、轨迹级断言，不只看最终字符串 |
| Guardrails | 输入输出过滤、工具白名单、危险操作 HITL |
| Sandbox | 代码执行隔离、凭证不进模型上下文 |
| Budget | steps / tokens / 美元 / 墙钟 |
| Observability | trace、成本、延迟、工具错误率 |
| Memory | 工作上下文 vs 跨 session 外部状态 |
| Failure | 工具错误结构化回注；进程崩溃可从 checkpoint 恢复 |

---

## 动手任务

### Task 1：Golden tasks

为你 Month 1–2 的工具或 `ingest_spec` 写 ≥5 个用例：

- 输入  
- 期望工具序列或期望产物属性  
- 断言方式（schema / 字段 / 文件存在）  

优先确定性断言；LLM-as-judge 只作补充。

### Task 2：对照实验

固定任务集，对比两版 harness（例如：差工具描述 vs 好描述；无 verify vs 有 verify），记录：

- 成功率  
- 平均步数  
- 失败模式分类  

写进周记，数字要老实。

### Task 3：威胁建模一页纸

假设 agent 能写文件 / 调 HTTP：

- 最坏能干什么？  
- 哪一层拦住（schema / allowlist / sandbox / HITL）？  

---

## 与本仓库对齐

- 新评测可放 `evals/`（命名清晰，不提交 `data/**/*.json` 隐私）  
- 文档排版路径继续强调 Format Spec + verifier  
- 保持：红测试不推送功能 commit  

---

## 检查清单

- [ ] ≥5 golden tasks 可重复跑  
- [ ] 一次 harness 改进的对照数据  
- [ ] 能白板讲生产护栏分层  
- [ ] 同步推进 [06-job-ready.md](./06-job-ready.md)  

---

## 下一阶段

→ [06-job-ready.md](./06-job-ready.md)：作品集、面试题、简历话术。
