# Day 1 细案 · 环境 + 总纲 + 三层请求对照（约 4 小时）

> 上级：[month-01-week1.md](./month-01-week1.md) · 总览：[month-01-plan.md](./month-01-plan.md)  
> **今天唯一目标：** 环境就绪 + 真正搞懂「模型只提议、Harness 才执行」  
> Lab：`D:/learn-agent-lab/`（已可脚手架） · 本仓学习页：`http://localhost:3000/learn/harness`

---

## 开场（5min）— 今天要交什么

交不出下面 4 样，不算完成 Day 1：

1. 终端打印 `lab-ok`  
2. `D:/learn-agent-lab/notes/day-01.md`（含 ≥400 字概念段 + 必答题）  
3. 三层对照表（每格 ≥2 句）  
4. 三角图 v1：`Model ↔ Harness ↔ Tools`  

**今天不做：** Schema 编码、while loop、改 `src/harness`、申请一堆 API Key。

---

## 时段 A · 学（70min）

### A1（0:00–0:25）读总纲 — 建立地图

打开并精读（可边读边高亮）：

1. [README.md](./README.md) — 公式、岗位、本仓对照表  
2. [month-01-plan.md](./month-01-plan.md) — 负荷、四段式、月末门禁  

**边读边写（笔记草稿区）：**

- 用自己的话抄一遍：`Agent = Model + Harness`  
- 列出 Harness 六块：`Loop / Tools / Context / Verify / Trace / Guardrails`（先抄，后面闭卷）  
- 一句话：本月你要在 lab 里造什么？  

### A2（0:25–0:50）读地基概念表 — Java 对照

打开 [00-foundations.md](./00-foundations.md) 的「概念速记」表。

对每一行，在笔记写「Java 里我见过的类似东西」：

| 概念 | 你必须写的一句 |
|---|---|
| Model | 像什么？（提示：无状态函数 / 远程调用） |
| Tool schema | 像什么？（提示：接口 + OpenAPI） |
| Harness | 像什么？（提示：编排器 / 工作流引擎） |
| Agent loop | 像什么？（提示：while + 状态） |
| Trace | 像什么？（提示：审计日志 / 链路追踪） |

### A3（0:50–1:10）必答题 — 先答再核对

在 `notes/day-01.md` 写完三题（每题 ≥4 句，禁止一句话糊弄）：

1. **为什么 raw model 不是 Agent？**  
   提示：有没有状态、会不会自己执行工具、有没有停止条件。  
2. **Harness 六块各一句话**  
   必须六句，不能合并糊弄。  
3. **Java 类比**  
   - 谁最像 `ToolRegistry`？  
   - 谁最像 `runAgentLoop`？  
   写清「像在哪、不像在哪」。  

---

## 时段 B · 做（140min）

### B1（1:10–1:40）本仓跑通 + 打开学习页

在 Free Myself 根目录执行：

```bash
npm install
npm test
npm run dev
```

浏览器打开：

- http://localhost:3000/learn/harness  
- 点开路线里「第 1 月 · W1 / Day1」相关条目，确认文档链能点  

若 `npm test` 红：先修环境（Node 20+），今天别往下假装完成。

**检查点：** 学习页能打开；终端测试全绿。

### B2（1:40–2:25）搭 Lab 脚手架

若 `D:/learn-agent-lab` 已由助手建好，直接验证；否则自己建：

```bash
cd D:/learn-agent-lab
npm install
npx tsx -e "console.log('lab-ok')"
npx vitest run
```

目录应类似：

```text
D:/learn-agent-lab/
  package.json
  tsconfig.json
  vitest.config.ts
  src/smoke.ts
  tests/smoke.test.ts
  notes/day-01.md
  .gitignore
```

**检查点：** 终端出现 `lab-ok`；vitest 至少 1 个测试绿。

### B3（2:25–3:10）三层对照表（核心思考，别抄答案）

在 `notes/day-01.md` 填完整张表，**每格 ≥2 句**：

| 层 | 请求长什么样 | 谁执行副作用（写库/调 API/读文件） | 失败谁先负责 |
|---|---|---|---|
| 普通 HTTP API（如 Spring Controller） | | | |
| Chat Completions（纯文本，无 tools） | | | |
| Tool Calling 一轮（有 tool_calls） | | | |

自检问题（写在表下）：

- 纯 Chat 时，模型说「我已经删了文件」——真的删了吗？  
- Tool Calling 时，是模型删的，还是你的代码删的？  
- 参数缺字段时，应该模型「感觉不对」，还是 Harness 校验拒绝？  

### B4（3:10–3:30）三角图 v1

在 `notes/day-01-triangle.md`（或画在纸上拍照路径记入笔记）画出：

```text
        [Model]
       提议 tool_call
          ↑↓ messages
      [Harness/Loop]
       校验并执行
          ↓
       [Tools]
```

必须标出：

1. 谁产生 `tool_call`  
2. 谁 `execute`  
3. `tool_result` 回到哪里  

---

## 时段 C · 验（35min）

### C1（3:30–3:50）闭卷默写

合上所有文档，在 `notes/day-01-recall.md` 默写：

1. Harness 六块名称  
2. 展开解释（≥5 句）：**「模型从不直接碰文件系统」**  
   必须提到：提议 vs 执行、校验、把错误回注给模型，中至少 3 点  

### C2（3:50–4:05）对照改错

打开资料，用红笔/删改标注默写错误；把最终正确版贴回 `day-01.md` 末尾「验收订正」。

---

## 时段 D · 记（25min，4:05–4:30）

补全 `notes/day-01.md` 模板：

```markdown
# Day 01
## 概念（≥3 条，每条 ≥2 句）
## 必答题（三题全文）
## 三层对照表
## 代码路径（本仓命令 + lab 路径）
## 今天搞坏又修好的一件事
## 明日最大坑（提示：Day2 是 JSON Schema + validateToolArgs）
## 用时实际：Xh
## 验收订正
```

概念段合计 **≥400 字**（不含表格）。

---

## 收工清单（全部勾完才能睡）

- [ ] `npm test`（本仓）绿  
- [ ] `/learn/harness` 能打开  
- [ ] `lab-ok` 打印成功  
- [ ] lab `vitest` 绿  
- [ ] 必答题三题写完  
- [ ] 对照表每格 ≥2 句  
- [ ] 三角图 v1  
- [ ] 闭卷默写 + 订正  
- [ ] `day-01.md` 概念 ≥400 字  

---

## 卡住时

| 现象 | 处理 |
|---|---|
| Node 版本旧 | 装 Node 20 LTS，重开终端 |
| npm install 慢/失败 | 换网络或配置镜像后再装；装好之前不要假装完成 |
| 不懂 Tool Calling | 先只比较「纯 Chat」vs「有人替模型执行函数」；细节 Day5–6 再挖 |
| 想写 loop | 停；那是 Day6+ 的事 |

---

## 做完 Day 1 之后

打开 [month-01-week1.md](./month-01-week1.md) 的 **Day 2**：JSON Schema + `validateToolArgs`。  
把今天的 `day-01.md` 路径发我，我可以帮你批必答题是否过关。
