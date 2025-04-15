import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import readTool from '~/tools/drive/read.js';
import searchTool from '~/tools/drive/search.js';

type ToolIndex = Array<{
  schema: Tool
  handler: (args: any) => Promise<CallToolResult>
}>;

export default [
  readTool,
  searchTool,
] as ToolIndex;
