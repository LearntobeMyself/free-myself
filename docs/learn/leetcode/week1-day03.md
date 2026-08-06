# Day 3 细案 · 1 Two Sum（约 50–60min）

> 上级：[week1.md](./week1.md) · 总纲：[README.md](./README.md)  
> NeetCode 150 · **Arrays & Hashing** 第 3 题  
> 语言：**Java** 优先

---

## 题目

**[1. Two Sum（两数之和）](https://leetcode.cn/problems/two-sum/)**

给定整数数组 `nums` 和目标值 `target`，在数组中找出**和为目标值**的那**两个**整数，返回它们的**下标**。

假设：每组输入**恰好一个解**，**同一元素不能用两次**；可以按任意顺序返回答案。

---

## 模式名

**Hash Map 补数** — 遍历时存「值 → 下标」，查 `target - current` 是否已存在。

---

## 今日目标 / 交付物

交不出下面 3 样，不算完成 Day 3（站内可勾选）：

- [ ] **LeetCode 提交通过**（Java，返回 `int[]`）
- [ ] 写好笔记：`D:/learn-agent-lab/notes/lc/day-03.md`
- [ ] 站点打卡：[/learn/leetcode](/learn/leetcode) → 备注 `1`

**笔记必含：** 为何不能先排序（要原下标）；Map 里存 value 还是 index；与 217/242 的模式递进关系。

---

## 时段安排（合计 ~50–60min）

| 时段 | 时长 | 做什么 |
|---|---|---|
| 读题澄清 | 10min | 确认返回下标、唯一解、不能用同一元素两次 |
| 暴力与目标复杂度 | 5min | 双重循环 O(n²) → HashMap O(n) |
| 编码 | 30–35min | 一遍扫描 + Map（本题是面试第一题级，编码多留 5min） |
| 自测 | 5min | 边界用例 |
| 笔记 | 10min | `day-03.md`，写一句「面试版口述」 |

---

## 卡 25 分钟规则

- **0–25min** 若还在双重循环微调 → 停，画表：`i` 时 Map 里有什么、`need = target - nums[i]`  
- 典型坑：先 `put` 再查导致用到同一索引；应先查再 put  
- 本题极高频，**Day 7 周复盘**必须能 5 分钟无提示重写

---

## 读题澄清（10min 清单）

1. `nums = [2,7,11,15], target = 9` → `[0,1]`（2+7=9）  
2. `nums = [3,3], target = 6` → `[0,1]`  
3. 返回的是**下标**，不是值  
4. 恰好一组解 → 找到即可 return，无需收集全部  
5. 负数、零均可出现

---

## 暴力与目标复杂度（5min）

| 方法 | 时间 | 空间 |
|---|---|---|
| 暴力两重循环 | O(n²) | O(1) |
| 排序 + 双指针 | O(n log n) | O(n) 存原下标映射，实现烦 |
| **HashMap 一遍** | **O(n)** | **O(n)** |

**目标：O(n) 时间，O(n) 空间。**

---

## 编码要点（30–35min）

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> indexByValue = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (indexByValue.containsKey(need)) {
                return new int[] { indexByValue.get(need), i };
            }
            indexByValue.put(nums[i], i);
        }
        throw new IllegalArgumentException("no solution");
    }
}
```

**检查点：**

- 顺序：**先查 `need`，再 put 当前**  
- `Map` 键：数值；值：下标  
- 题目保证有解；若无解可 throw 或 return 空数组（面试说明即可）

---

## 边界用例列表（自测 5min）

| 用例 | nums | target | 期望 |
|---|---|---|---|
| 官方例 1 | `[2,7,11,15]` | `9` | `[0,1]` |
| 重复值 | `[3,3]` | `6` | `[0,1]` |
| 两元素 | `[1,2]` | `3` | `[0,1]` |
| 含负数 | `[-1,-2,-3,-4,-5]` | `-8` | `[2,4]` |
| 含零 | `[0,4,3,0]` | `0` | `[0,3]` |
| 较大 target | `[1,5,3]` | `4` | `[0,2]` |

---

## 复杂度目标

- **时间 O(n)**：单次遍历，Map 均摊 O(1)  
- **空间 O(n)**：最坏 Map 存 n−1 个元素

---

## 与 NeetCode Arrays & Hashing 对齐

- 桶 1 第 3 题 · **Hash Map 模式的核心样板**  
- 后续很多题是 Two Sum 变体（三数之和、亚数组和等，在别的桶）  
- 与 [217 Set](./week1-day01.md)、[242 计数](./week1-day02.md) 形成三部曲：存在 / 频次 / 配对

---

## 收工清单（全部勾完再打卡）

- [ ] 能口述为何 Map 存 index 而非 value
- [ ] Java 解法站点通过（返回下标）
- [ ] `day-03.md` 写完
- [ ] `/learn/leetcode` 点亮今日，备注 `1`

---

## 可选加餐（+10min）

- 口述 follow-up：若数组已排序，双指针怎么做？（O(n) 时间 O(1) 空间，但失去原下标）  
- 在笔记写 **3 行面试脚本**：暴力 → 优化动机 → Map 一遍
