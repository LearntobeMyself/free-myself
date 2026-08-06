# Day 3 细案 · Building Effective Agents + 三种模式（约 4h）

> 上级：[month-01-week1.md](./month-01-week1.md) · 总览：[month-01-plan.md](./month-01-plan.md)  
> 精读：[Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)  
> **今日目标：** 分清 workflow 与 agent；交出 3 份可朗读伪代码 + 3 分钟口述

---

## 开场 — 今天要交什么

1. `notes/patterns/prompt-chain.md`  
2. `notes/patterns/router.md`  
3. `notes/patterns/tool-use-agent.md`  
4. `notes/day-03-java-map.md`（三种模式 ↔ Spring/Java）  
5. `notes/day-03.md` + 口述录音路径（3 分钟）  
6. 必答题三题（每题 ≥4 句）  

**今天不做：** 写 Registry/loop 生产代码；只允许伪代码与笔记。

---

## 时段 A · 学（90min）

### A1（0:00–0:50）精读 Building Effective Agents

边读边标：何时用 agent、何时用固定工作流、工具失败如何反馈。

### A2（0:50–1:30）必答题

1. 文中认为何时该用 Agent，何时不该？  
2. 「简单可组合模式」比重框架更稳的原因？  
3. 工具调用失败后，理想反馈长什么样？  

---

## 时段 B · 做（130min）

### B1（1:30–2:20）三模式伪代码

每个文件必须含：适用场景、伪代码（可朗读成代码）、失败模式 ≥3 条。

1. `prompt-chain.md`：多步 prompt 固定流水线（无动态选工具）  
2. `router.md`：分类后再走不同分支  
3. `tool-use-agent.md`：while tool_use（为 Day6 埋伏笔）  

### B2（2:20–3:00）Java 映射

`notes/day-03-java-map.md`：三种模式分别像 Spring 里的什么（Pipeline / Strategy / 状态机）。写清「像在哪 / 不像在哪」。

### B3（3:00–3:20）对照本仓一句

打开 [`docs/harness.md`](../../harness.md)，用一句话回答：Free Myself mini harness 更接近三模式里的哪一个？为什么？

---

## 时段 C · 验（30min）

录音 **3 分钟**：只讲「为什么工具调用 Agent 需要 Harness」。路径写入 `notes/day-03.md`。

闭卷：默写三种模式各一句话定义。

---

## 时段 D · 记（20min）

```markdown
# Day 03
## 必答题
## 三模式路径
## 本仓更像哪种模式
## 口述文件路径
## 明日坑（Day4：Anatomy + 映射到 src/harness）
## 用时实际
```

---

## 收工清单

- [ ] 三份 patterns 伪代码  
- [ ] Java 映射笔记  
- [ ] 口述 3 分钟  
- [ ] 必答题  
- [ ] 未提前写 Day6 loop  

## 卡住时

| 现象 | 处理 |
|---|---|
| 英文文太长 | 先读小标题与结论段，再回填必答题 |
| 分不清 router 与 agent | router 分支表是静态的；agent 的下一步由模型/policy 动态定 |

→ [month-01-day04.md](./month-01-day04.md)
