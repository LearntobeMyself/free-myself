# Month 1 · Loop + Tools（吃透本仓库）

**时长：** 约 4 周  
**前置：** [00-foundations.md](./00-foundations.md)

**衔接：** 日历「第一个月」的第 3–4 周已在 [month-01-plan.md](./month-01-plan.md) 里启动本阶段（跑测试、读 harness、加第一个工具）。从该计划第 5 周起，按下面 W2–W4 继续。

---

## 本阶段目标

把 Free Myself 的 mini harness 读透，并**亲手加一个工具**走完：注册 → 循环调用 → 测试 → Trace 回放。

**产出门槛：**

1. 一张你自己画的时序图（goal → policy → tool → observe → …）  
2. 一个合入（或本地可演示的）工具 + Vitest  
3. 笔记：你改了哪里、为什么工具描述和 schema 比「提示词花活」更重要  

---

## 必读代码（按顺序）

1. [`src/harness/types.ts`](../../../src/harness/types.ts)  
2. [`src/harness/registry.ts`](../../../src/harness/registry.ts) — `ToolRegistry`、`describeForAgent`  
3. [`src/harness/tools.ts`](../../../src/harness/tools.ts) — `echo_structured` / `assert_schema` / `ingest_spec`  
4. [`src/harness/loop.ts`](../../../src/harness/loop.ts) — `runAgentLoop`  
5. [`src/harness/loop.test.ts`](../../../src/harness/loop.test.ts) — 手写 policy 的 smoke  
6. [`src/harness/trace-store.ts`](../../../src/harness/trace-store.ts)  

外读：[Addy Osmani — Agent Harness Engineering](https://addyosmani.com/blog/agent-harness-engineering/)

---

## 动手任务

### Task 1：跟读 smoke 测试

运行：

```bash
npm test -- src/harness/loop.test.ts
```

对照测试里的 policy：它如何决定下一步工具、何时 `stop`。

### Task 2：加一个真实小工具

在 `createWorkbenchRegistry()` 中注册一个**确定性**工具，例如：

- `normalize_whitespace`：清洗字符串并返回长度  
- 或与文档相关的纯函数（禁止引入密钥、禁止写任意路径）  

要求：

- 清晰的 `name` / `description` / 参数 schema  
- Vitest：正常路径 + 非法参数路径  
- 可选：跑一次 loop 并在 `/workbench/traces` 看到步骤  

### Task 3：工具描述质量

写一段对比笔记：

- 含糊描述 → 模型乱选工具  
- 高密度描述（动词 + 边界 + 返回形态）→ 更稳  

原则：**工具定义按代码一样 review**，不要写成给人类看的说明书散文。

---

## 周计划建议

| 周 | 焦点 |
|---|---|
| W1 | 读完 types / registry / loop，画时序图 |
| W2 | 实现工具 + 单测 |
| W3 | 接进 loop / Trace，写失败参数用例 |
| W4 | 复盘笔记 + 外站周记；复习 4–6 道算法 |

---

## 检查清单

- [ ] 能不看文件背出 loop 的退出条件（完成 / 预算 / 校验失败策略）  
- [ ] 新工具有测试且 `npm test` 绿  
- [ ] Trace 里能看到 `tool` / `observe` 步骤  
- [ ] 理解：本仓库 policy 可以是「手写决策」——模型不是必须的  

---

## 下一阶段

→ [02-verify-and-trace.md](./02-verify-and-trace.md)：确定性校验与可诊断轨迹。
