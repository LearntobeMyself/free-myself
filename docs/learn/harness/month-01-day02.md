# Day 2 细案 · JSON Schema + `validateToolArgs`（约 4h）

> 上级：[month-01-week1.md](./month-01-week1.md) · 总览：[month-01-plan.md](./month-01-plan.md)  
> Lab：`D:/learn-agent-lab/`  
> **今日唯一目标：** 参数校验是 Harness 的活；交出 **10 测全绿** 的 `validateToolArgs`

---

## 开场（5min）— 今天要交什么

交不出下面 4 样，不算完成 Day 2：

1. `D:/learn-agent-lab/src/schema.ts`（含对外签名 `validateToolArgs`）  
2. `D:/learn-agent-lab/tests/schema.test.ts`（≥10 用例，`npx vitest run` 绿）  
3. `notes/day-02.md`（必答题 + 10 测清单 + 2 个设计取舍）  
4. 一条「`"3"` 当 number」的友好报错样例（写进笔记）  

**今天不做：** while loop、Registry、接真模型、改 Free Myself `src/harness`。

---

## 时段 A · 学（70min）

### A1（0:00–0:25）JSON Schema 核心字段

打开任一权威 JSON Schema 说明（官方 / MDN 级教程均可），精读并笔记：

- `type` / `properties` / `required`  
- `enum` / `minimum` / `minLength`  
- `additionalProperties: false`  

**必写：** 每个字段用「Agent 工具参数」举 1 个正例 + 1 个反例。

### A2（0:25–0:50）Java 对照

在笔记建表：

| JSON Schema | Java 你会想到的 |
|---|---|
| required | `@NotNull` / 构造器必参 |
| type: number | `Integer` vs 字符串 `"3"` |
| enum | `Enum` / `@Pattern` |
| additionalProperties:false | DTO 禁止未知字段 |

### A3（0:50–1:10）必答题（每题 ≥4 句）

1. 模型漏传 required 时，应在哪一层拒绝？返回给模型的形态应是什么？  
2. `additionalProperties: true` 在 Agent 工具里有什么风险？  
3. 和 Bean Validation 的对应与不同点？  

---

## 时段 B · 做（150min）

### B1（1:10–1:40）定对外 API

在 `src/schema.ts` 落下（签名不要改花）：

```ts
export type JsonSchemaLike = {
  type?: string;
  properties?: Record<string, JsonSchemaLike>;
  required?: string[];
  enum?: unknown[];
  additionalProperties?: boolean;
};

export function validateToolArgs(
  schema: JsonSchemaLike,
  input: unknown,
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string };
```

可用 Zod 做内部实现，但 **对外只暴露上面签名**。

**检查点：** 文件能被 `tsx` / vitest 导入。

### B2（1:40–2:40）实现校验逻辑

最低支持：

- 根必须是 object（否则 `ok:false`）  
- `required` 缺失 → 明确字段名  
- `properties` 上 string / number / boolean 类型检查  
- `enum`  
- `additionalProperties === false` 时拒绝多余键  
- `error` 字符串要对模型友好（含字段名 + 期望类型）  

### B3（2:40–3:20）`tests/schema.test.ts` ≥10 测

至少覆盖：

1. 正常通过  
2. 缺 required  
3. 类型错误（string 当 number）  
4. enum 不匹配  
5. 多余字段（additionalProperties false）  
6. 根为 null  
7. 根为数组  
8. 空 properties + 无 required 的 `{}`  
9. boolean 字段  
10. 嵌套一层 object（至少一个）  

```bash
cd D:/learn-agent-lab
npx vitest run tests/schema.test.ts
```

### B4（3:20–3:40）模型常犯输入

构造 `{ a: "3" }` 对 `a: number` 的 schema，确认 error **提到 number / 类型**，而不是含糊的 “invalid”。不友好就改文案再跑测。

---

## 时段 C · 验（30min）

### C1（3:40–3:55）闭卷

合上代码，默写 `validateToolArgs` 的返回联合类型；写出 3 个你会拒绝的输入。

### C2（3:55–4:10）对照本仓（只读 10min）

打开 Free Myself [`src/harness/types.ts`](../../../src/harness/types.ts) 看 `ToolResult`：你的 `{ok,error}` 和它如何对齐？写 5 行进笔记。

---

## 时段 D · 记（20min）

`notes/day-02.md`：

```markdown
# Day 02
## 必答题
## 10 测清单（打勾）
## 设计取舍（≥2）
## `"3"` 报错原文
## 与 ToolResult 对齐
## 明日坑（Day3：三种 Agent 模式伪代码）
## 用时实际
```

---

## 收工清单

- [ ] `schema.ts` 签名正确  
- [ ] ≥10 测绿  
- [ ] 友好报错样例进笔记  
- [ ] 必答题三题  
- [ ] 未改产品仓 harness  

## 卡住时

| 现象 | 处理 |
|---|---|
| Zod 版本 API 对不上 | 看 lab 已装 zod 的文档；或手写最小校验 |
| 嵌套测不会写 | 先保证 9 个平面测绿，嵌套抄笔记里的最小例子 |
| 想写 loop | 停；Day6 的事 |

→ 下一枪：[month-01-day03.md](./month-01-day03.md)（若尚未创建则暂跟 week1 Day3 节）
