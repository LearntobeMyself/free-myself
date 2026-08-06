# Day 5 细案 · 347 Top K Frequent Elements（约 55–70min）

> 上级：[week1.md](./week1.md) · 总纲：[README.md](./README.md)  
> NeetCode 150 · **Arrays & Hashing** 第 5 题  
> 语言：**Java** 优先

---

## 题目

**[347. Top K Frequent Elements（前 K 个高频元素）](https://leetcode.cn/problems/top-k-frequent-elements/)**

给定整数数组 `nums` 和整数 `k`，返回出现频率前 `k` 高的元素。顺序不限。

保证答案是**唯一**的（频率第 k 名不会并列挤占）。

---

## 模式名

**频次统计 + 桶排序 / 最小堆** — 先 `Map` 计数，再用「频率桶」O(n) 或「大小 k 最小堆」O(n log k) 取 Top K。

---

## 今日目标 / 交付物

交不出下面 3 样，不算完成 Day 5（站内可勾选）：

- [ ] **LeetCode 提交通过**（Java）
- [ ] 写好笔记：`D:/learn-agent-lab/notes/lc/day-05.md`（写清桶 or 堆及为何）
- [ ] 站点打卡：[/learn/leetcode](/learn/leetcode) → 备注 `347`

**笔记必含：** 桶排序适用条件（频率上界 ≈ n）；与 PriorityQueue  trade-off 一张小表。

---

## 时段安排（合计 ~55–70min）

| 时段 | 时长 | 做什么 |
|---|---|---|
| 读题澄清 | 10min | k 的范围、返回 k 个 distinct 元素 |
| 暴力与目标复杂度 | 5min | 全排序 O(n log n) vs 桶 O(n) vs 堆 O(n log k) |
| 编码 | 35–40min | 先写 freq Map，再实现主解法（本题代码量略多） |
| 自测 | 5min | 边界用例 |
| 笔记 | 10min | `day-05.md` |

---

## 卡 25 分钟规则

- **0–25min** 若卡在「怎么从 Map 取 Top K」→ 先完成 **freq Map**（Day2/4 技能），再选：  
  - **桶：** `List<Integer>[] bucket = new List[n+1]`，下标 = 频率  
  - **堆：** 维护 size=k 的 min-heap，按频率比较  
- 看题解只学一种，笔记记录另一种口述思路即可

---

## 读题澄清（10min 清单）

1. `nums = [1,1,1,2,2,3], k = 2` → `[1,2]`  
2. `nums = [1], k = 1` → `[1]`  
3. 返回 **k 个元素**，不是 k 个频率值  
4. `-10^4 <= nums[i] <= 10^4`，`k` 不超过不同元素个数

---

## 暴力与目标复杂度（5min）

| 方法 | 时间 | 空间 |
|---|---|---|
| Map 计数 + entry 按频排序 | O(n log n) | O(n) |
| **桶排序（频率桶）** | **O(n)** | **O(n)** |
| **最小堆 size=k** | **O(n log k)** | **O(n)** |

**目标：O(n) 桶 或 O(n log k) 堆，空间 O(n)。** 面试两种都会加分。

---

## 编码要点（35–40min）

**Step 1 — 频次（与 Day2/4 同技能）：**

```java
Map<Integer, Integer> freq = new HashMap<>();
for (int x : nums) {
    freq.merge(x, 1, Integer::sum);
}
```

**Step 2A — 桶排序（NeetCode 推荐，O(n)）：**

```java
@SuppressWarnings("unchecked")
List<Integer>[] bucket = new List[nums.length + 1];
for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
    int f = e.getValue();
    if (bucket[f] == null) bucket[f] = new ArrayList<>();
    bucket[f].add(e.getKey());
}
List<Integer> result = new ArrayList<>();
for (int f = bucket.length - 1; f >= 1 && result.size() < k; f--) {
    if (bucket[f] != null) {
        for (int x : bucket[f]) {
            result.add(x);
            if (result.size() == k) return result;
        }
    }
}
return result;
```

**Step 2B — 最小堆（k 远小于 n 时）：**

```java
PriorityQueue<Map.Entry<Integer, Integer>> minHeap =
    new PriorityQueue<>(Comparator.comparingInt(Map.Entry::getValue));
for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
    minHeap.offer(e);
    if (minHeap.size() > k) minHeap.poll();
}
// 弹出堆中 k 个 entry 的 key
```

**检查点：** 桶的下标最大频率 ≤ `nums.length`；堆比较的是 **频率** 不是数值。

---

## 边界用例列表（自测 5min）

| 用例 | nums | k | 期望 |
|---|---|---|---|
| 官方 | `[1,1,1,2,2,3]` | `2` | `[1,2]`（顺序不限） |
| 单元素 | `[1]` | `1` | `[1]` |
| 全相同 | `[5,5,5,5]` | `1` | `[5]` |
| k = 不同元素数 | `[1,2,3]` | `3` | 含 1,2,3 各一 |
| 负数 | `[-1,-1,-2]` | `1` | `[-1]` |
| 两数同频 | `[1,2,1,2,3], k=2` | `2` | 任意两个最高频（1 和 2） |

---

## 复杂度目标

- 计数：O(n) 时间，O(n) 空间  
- **桶：** 总 O(n) 时间（建桶 + 扫桶）  
- **堆：** O(n log k) 时间，O(n) 空间

---

## 与 NeetCode Arrays & Hashing 对齐

- 桶 1 第 5 题 · 在 Hash 计数之上接 **Top K 经典套路**  
- 与 [238 Product Except Self](./week1-day06.md) 不同：本题允许 O(n) 辅助结构，238 限制更严  
- 堆版本与后续 Heap 桶题目衔接；桶版本强化「用值域/频率上界当数组下标」

---

## 收工清单（全部勾完再打卡）

- [ ] 笔记写清选桶还是堆及原因
- [ ] Java 解法站点通过
- [ ] `day-05.md` 写完
- [ ] `/learn/leetcode` 点亮今日，备注 `347`

---

## 可选加餐（+10min）

- QuickSelect O(n) 平均 — 知道名字即可，面试先说桶/堆  
- 若 follow-up「按频率升序输出全部」如何改？（扫桶从小到大）
