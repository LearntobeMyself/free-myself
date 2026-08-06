# Day 4 细案 · 49 Group Anagrams（约 55–65min）

> 上级：[week1.md](./week1.md) · 总纲：[README.md](./README.md)  
> NeetCode 150 · **Arrays & Hashing** 第 4 题  
> 语言：**Java** 优先

---

## 题目

**[49. Group Anagrams（字母异位词分组）](https://leetcode.cn/problems/group-anagrams/)**

给定字符串数组 `strs`，将**字母异位词**组合在一起。可以按任意顺序返回结果。

异位词：字母相同、次数相同、排列不同（如 `"eat"` 与 `"tea"`）。

---

## 模式名

**分组 Hash** — 用「规范键」（排序串 / 26 位频次签名）把同一组字符串放进 `Map<String, List<String>>`。

---

## 今日目标 / 交付物

交不出下面 4 样，不算完成 Day 4（站内可勾选）：

- [ ] **LeetCode 提交通过**（Java，返回 `List<List<String>>`）
- [ ] 写好笔记：`D:/learn-agent-lab/notes/lc/day-04.md`
- [ ] 站点打卡：[/learn/leetcode](/learn/leetcode) → 备注 `49`
- [ ] **15min 无提示复做 [217](./week1-day01.md)**（写在笔记复盘区）

**笔记必含：** 键选「排序串」还是「#1#0#0…」；复杂度里 n、m 各指什么。

---

## 时段安排（合计 ~55–65min）

| 时段 | 时长 | 做什么 |
|---|---|---|
| 读题澄清 | 10min | 输出是分组列表，顺序无关 |
| 暴力与目标复杂度 | 5min | 两两判异位词 O(n²·km) vs Hash 分组 O(n·km) |
| 编码 | 30–35min | Map + 键生成（排序或计数串） |
| 自测 | 5min | 边界用例 |
| 笔记 | 10min | `day-04.md` + 217 复做结果 |

---

## 卡 25 分钟规则

- **0–25min** 键的设计定不下来 → 二选一：**排序字符串**（好写）或 **频次数组转字符串**（O(k) 排序 k=26）  
- 卡点：Map 取值 `getOrDefault`、最后 `new ArrayList<>(map.values())`  
- 217 复做若失败：笔记记「仍依赖题解」，Day 7 再测

---

## 读题澄清（10min 清单）

1. `["eat","tea","tan","ate","nat","bat"]` → `[["bat"],["nat","tan"],["ate","eat","tea"]]`（组内组间顺序均可）  
2. 单字符串 `"a"` → `[["a"]]`  
3. 空串 `""` 可出现在数组中  
4. `n = strs.length` 最多 10⁴，单串最长 100

---

## 暴力与目标复杂度（5min）

| 方法 | 时间 | 说明 |
|---|---|---|
| 每对调用 isAnagram | O(n² · L) | L 为串长，Day2 的 O(L) |
| **Hash 按签名分组** | **O(n · L log L)** 排序键 | 或 O(n · L) 用计数键 |
| | **O(n · L)** 计数键 | 无排序因子 |

**目标：O(n · L) 或 O(n · L log L) 时间，O(n · L) 空间**（存所有字符串）。

---

## 编码要点（30–35min）

**写法 A — 排序作为键：**

```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(groups.values());
    }
}
```

**写法 B — 频次签名键（面试加分）：**

```java
private String signature(String s) {
    int[] count = new int[26];
    for (char c : s.toCharArray()) count[c - 'a']++;
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 26; i++) {
        sb.append('#').append(count[i]);
    }
    return sb.toString();
}
```

**检查点：** 返回值是 `List<List<String>>`，不是 Map。

---

## 边界用例列表（自测 5min）

| 用例 | strs | 期望要点 |
|---|---|---|
| 官方混合 | `["eat","tea","tan","ate","nat","bat"]` | 3 组，异位词同组 |
| 单元素 | `["a"]` | 一组 `["a"]` |
| 全不同 | `["abc","bca","cab"]` 若全为异位词 | 1 组 3 个 |
| 无异位词 | `["abc","def","ghi"]` | 3 组各 1 个 |
| 含空串 | `["",""]` | 1 组 2 个 `""` |
| 重复串 | `["dd","dd"]` | 1 组 2 个 |

---

## 复杂度目标

- 设 n = 字符串个数，L = 平均长度  
- **排序键：** 时间 O(n · L log L)，空间 O(n · L)  
- **计数键：** 时间 O(n · L)，空间 O(n · L)

---

## 与 NeetCode Arrays & Hashing 对齐

- 桶 1 第 4 题 · 综合 [242 Valid Anagram](./week1-day02.md) 的判定，升级为「批量分组」  
- 键的设计思想贯穿后续：Graph、Union-Find 前常需「规范化 id」  
- 今日顺带完成 **217 三日复做**（README 卡 25 分钟规则）

---

## 收工清单（全部勾完再打卡）

- [ ] 能口述分组键选法（排序串 vs 计数签名）
- [ ] Java 解法站点通过
- [ ] `day-04.md` 写完 + 217 复做记录
- [ ] `/learn/leetcode` 点亮今日，备注 `49`

---

## 可选加餐（+10min）

- 比较两种键：100 长度串时排序 vs 26 固定计数  
- 预习 [347 Top K](./week1-day05.md)：分组之后常接「频次 Top K」
