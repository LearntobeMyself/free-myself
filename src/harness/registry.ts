import type { ToolDefinition, ToolResult } from "./types";

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return [...this.tools.values()];
  }

  async execute(name: string, input: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { ok: false, error: `Unknown tool: ${name}` };
    }
    try {
      return await tool.execute(input);
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  describeForAgent(): Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }> {
    return this.list().map(({ name, description, parameters }) => ({
      name,
      description,
      parameters,
    }));
  }
}

export const globalRegistry = new ToolRegistry();
