# 第一个月 · Week 3（Day 15–21）精读本仓 + 对照实验

> 总览：[month-01-plan.md](./month-01-plan.md) · 上周：[month-01-week2.md](./month-01-week2.md)  
> 目标：把 Free Myself `src/harness` 读到能讲解、能对照 lab、能做小实验（实验后还原，不提交垃圾）  
> 每天强制三件套：**行级笔记 + 与 lab 的 diff 表 + 一个小改观察**  
> 算法：每天 1 题（中等），本周 ≥5，思路记 `/learn/leetcode` 或 `notes/lc/`

---

## 对照笔记模板（每天一份）

保存为 `D:/learn-agent-lab/notes/repo/NN-<module>.md`：

```markdown
# 模块：
## 关键符号（≥5 个）：名字 → 一句话职责
## 控制流（逐步）
## 与 lab 相同点
## 与 lab 差异（设计取舍）
## 小改观察（改了什么 → 测试现象 → 已还原？是/否）
## 遗留问题
```

---

## Day 15（4h）— `loop.test.ts` 当说明书

**今日目标：** 手写 policy 状态机讲得清；明白「无模型 Agent」。

### 学（50min）

通读 [`src/harness/loop.test.ts`](../../../src/harness/loop.test.ts) + [`index.ts`](../../../src/harness/index.ts) 导出。

**必答题：** 测试里 policy 的状态转移画成图（echo → assert → stop / failed）。

### 做（150min）

```bash
cd "<free-myself>"
npm test -- src/harness/loop.test.ts
```

1. 在笔记里逐步注释「若 lastTool 是什么则下一步是什么」  
2. 在 **lab** 写等价测试：`tests/mirror-smoke.test.ts`，用你的 registry 模仿 echo+assert 结构（可用你已有工具串联）  
3. 算法题 1  

### 验（40min）

不看代码默写该 policy；再对照，错则重默。

### 记（30min）

`notes/repo/15-loop-test.md`

**今日交付物：** 本仓测试讲解笔记 + lab mirror 测试绿 + 算法 1。

---

## Day 16（4h）— `types.ts` 深潜

**今日目标：** 每个导出类型都能举使用例。

### 学（60min）

逐行读 [`types.ts`](../../../src/harness/types.ts)。

**必答题：**

1. `TraceStep.type` 五种各自何时出现？  
2. `AgentRunStatus` 四种如何到达？  
3. `VerifierResult.checks` 为何是数组？  

### 做（150min）

1. 填对照笔记 `notes/repo/16-types.md`（符号 ≥8）  
2. 小改观察（**本地临时**）：在 lab 的 step type 里临时删掉一种，看测试哪里痛，然后恢复  
3. 画 `AgentRun` 字段脑图  
4. 算法题 1  

### 验（30min）

闭卷：写出 `AgentDecision` 三种 variant 的 TypeScript 联合类型（允许小语法错，语义要对）。

### 记（20min）

**今日交付物：** types 对照笔记 + 脑图。

---

## Day 17（4h）— `registry.ts`

**今日目标：** 说清 describeForAgent 给谁用。

### 学（50min）

精读 [`registry.ts`](../../../src/harness/registry.ts)。

**必答题：** execute 捕获异常吗？未注册工具返回什么？与你的 lab 哪点不同？

### 做（160min）

1. `notes/repo/17-registry.md`  
2. 小改观察：在本仓临时 `console.log` describe 输出跑一次测试（看完删掉，**不提交**）  
3. 给 lab `describeForAgent` 加快照测试（字段集）  
4. 算法题 1  

### 验（30min）

口述 2 分钟：Registry 与 Spring `ApplicationContext.getBean` 类比哪里成立、哪里不成立。

### 记（20min）

**今日交付物：** registry 笔记 + lab 快照测。

---

## Day 18（4h）— `tools.ts` 三工具

**今日目标：** 读懂 smoke 工具与 `ingest_spec` 的角色（深挖 FormatSpec 留 Month2，但要建立正确印象）。

### 学（70min）

精读 [`tools.ts`](../../../src/harness/tools.ts) + 扫一眼 [`format-spec.ts`](../../../src/lib/format-spec.ts) 导出。

**必答题：**

1. `echo_structured` / `assert_schema` 在测试里如何配合？  
2. `ingest_spec` 输入可以是什么形态？失败时 ToolResult 怎么表现？  
3. 为什么排版要用 FormatSpec，而不是「让模型直接改 docx」？  

### 做（140min）

1. `notes/repo/18-tools.md`  
2. 手写调用：在临时脚本或 vitest 里 `createWorkbenchRegistry().execute("echo_structured", …)`（可写在本仓测试文件草稿，**最终不要提交无关文件**；更推荐在 lab 用复制的最小假工具对照）  
3. 小改观察：给 `echo_structured` 非法 input，记录 error  
4. 算法题 1  

### 验（30min）

写 10 行：`ingest_spec` 在整个 Document Studio 流水线中的位置（可看 `docs/harness.md`）。

### 记（20min）

**今日交付物：** tools 笔记。

---

## Day 19（4h）— `loop.ts` 主路径拆解

**今日目标：** 不看文件能讲清 tool/verify/stop 三分支。

### 学（40min）

带着问题读 [`loop.ts`](../../../src/harness/loop.ts) 全文。

**必答题：**

1. 默认 `maxSteps`？  
2. tool 失败时 `lastOk` 如何影响后续 policy？  
3. verify 失败后 run.status 是什么？  
4. `persist:true` 时谁写盘？  

### 做（170min）

1. `notes/repo/19-loop.md`：按分支画流程图（必须含 verify）  
2. **小改观察（必须做、必须还原）：** 临时把测试里 `maxSteps` 改为 `1`，跑测，记录失败断言，再改回  
3. 在 lab 增加 optional `verify` 回调（最小版：检查 steps 里是否出现某工具），单测一正一反  
4. 算法题 1  

### 验（30min）

录音 3 分钟：只讲本仓「无模型 policy 也能跑」——用于面试。

### 记（20min）

**今日交付物：** loop 流程图笔记；lab verify 最小实现；录音。

---

## Day 20（7h）— `trace-store` + Trace UI + 状态机定稿

**今日目标：** 轨迹从代码到 UI 闭环理解。

### 学（60min）

读 [`trace-store.ts`](../../../src/harness/trace-store.ts)；浏览 `/workbench/traces` UI 文案。

**必答题：** 为什么 UI 强调「先看工具和校验，再怪模型」？

### 做（280min）

1. `notes/repo/20-trace.md`  
2. `npm run dev`，打开 traces 页，截图或文字记录布局（勿提交 `data/traces` 隐私）  
3. 对比 lab JSONL vs 本仓 run JSON：字段映射表 ≥10 行  
4. 定稿两张图（放入 notes）：  
   - 状态机：`running/completed/failed/stopped`  
   - TraceStep 生命周期  
5. 尝试一次本仓 `persist:true` 的调用路径（若有现成 API/测试则跟；若无，则在笔记写「如何接」的设计，不强行污染数据）  
6. 算法题 1（本周凑满 ≥5）  

### 验（50min）

给他人（或自己）讲解一条虚构失败轨迹：3 步内定位该查 registry、policy 还是 verify。

### 记（30min）

**今日交付物：** 映射表 + 两张定稿图。

---

## Day 21（7h）— 综合对照、第二 policy 测试设计、周复盘

**今日目标：** Week3 门禁；为 Week4 合入工具做设计说明书。

### 学（40min）

重读 [01-loop-and-tools.md](./01-loop-and-tools.md) 的 Task2 要求。

### 做（280min）

1. 汇总六份 repo 笔记，写总表 `notes/repo/INDEX.md`  
2. 设计 `normalize_whitespace` 规格书 `notes/week4-tool-spec.md`（schema、用例 5 个、description 高密度版 + 含糊版）  
3. 在本仓**准备**第二个 harness 测试草稿（可先写在笔记里）：policy 调用未来的 normalize 工具；Week4 再落文件  
4. 补齐算法到 ≥5，整理错题  
5. 周复盘：列出「lab 将被本仓纠偏」的 5 点，下周改 lab 或接受差异  

### 验（50min）

闭卷小测 `notes/week3-exam.md`（自拟 8 题：类型、分支、trace、ingest_spec 印象、budget、policy、registry、状态机）自评。

### 记（30min）

**本周门禁：** 六模块笔记齐；状态机图；loop 能讲解；算法 ≥5；工具规格书就绪。

→ 下一周：[month-01-week4.md](./month-01-week4.md)
