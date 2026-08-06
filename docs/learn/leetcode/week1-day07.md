# Day 7 细案 · 128 Longest Consecutive Sequence + 周复盘（约 60–70min）

> 上级：[week1.md](./week1.md) · 总纲：[README.md](./README.md)  
> NeetCode 150 · **Arrays & Hashing** 第 7 题 + **Week1 闭环**  
> 语言：**Java** 优先

---

## 题目

**[128. Longest Consecutive Sequence（最长连续序列）](https://leetcode.cn/problems/longest-consecutive-sequence/)**

给定未排序整数数组 `nums`，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

要求 **O(n)** 时间。

---

## 模式名

**Hash Set 只从序列起点扩展** — 全部放入 `Set`，仅当 `num-1` 不存在时从 `num` 向后数 `num+1, num+2...`。

---

## 今日目标 / 交付物

交不出下面 5 样，不算完成 Day 7 / Week1：

1. **LeetCode 128 提交通过**（Java，O(n)）  
2. 笔记：`D:/learn-agent-lab/notes/lc/day-07.md`（含**周复盘**章节）  
3. 站点打卡：备注 `128 + W1 review`  
4. **周复盘表**填完（见下文，7 题状态 + 5 题无提示重写）  
5. 确认 **week1 门禁**（见 [week1.md](./week1.md)）

---

## 时段安排（合计 ~60–70min）

| 时段 | 时长 | 做什么 |
|---|---|---|
| 读题澄清 | 10min | O(n) 要求、空数组、重复元素 |
| 暴力与目标复杂度 | 5min | 排序 O(n log n) vs Set O(n) |
| 编码 | 30–35min | Set + 只从起点扩展 |
| 自测 | 5min | 边界用例 |
| 笔记 + 周复盘 | 15min | `day-07.md` + 复盘表 + 选 2 题重写 |

---

## 卡 25 分钟规则

- **0–25min** 若准备排序 → 停：题目要 **O(n)**  
- 关键洞察：**每个数只在「它是区间起点」时被完整扫描**，总 work O(n)  
- 写不出「为何 `contains(num-1)` 能避免重复计数」→ 看 NeetCode 视频 5 分钟 → 合上重写

---

## 读题澄清（10min 清单）

1. `nums = [100,4,200,1,3,2]` → `4`（序列 1,2,3,4）  
2. `nums = [0,3,7,2,5,8,4,6,0,1]` → `9`（0–8）  
3. 数组可有重复：`[1,2,0,1]` → 最长仍为 3（0,1,2）  
4. 空数组 → `0`

---

## 暴力与目标复杂度（5min）

| 方法 | 时间 | 备注 |
|---|---|---|
| 排序后线性扫 | O(n log n) | 不满足题意 |
| Set + 对每个数向两边扩 | O(n²) 最坏 | 未跳过非起点 |
| **Set + 仅起点扩展** | **O(n)** | **目标** |

**目标：O(n) 时间，O(n) 空间**（Set）。

---

## 编码要点（30–35min）

```java
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);

        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue;
            int len = 1;
            while (set.contains(x + len)) {
                len++;
            }
            best = Math.max(best, len);
        }
        return best;
    }
}
```

**检查点：**

- 遍历 **Set** 而非原数组（去重，且逻辑清晰）  
- `x-1` 存在则 `x` 不是起点，**continue**  
- 内层 while 总次数均摊 O(n)

---

## 边界用例列表（自测 5min）

| 用例 | nums | 期望 |
|---|---|---|
| 官方 | `[100,4,200,1,3,2]` | `4` |
| 空 | `[]` | `0` |
| 单元素 | `[1]` | `1` |
| 无连续 | `[10,20,30]` | `1` |
| 全连续 | `[3,2,1,0]` | `4` |
| 重复 | `[1,2,2,3]` | `3` |
| 负数连续 | `[-2,-1,0,1]` | `4` |

---

## 复杂度目标

- **时间 O(n)**：每个元素最多被 while 访问常数次（均摊分析）  
- **空间 O(n)**：HashSet 存 distinct 元素

---

## 与 NeetCode Arrays & Hashing 对齐

- 桶 1 **最后一题** · Set 模式的进阶（不是简单 contains，而是 **O(n) 结构性剪枝**）  
- 完成 NeetCode 150 · Arrays & Hashing 本周 7 题闭环  
- 下一周主题见 [README.md](./README.md)：Two Pointers + Sliding Window

---

## Week1 周复盘（15min，写入 day-07.md）

### 7 题清单自检

| Day | 题号 | 模式 | AC | 笔记 | 无提示重写 |
|---|---|---|---|---|---|
| 1 | [217](./week1-day01.md) | Hash Set | ☐ | ☐ | ☐ |
| 2 | [242](./week1-day02.md) | 频次计数 | ☐ | ☐ | ☐ |
| 3 | [1](./week1-day03.md) | Hash Map 补数 | ☐ | ☐ | ☐ |
| 4 | [49](./week1-day04.md) | 分组 Hash | ☐ | ☐ | ☐ |
| 5 | [347](./week1-day05.md) | 频次 + 桶/堆 | ☐ | ☐ | ☐ |
| 6 | [238](./week1-day06.md) | 前缀积 | ☐ | ☐ | ☐ |
| 7 | 128 | Set 起点扩展 | ☐ | ☐ | ☐ |

**门禁（[week1.md](./week1.md)）：**

- 7 题均有笔记 `notes/lc/day-01..07.md`  
- **至少 5 题**能不看题解重写（今日挑 2 题限时 15min/题，建议 **1 Two Sum** + **238 或 128**）  
- 站点打卡 ≥ 5 天  

### 复盘必答题（每题 ≥2 句）

1. 本周 **Hash Set / Map / 计数 / 前缀** 四者，各举一题说明何时用哪个。  
2. 哪一题卡最久？卡 25 分钟规则有没有执行？  
3. **347** 你选桶还是堆？若 n=10⁵、k=2，哪个更稳？  
4. **238** 为何不能用除法？零元素时会发生什么？  
5. 下一周 Two Pointers 预习：977. Squares of a Sorted Array 与本周数组题有何不同？

### 错题 / 待复做队列

在笔记列出 3 天后要再刷的题号（至少 2 个）：

- 建议默认：**1, 49, 128**（高频 + 本周综合度高）

---

## 可选周末加餐（非必须，Harness 不冲突时）

- 限时 20min 再刷一道桶 1 薄弱题  
- 把 7 份笔记合并扫一遍，补「模式名 + 复杂度」标题，方便日后复习
