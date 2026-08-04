# Harness 学习 · 精选资源

少而精。每阶段只深读标注「必读」的；其余按需。

---

## 概念主线（必读）

| 资源 | 用途 |
|---|---|
| [LangChain — The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness) | `Agent = Model + Harness` 解剖 |
| [Addy Osmani — Agent Harness Engineering](https://addyosmani.com/blog/agent-harness-engineering/) | 工程化全景与 HaaS 趋势 |
| [amux — Harness Engineering Guide](https://amux.io/guides/harness-engineering/) | Guides / Sensors / Context / Tools |
| [Harness Engineering 总览](https://harness-engineering.net/) | Feedforward / Feedback / 成熟度 |
| [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | 简单可组合模式 |

---

## 动手主线

| 资源 | 用途 |
|---|---|
| [MCP 官网](https://modelcontextprotocol.io) | 协议与 quickstart |
| [Introducing MCP](https://www.anthropic.com/news/introducing-the-model-context-protocol) | 背景 |
| [Agents + MCP in production](https://claude.com/blog/building-agents-that-reach-production-systems-with-mcp) | 生产接入姿势 |
| [Build a minimal harness loop](https://futureagi.com/blog/build-agent-harness-python/) | 手写 while tool_use |
| [How to Build an Agent Harness](https://snowan.gitbook.io/study-notes/ai-blogs/how-to-build-agent-harness) | 分阶段搭建 |
| 本仓库 `src/harness/` + `/workbench/traces` | 每日练兵场 |

SDK（任选其一深入）：OpenAI Agents SDK 文档、Claude Agent SDK 文档。

---

## 求职 / 面试主线

| 资源 | 用途 |
|---|---|
| [Design an AI Agent](https://www.systemdesign.academy/interview/design-ai-agent) | 系统设计口述骨架 |
| [Building Your First AI Agent](https://www.compoundlearn.ai/topics/building-your-first-ai-agent) | Runtime / Quality 分层 |
| [AI Agent Control Loops](https://www.compoundlearn.ai/topics/ai-agent-control-loops-and-planning) | ReAct / 规划 / 并行工具 |

作品集指标建议：成功率、平均步数、可回放轨迹、确定性校验覆盖、golden 通过率。

---

## 延伸（选读）

- [Harness Engineering: What OpenAI and Anthropic Changed](https://www.aibuilderclub.com/blog/harness-engineering-agent-production-guide)  
- [Anatomy of an AI Harness（deep dive）](https://www.youngju.dev/blog/culture/2026-05-14-ai-agent-harness-anatomy-loop-tool-execution-context-management-build-your-own-deep-dive-guide-2026.en)  
- Medium / 社区「Definitive Guide to Agent Harness Engineering」类长文——作补充，勿替代码练习  

---

## 本仓文档索引

- 总纲：[README.md](./README.md)  
- 架构地图：[docs/harness.md](../../harness.md)  
- Agent 约定：[AGENTS.md](../../../AGENTS.md)  
- 学习页：[/learn/harness](/learn/harness)  
