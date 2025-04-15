import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export type ToolHandler<T = any> = (args: T) => Promise<CallToolResult>;
