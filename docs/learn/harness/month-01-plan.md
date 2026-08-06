# 第一个月 · 深度总览（小白 → 自研 Harness → 合入本仓）

> **不是「读一读」**：每天必须有代码交付与验收。  
> 负荷：**工作日 3.5–4h** · **周末 7h** · 全月约 **110–120h**  
> Lab 语言：**TypeScript** · Lab 目录：仓库外 `D:/learn-agent-lab/`（勿写入产品代码）  
> 对应阶段：[00-foundations.md](./00-foundations.md) + [01-loop-and-tools.md](./01-loop-and-tools.md) 前半

## 逐日文件（从这里点进去）

| 周 | 文件 | 主题 |
|---|---|---|
| Week 1 | [month-01-week1.md](./month-01-week1.md) | 协议 / Schema / 首轮 tool call（Day 1–7） |
| Week 2 | [month-01-week2.md](./month-01-week2.md) | 自研完整 mini harness（Day 8–14） |
| Week 3 | [month-01-week3.md](./month-01-week3.md) | 精读 Free Myself `src/harness` + 对照（Day 15–21） |
| Week 4 | [month-01-week4.md](./month-01-week4.md) | 合入第一个工具 + 实验 + 月考（Day 22–28） |

---

## 公式（背熟）

```text
Agent = Model + Harness
Harness = Loop + Tools + Context + Verify + Trace + Guardrails
```

模型只返回「想调什么」；**执行、校验、预算、落盘全是你的代码。**

---

## 每天四段（缺一不可）

每个 Day 都按同一版式书写，你执行时也按同一顺序：

1. **学**（60–90min）：材料 + 编号必答题  
2. **做**（120–150min，周末更长）：具体文件 / 函数 / 命令  
3. **验**（30–45min）：闭卷 / 故障注入 / 口述  
4. **记**（20–30min）：笔记模板，有最低字数  

**今日交付物交不出 = 当天未完成，禁止跳天。**

### 收工笔记模板（复制到 `D:/learn-agent-lab/notes/day-NN.md`）

```markdown
# Day NN
## 概念（≥3 条，每条 ≥2 句）
## 代码路径（文件 + 函数）
## 今天搞坏又修好的一件事
## 明日最大坑
## 用时实际：Xh
```

---

## 月末硬产出门禁（少一项 = 月未过关）

| # | 产出 | 过关标准 |
|---|---|---|
| 1 | Lab harness v1 | `ToolRegistry` + `runLoop` + `maxSteps` + schema 校验 + 错误回注 + JSONL trace |
| 2 | Fake / Real | `fakeModel` 全流程绿；有 API Key 时真模型至少 5 个 goal |
| 3 | 故障注入报告 | ≥6 场景：未知工具、缺参、类型错、工具抛异常、死循环、超预算 |
| 4 | 本仓精读笔记 | types / registry / tools / loop / trace-store / loop.test 各一份对照表 |
| 5 | 产品工具 | `normalize_whitespace` 合入 `createWorkbenchRegistry` + Vitest（正常/非法/边界） |
| 6 | 描述质量实验 | 含糊 vs 高密度 description 对照记录 |
| 7 | 周记 ×2 | 各 ≥1500 字（架构图 + 代码 + 失败复盘） |
| 8 | 口述 | 5 分钟讲 loop + 3 分钟讲「无模型 policy 也能跑」 |

**本月明确不做：** MCP、多 Agent 框架、训练模型、大改 Document Studio / PPT。

---

## Lab 脚手架（Day 1 建好）

```text
D:/learn-agent-lab/
  package.json          # "type": "module", tsx, vitest, zod, typescript
  tsconfig.json
  src/
    schema.ts           # Week1 起
    fake-model.ts
    tools/
    registry.ts         # Week2
    loop.ts             # Week2
    trace.ts            # Week2
    index.ts
  tests/
  traces/               # gitignore
  notes/
    day-01.md …
  reports/
    fault-injection.md  # Week2
    description-ab.md   # Week4
```

命令基线：

```bash
cd D:/learn-agent-lab
npm init -y
npm i zod
npm i -D typescript tsx vitest @types/node
npx tsc --init
```

API Key **只进环境变量**（如 `OPENAI_API_KEY`），永不进 git、永不进本仓 `data/`。

无 Key：全程用 `fakeModel`；有 Key：Week2 起加真模型对照，不替代 fake 验收。

---

## 本仓环境（并行）

```bash
cd "D:/DESKTOP/free myself"   # 或你的 clone 路径
node -v    # 20+
npm install
npm test
npm run dev   # http://localhost:3000/learn/harness
```

产品代码只在 **Week 4** 按任务改；Week 1–2 只读对照。教学性临时改动必须还原，且不提交无关文件。

---

## 周门禁（不过不准进下一周）

| 周 | 必须齐 |
|---|---|
| W1 | Schema 校验器 + 10 测绿；单轮 tool call（fake）跑通；周末闭卷 ≥8/10 |
| W2 | 完整 lab loop + JSONL trace；故障报告 ≥6 行；周记 #1 ≥1500 字 |
| W3 | 六模块对照笔记齐；状态机图；本仓 `loop.test.ts` 能讲解；算法 ≥5 题 |
| W4 | 工具合入 + 测试绿；描述 A/B；月考通过；周记 #2；口述录音 |

---

## 卡住规则

- 同一问题空转 **>45min**：写下「已试过什么」再查文档/提问  
- 想学 MCP / LangGraph：记到「Month 4 清单」，本月禁止开坑  
- 一次只做一个工具 / 一个模块；红测试不提交  

---

## 今日启动（站内可勾选）

- [ ] 读完本页（负荷、四段式、月末门禁）
- [ ] 打开站内 [Day1 细案](/learn/harness/month-01-day01)（或 [Week1 索引](/learn/harness/month-01-week1)）
- [ ] 完成 Day1 全部四段与收工清单

下一枪只做 Day 2，禁止跳周。
