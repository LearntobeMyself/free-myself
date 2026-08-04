# Month 5b · 求职包装（大厂可面）

**时长：** 与 [05-evals-and-prod.md](./05-evals-and-prod.md) 并行，冲刺投递前 2–3 周加重  
**前置：** Month 0–4 完成度 ≥80%，Month 5a 至少有一组 eval

---

## 目标岗位话术（选一个主叙事）

**主叙事（推荐）：**  
「后端背景 + 自研 Agent Harness：Loop / ToolRegistry / 确定性 Verify / Trace；能用 MCP 接工具，能量化改进。」

**备选叙事：**  
「业务后端，能在系统里安全落地工具调用与 Agent 工作流，懂评测与护栏。」

投递关键词：AI 应用工程师、Agent 平台、LLM 应用开发、智能体研发、工具调用、MCP、Agent 评测。

---

## 作品集：Free Myself Harness（简历三段式）

### 问题

聊天补全无法可靠完成多步工作；缺少工具边界、校验与可回放轨迹时，线上只能「调 prompt」。

### 架构

```text
goal → policy → tools(registry) → observe → verify → trace → stop
```

Inner：`src/harness`；Outer：`AGENTS.md` + CI + slice 发布节奏；文档域：FormatSpec + Python doc-engine。

### 指标（用你真实数字替换）

- 关键任务成功率 / golden 通过率  
- 平均步数、校验拦截次数  
- Trace 可回放比例  
- （可选）MCP 工具数、评测用例数  

面试时准备 **30 分钟讲解 + 10 分钟深挖失败案例**。

---

## 面试题库（每周练 2 道口述）

### Agent 系统设计（必会）

1. 画出 agent control loop，标出谁执行工具  
2. Tool registry 与 schema 校验失败怎么办？  
3. 如何防止无限循环与成本爆炸？  
4. 工作记忆 vs 长期记忆怎么切？  
5. 危险操作如何做人机确认（HITL）？  
6. 如何评测 harness 改动（轨迹级）？  
7. MCP 解决了什么？和「直接写 plugin」差在哪？  
8. 模型胡说完成了，你如何发现？（verify + eval + trace）  

### 编码面（保持）

- 每周 4–6 题，记录在 `/learn/leetcode`  
- Java 后端八股按目标公司清单过一遍（集合、并发、JVM、Spring、MySQL、Redis）  
- 能手写：最小 tool-calling loop（语言不限）

### 行为面

准备 2 个故事：

- 一次 harness/规则改动显著降低失败  
- 一次 agent 跑偏，你如何用反馈环修好  

---

## 投递前 14 天清单

- [ ] GitHub 公开仓库 README 有架构图与「如何跑 test / traces」  
- [ ] `/learn/harness` 路线图完整，周记 ≥6 篇外链  
- [ ] 简历一页：项目子弹指标，不写空泛「熟悉大模型」  
- [ ] 白板默画 loop 3 次，计时 < 5 分钟  
- [ ] Mock：请人（或自己录音）追问 verify / budget / MCP  
- [ ] 目标公司 JD 对照表：你会的打勾，缺口排进最后两周  

---

## 成功标准（与总纲一致）

1. 不看框架也能实现 loop  
2. registry + verify + trace 能讲也能写  
3. 至少一个 MCP 工具  
4. 有 eval 证明 harness 改进有效  
5. 30 分钟讲完 Free Myself  
6. 编码面 + Agent 设计面都能完整走完  

回到总纲：[README.md](./README.md)
