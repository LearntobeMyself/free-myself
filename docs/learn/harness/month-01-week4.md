# 第一个月 · Week 4（Day 22–28）合入工具 · 实验 · 月考

> 总览：[month-01-plan.md](./month-01-plan.md) · 上周：[month-01-week3.md](./month-01-week3.md)  
> 目标：把确定性工具合进 Free Myself；完成描述 A/B；通过月考；周记 #2  
> 改产品代码时：只改本任务相关文件；`npm test` 绿再提交（学习者自己的 commit 节奏按 `AGENTS.md`）

---

## Day 22（4h）— 工具契约冻结 + 描述两版

**今日目标：** 不写实现也能量化「好描述」。

### 学（60min）

重读 Week3 规格书；读一段「Writing effective tool descriptions」类材料（MCP/Anthropic 工具写作指南任选）。

**必答题：** 高密度描述必须包含哪三类信息？举反例一句。

### 做（150min）

1. 冻结 `notes/week4-tool-spec.md`：  
   - name: `normalize_whitespace`  
   - input: `{ text: string }`  
   - 行为：trim + 连续空白→单空格  
   - output: `{ text, length }`  
   - 错误：缺字段 / 非 string  
2. 写出 **A 含糊 description** 与 **B 高密度 description**  
3. 在 lab 实现同名工具（先在 lab 跑通），5 个用例测绿  
4. 算法题 1  

### 验（30min）

用 fake policy「易混淆工具」：再注册一个 `trim_only`，看含糊描述下是否会选错（用脚本化 fake 选择逻辑模拟）。记入 `reports/description-ab.md` 草稿。

### 记（20min）

**今日交付物：** lab 版 normalize 测绿；A/B 文案；规格冻结。

---

## Day 23（4h）— 合入本仓 `tools.ts`

**今日目标：** 产品 registry 拥有新工具。

### 学（40min）

再读 [`tools.ts`](../../../src/harness/tools.ts) 的 `createWorkbenchRegistry` 注册模式。

### 做（170min）

1. 在本仓实现 `normalize_whitespace` 并 `register`  
2. 新增测试文件，例如 `src/harness/normalize-whitespace.test.ts`（或并入现有测试）：  
   - 正常：`"  a   b  "` → `"a b"`  
   - 纯空白  
   - 缺 text  
   - text 为 number  
   - 已是规范字符串  
3. `npm test` 全绿  
4. 更新你笔记中的「本仓工具列表」  

### 验（30min）

用 registry.execute 手动想一遍非法路径；确认无 throw 冲出。

### 记（20min）

**今日交付物：** 本仓工具 + 测试绿（可先本地 commit，push 按你的网络/节奏）。

---

## Day 24（4h）— Policy 测试接上新工具

**今日目标：** 新工具进入 loop 叙事，不只是单元函数。

### 学（40min）

对照 [`loop.test.ts`](../../../src/harness/loop.test.ts) 结构。

### 做（170min）

1. 新测试：`runAgentLoop` + policy：先 `normalize_whitespace`，成功后 `stop`  
2. 再写一条失败路径：非法 input → policy 见 `lastOk===false` → `stop` reason=failed  
3. `npm test`  
4. 若有 persist 条件，跑一次并在 Trace UI 查看步骤（无则 JSON 打印 steps）  
5. 算法题 1  

### 验（30min）

讲解该测试给「假设的面试官」：它证明了什么（工具契约 / 观察回传 / 停止条件）。

### 记（20min）

**今日交付物：** loop 级测试两条绿。

---

## Day 25（4h）— 描述质量 A/B 实验写完

**今日目标：** `reports/description-ab.md` 成文，有过程有结论。

### 学（40min）

回顾 Addy / amux 里关于 tool interface 的论述（笔记金句）。

### 做（160min）

实验设计（固定用 fake 决策器，避免真模型费用噪声）：

1. 工具集：`normalize_whitespace` + `trim_only`（lab 或测试内临时工具）  
2. 10 条用户意图样本（如「把多余空格去掉但保留单词间单空格」vs「只去首尾」）  
3. 策略：基于 description 关键词的简易检索选工具（模拟「模型扫描述」）  
4. 记录 A/B 各自选对率  
5. 结论：改描述是否优于加模型参数（本实验范围内）  

写成 `reports/description-ab.md`（≥800 字）。

### 验（40min）

把 B 描述贴进本仓工具 description（若 A/B 显示 B 更好），保证测试仍绿。

### 记（20min）

**今日交付物：** description-ab 报告。

---

## Day 26（4h）— Lab 与本仓对齐收尾 + Trace 对照

**今日目标：** 差异清单关闭；演示包可给别人跑。

### 学（30min）

重读总览月末门禁表，逐项打勾预检。

### 做（180min）

1. 更新 lab README：一键 `vitest`、demo、看 traces  
2. 更新 `notes/week2-vs-freemyself.md` 为终版（标注「已对齐/故意保留差异」）  
3. 打包演示：录一张 GIF 或文字脚本「从 goal 到 trace」  
4. 算法题 1  

### 验（30min）

冷启动：新终端只按 README 能否跑通（自己演一次）。

### 记（20min）

**今日交付物：** lab README 终版；对照终表。

---

## Day 27（7h）— 月考（闭卷）+ 口述

**今日目标：** 证明深度，不是刷完清单。

### 学（20min）

只复习自己的笔记目录结构（不可狂抄源码）。

### 做 / 验（360min）— 月考试卷

在 `notes/month-exam/` 闭卷完成（建议严格计时 3h 笔试 + 1h 口述准备）：

#### A. 架构默写（30min）

1. 默写公式与六块  
2. 画出 lab loop 流程图（含 budget、fault stop）  
3. 画出本仓 decision 三分支  

#### B. 代码填空（40min）

1. 写出 `ToolResult` 形状  
2. 写出 `validateToolArgs` 失败时应返回什么  
3. 写出 policy 签名（可用伪 TS）  
4. 解释为何工具 throw 要在 registry 边界转换  

#### C. 故障分析（40min）

给出三段虚构 trace（自拟或用你 reports 里的），各用 ≤8 句定位根因与修复层。

#### D. 设计题（40min）

「为文档工坊增加一个 `count_headings` 工具」：写 schema、description、3 测、在 loop 中如何 verify。

#### E. 口述（准备 40min + 录制 8min）

1. 5 分钟：白板讲 Agent loop  
2. 3 分钟：本仓无模型 policy  

路径写入 `notes/month-exam/oral.md`。

### 记（40min）

对照源码与笔记改卷；错题订正 ≥1 页。

**今日交付物：** 月考全套 + 口述录音 + 订正。

---

## Day 28（7h）— 周记 #2、门禁终检、下月衔接

**今日目标：** 对外输出；第一个月正式结业。

### 学（40min）

浏览 [02-verify-and-trace.md](./02-verify-and-trace.md) 开头，列下月 Week1 预告任务 5 条。

### 做（300min）

1. **周记 #2**（≥1500 字）发布，建议标题：  
   `在 Free Myself 合入第一个 Harness 工具：从 Schema 到 Trace`  
   必含：本仓 PR/commit 说明、测试、A/B 结论、月考反思  
2. 把两篇周记链接记到待写入 `/learn/harness` 文章索引的清单（可改 `learning-journal.ts` 的 posts，另开 slice 也行）  
3. 终检总览门禁表 8 项，全部打勾或写明缺口与补课日  
4. 整理作品夹：`reports/`、`notes/repo/INDEX.md`、月考订正  
5. 休息：写「第二个自然月」日历占位（接 Month1 后半 + Month2）  

### 验（50min）

请他人按你的 README 跑 lab 一测 + 本仓 `npm test -- src/harness`；记录外部反馈。

### 记（30min）

**本周 / 本月门禁：** 工具合入；A/B 报告；月考过；周记 #2；口述齐；总览 8 项齐。

→ 回到 [01-loop-and-tools.md](./01-loop-and-tools.md) 收尾 W2–W4 未尽项，然后进入 [02-verify-and-trace.md](./02-verify-and-trace.md)。
