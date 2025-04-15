import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tools from '~/tools/drive/index.js';

function getManifest() {
  const manifestPath = path.resolve(fileURLToPath(import.meta.url), '../../package.json');
  const manifestFile = readFileSync(manifestPath);
  return JSON.parse(manifestFile.toString());
}

const manifest = getManifest();

const mcpServer = new Server(
  {
    name: manifest.name,
    version: manifest.version,
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map(({ schema }) => schema),
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find(({ schema }) => request.params.name === schema.name);

  if (tool) {
    return tool.handler(request.params.arguments as any);
  }

  throw new Error('Tool not found');
});

async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
