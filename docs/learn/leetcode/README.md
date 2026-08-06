# 力扣刷题总纲 · 刀刃时间表

> Free Myself · 与 [Harness 学习](../harness/README.md) 并行  
> 主清单：**NeetCode 150**（模式清晰、覆盖面够求职）  
> 冲刺备选：时间 &lt; 6 周时改啃 **Blind 75** 重叠题，不另开第三套题单

## 为什么选这条路（调研结论）

| 清单 | 何时用 |
|---|---|
| **NeetCode 150** | 默认。按模式排序，适合 8–12 周系统准备，国内外大厂编码面覆盖面够 |
| **Blind 75** | 只剩 4–6 周冲刺时，优先做与 NC150 重叠的高频题 |
| 随机刷 / 只刷 Hard | 禁止。浪费时间且形不成模式 |

原则：

1. **按模式刷**，不按题号乱跳  
2. **卡 20–25 分钟**仍无清晰思路 → 看题解 → 自己重写 → 3 天后复做  
3. 每题留下：模式名、复杂度、边界、坑点（写在笔记，不是抄题解）  
4. 语言先用 **Java**（你的后端优势）；思路通了再视需要补 TS  

参考：

- https://neetcode.io/roadmap  
- Blind 75 / NeetCode 150 对比与节奏讨论（2025–2026 求职向）  

---

## 与 Harness 的时间切分（工作日）

| 块 | 时长 | 内容 |
|---|---|---|
| Harness | 3.5–4h | 跟 `docs/learn/harness` 细案 |
| 力扣 | **45–70min** | 本目录 Day 计划：**1 题主做 + 可选 1 题复盘** |
| 周末 | 力扣可加到 2h | 复盘本周错题 + 限时模拟 1 题 |

力扣不和 Harness 抢整晚；**每天一题保质**胜过三题糊弄。

---

## 第一个月 Week 1（Day1–7）

主题：**Arrays & Hashing**（NC150 第一桶，面试出场率最高）  
索引页：[week1.md](./week1.md) · 细案 Day1–7 已齐

| Day | 细案 | 题目（LeetCode） | 模式 |
|---|---|---|---|
| 1 | [week1-day01.md](./week1-day01.md) | [217. Contains Duplicate](https://leetcode.cn/problems/contains-duplicate/) | Hash Set |
| 2 | [week1-day02.md](./week1-day02.md) | [242. Valid Anagram](https://leetcode.cn/problems/valid-anagram/) | 计数 / Hash |
| 3 | [week1-day03.md](./week1-day03.md) | [1. Two Sum](https://leetcode.cn/problems/two-sum/) | Hash Map |
| 4 | [week1-day04.md](./week1-day04.md) | [49. Group Anagrams](https://leetcode.cn/problems/group-anagrams/) | 分组 Hash |
| 5 | [week1-day05.md](./week1-day05.md) | [347. Top K Frequent Elements](https://leetcode.cn/problems/top-k-frequent-elements/) | 频次 + 桶/堆 |
| 6 | [week1-day06.md](./week1-day06.md) | [238. Product of Array Except Self](https://leetcode.cn/problems/product-of-array-except-self/) | 前缀积 |
| 7 | [week1-day07.md](./week1-day07.md) | [128. Longest Consecutive Sequence](https://leetcode.cn/problems/longest-consecutive-sequence/) + 周复盘 | Set 扫 |

站点打卡：[/learn/leetcode](/learn/leetcode) →「点亮今日」，备注写题号。

---

## 每题固定流程（15 分钟协议）

1. 读题 + 自举 2 个例子 + 边界（空、单元素、重复、负数）  
2. 说出暴力解与目标复杂度  
3. 编码（Java）  
4. 自测用例  
5. 若超时看题解：只学模式，合上重写  
6. 笔记 8–12 行进 `D:/learn-agent-lab/notes/lc/day-0N.md`  

---

## 后续周预告（先别提前刷爆）

- W2：Two Pointers + Sliding Window  
- W3：Stack + Binary Search  
- W4：Linked List 入门  

全部仍走 NeetCode roadmap，不另起炉灶。
