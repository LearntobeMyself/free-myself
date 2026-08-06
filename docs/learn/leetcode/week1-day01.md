# Day 1 细案 · 217 Contains Duplicate（约 45–55min）

> 上级：[week1.md](./week1.md) · 总纲：[README.md](./README.md)  
> NeetCode 150 · **Arrays & Hashing** 第 1 题  
> 语言：**Java** 优先

---

## 题目

**[217. Contains Duplicate（存在重复元素）](https://leetcode.cn/problems/contains-duplicate/)**

给定整数数组 `nums`，若存在任一值出现至少两次，返回 `true`；否则 `false`。

---

## 模式名

**Hash Set 查重** — 用集合 O(1) 判断「是否见过」。

---

## 今日目标 / 交付物

交不出下面 3 样，不算完成 Day 1：

1. **LeetCode 提交通过**（Java，`Solution` 类）  
2. 笔记：`D:/learn-agent-lab/notes/lc/day-01.md`  
3. 站点打卡：[/learn/leetcode](/learn/leetcode) → 备注 `217`

**笔记必含：** 模式名、暴力 vs 最优复杂度、边界用例结果、1 个坑点（如：能否原地改数组？本题不行）。

---

## 时段安排（合计 ~45–55min）

| 时段 | 时长 | 做什么 |
|---|---|---|
| 读题澄清 | 10min | 读题 + 自举 2 例 + 确认返回值与约束 |
| 暴力与目标复杂度 | 5min | 说出暴力 O(n²) → 目标 O(n) 时间、O(n) 空间 |
| 编码 | 25–35min | Java 实现 HashSet 一遍扫描 |
| 自测 | 5min | 跑边界用例（见下表） |
| 笔记 | 10min | 写入 `day-01.md`，合上题解后口头复述思路 |

---

## 卡 25 分钟规则

- **0–25min** 仍无清晰思路（说不出「Set 存见过的数」）→ **停止硬扛**  
- 看 NeetCode / 官方题解 **只看思路 3 分钟** → 合上重写  
- 笔记写：**卡在哪**（例：没想到 Set，一直在想排序）  
- **3 天后**（Day 4 前后）安排 15min 无提示复做 217

---

## 读题澄清（10min 清单）

1. 空数组 `[]` → `false`（无重复）  
2. 单元素 `[1]` → `false`  
3. `[1,2,3,1]` → `true`  
4. 约束：`1 <= nums.length <= 10^5`，元素可正可负  
5. 问清自己：**允许排序吗？** 可以，但 Set 更直观；**允许 extra space 吗？** 可以

---

## 暴力与目标复杂度（5min）

| 方法 | 时间 | 空间 | 面试怎么说 |
|---|---|---|---|
| 双重循环 | O(n²) | O(1) | 「能过小数据，大数据不行」 |
| 排序后相邻比较 | O(n log n) | O(1) 或 O(n) | 可行备选 |
| **HashSet 一遍扫** | **O(n)** | **O(n)** | **目标解，首选** |

---

## 编码要点（25–35min）

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) return true;
        }
        return false;
    }
}
```

**检查点：**

- `HashSet.add` 返回 `false` 表示已存在 → 一行判重  
- 未使用禁止的「修改输入」技巧（本题也不必要）

---

## 边界用例列表（自测 5min）

| 用例 | 输入 | 期望 |
|---|---|---|
| 空 | `[]` | `false` |
| 单元素 | `[42]` | `false` |
| 相邻重复 | `[1,1]` | `true` |
| 不相邻重复 | `[1,2,3,1]` | `true` |
| 全相同 | `[7,7,7,7]` | `true` |
| 负数 | `[-1,-2,-1]` | `true` |
| 大长度抽样 | 长度 1000 无重复 | `false` |

---

## 复杂度目标

- **时间 O(n)**：每个元素最多 Set 操作一次  
- **空间 O(n)**：最坏全部不重复，Set 存 n 个

---

## 与 NeetCode Arrays & Hashing 对齐

- NeetCode 150 桶 1 · 第 1 题（热身）  
- 建立本周习惯：**Set/Map 代替嵌套循环**  
- 下一题 [242 Valid Anagram](./week1-day02.md) 会用到 **计数表**，是 Set 的 cousin

---

## 可选加餐（有余力 +10min）

- 口述：若要求 **O(1) 空间**，能否做？（排序 O(n log n) 或 原地标记仅适用于值域小等特殊条件）  
- 在笔记加一行：「217 = 我会不会用 HashSet 的第一块试金石」
