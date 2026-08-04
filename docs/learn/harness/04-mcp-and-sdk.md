# Month 4 · MCP + Agents SDK

**时长：** 约 4 周  
**前置：** [03-context-and-policy.md](./03-context-and-policy.md)

---

## 本阶段目标

1. 理解 **MCP（Model Context Protocol）**：工具与数据的统一接入层  
2. 手写一个**最小 MCP server**（2–3 个工具）  
3. 试用一个官方 Agents SDK，看清框架只是把 loop 产品化  
4. 对比：**自研 mini harness vs SDK vs MCP 工具**

**产出门槛：** 「自研 harness + 一个 MCP 工具」对比笔记（何时自建、何时用 SDK）。

---

## 必读

- MCP 官网与 quickstart：https://modelcontextprotocol.io  
- [Introducing MCP (Anthropic)](https://www.anthropic.com/news/introducing-the-model-context-protocol)  
- [Building agents that reach production systems with MCP](https://claude.com/blog/building-agents-that-reach-production-systems-with-mcp)  
- 工具写作：高密度 description、按意图聚合工具，而不是 1:1 包 REST  
- 任选其一 SDK 文档：OpenAI Agents SDK **或** Claude Agent SDK  

实现向阅读：[How to Build an Agent Harness](https://snowan.gitbook.io/study-notes/ai-blogs/how-to-build-agent-harness)（看 Stage 1–3 即可）

---

## 动手任务

### Task 1：最小 MCP server

暴露 2–3 个无害工具，例如：

- `echo`  
- `word_count`  
- `list_allowed_paths`（只读、白名单目录）  

用 MCP Inspector 或兼容客户端验证 schema 与调用。

原则：

- 工具少而清（角色级 4–5 个以内更稳）  
- 描述写给模型：动词、边界、返回形态  
- 权限最小化  

### Task 2：SDK 跑通一个官方示例

目标不是学会某个框架的全部 API，而是标出：

| 能力 | 在 SDK 里叫什么 | 在本仓库对应什么 |
|---|---|---|
| Loop | Runner / agent_loop | `runAgentLoop` |
| Tools | function tools / MCP | `ToolRegistry` |
| Trace | traces / spans | `trace-store` |
| Stop | max_turns / end_turn | step budget / `stop` |

### Task 3：概念了解即可（不必全实现）

- **Handoff / subagent**：子任务干净上下文，避免 context rot  
- **Compaction**：长对话摘要，保留指针到外部状态  
- **Mask vs remove tools**：阶段门控时慎删工具定义  

---

## 与本仓库的关系

Month 4 **不要求**把 MCP 并进 `src/harness` 主路径。  
优先在旁路 demo 目录或个人笔记仓完成，保持本仓 Document Studio / PPT 主线干净。  
若你要贡献回 Free Myself：单独开 slice，先 RFC 式笔记再改代码。

---

## 检查清单

- [ ] MCP server 可被客户端列出并调用工具  
- [ ] 能画「Agent Host ↔ MCP Client ↔ MCP Server ↔ 系统」  
- [ ] 对比笔记写完（自研 vs SDK）  
- [ ] 算法节奏不掉  

---

## 下一阶段

→ [05-evals-and-prod.md](./05-evals-and-prod.md)：Eval、护栏与生产硬化。
