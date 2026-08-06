# Day 2 细案 · 242 Valid Anagram（约 45–55min）

> 上级：[week1.md](./week1.md) · 总纲：[README.md](./README.md)  
> NeetCode 150 · **Arrays & Hashing** 第 2 题  
> 语言：**Java** 优先

---

## 题目

**[242. Valid Anagram（有效的字母异位词）](https://leetcode.cn/problems/valid-anagram/)**

给定两个字符串 `s` 和 `t`，若 `t` 是 `s` 的字母异位词（相同字母、相同次数、不同排列），返回 `true`；否则 `false`。

---

## 模式名

**频次计数 / Hash** — 用长度 26 的数组或 `HashMap<Character, Integer>` 统计字符出现次数。

---

## 今日目标 / 交付物

交不出下面 3 样，不算完成 Day 2（站内可勾选）：

- [ ] **LeetCode 提交通过**（Java）
- [ ] 写好笔记：`D:/learn-agent-lab/notes/lc/day-02.md`
- [ ] 站点打卡：[/learn/leetcode](/learn/leetcode) → 备注 `242`

**笔记必含：** 为何长度不等可直接 false；数组 vs Map 怎么选；与 217 的 Set 模式对比一句。

---

## 时段安排（合计 ~45–55min）

| 时段 | 时长 | 做什么 |
|---|---|---|
| 读题澄清 | 10min | 确认只含小写字母、异位词定义 |
| 暴力与目标复杂度 | 5min | 排序 O(n log n) vs 计数 O(n) |
| 编码 | 25–35min | Java 计数数组或双 Map |
| 自测 | 5min | 边界用例 |
| 笔记 | 10min | `day-02.md` + 对比 Day1 模式 |

---

## 卡 25 分钟规则

- **0–25min** 说不出「计数」或「排序后相等」→ 看题解思路 → 合上重写  
- 常见卡点：只统计 `s` 忘了减 `t`；或 Map 写法冗长  
- **3 天后** 与 217 一起口头对比：Set 查存在 vs 数组计频次

---

## 读题澄清（10min 清单）

1. `s = "anagram", t = "nagaram"` → `true`  
2. `s = "rat", t = "car"` → `false`  
3. 长度不同 → 必为 `false`（先写这一行可省坑）  
4. 约束：小写英文字母，`s.length` 最多 5×10⁴

---

## 暴力与目标复杂度（5min）

| 方法 | 时间 | 空间 |
|---|---|---|
| 排序后 `equals` | O(n log n) | O(n) 或 O(1) 视语言 |
| **频次数组（26）** | **O(n)** | **O(1)** 固定 26 |
| HashMap 计数 | O(n) | O(1) 字符集固定时 |

**目标：O(n) 时间，O(1) 额外空间**（字母表固定）。

---

## 编码要点（25–35min）

**写法 A — 计数数组（推荐）：**

```java
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) return false;
        }
        return true;
    }
}
```

**写法 B — 单 Map：** 扫 `s` 加、扫 `t` 减，最后检查是否全 0。

**检查点：** 一次循环同时加减，避免两次遍历漏写。

---

## 边界用例列表（自测 5min）

| 用例 | s | t | 期望 |
|---|---|---|---|
| 经典 true | `anagram` | `nagaram` | `true` |
| 经典 false | `rat` | `car` | `false` |
| 长度不同 | `ab` | `abc` | `false` |
| 单字符相同 | `a` | `a` | `true` |
| 单字符不同 | `a` | `b` | `false` |
| 全同 | `aaa` | `aaa` | `true` |
|  multiset 相同排列 | `aab` | `aba` | `true` |
| 重复字母错配 | `aab` | `abb` | `false` |

---

## 复杂度目标

- **时间 O(n)**：n = 字符串长度，单遍或常数遍扫描  
- **空间 O(1)**：26 个 int，与 n 无关

---

## 与 NeetCode Arrays & Hashing 对齐

- 桶 1 第 2 题 · 从「存在性」过渡到「频次」  
- 直接铺垫 [49 Group Anagrams](./week1-day04.md)（把字符串映射到计数签名）  
- 与 [217](./week1-day01.md) 同属 Hash 家族，笔记里画一条线：217=见过吗，242=次数一样吗

---

## 收工清单（全部勾完再打卡）

- [ ] 能口述计数法 vs 排序法取舍
- [ ] Java 解法站点通过
- [ ] `day-02.md` 写完（含与 217 对比一句）
- [ ] `/learn/leetcode` 点亮今日，备注 `242`

---

## 可选加餐（+10min）

- [ ] 若字符集变为 Unicode，数组还合适吗？（改 HashMap）
- [ ] LeetCode 49 预习一句：异位词分组 = 相同频次签名
