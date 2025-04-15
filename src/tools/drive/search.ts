import { Tool } from '@modelcontextprotocol/sdk/types.js';
import drive from '~/drive.js';
import { ToolHandler } from '~/tools/types/ToolHandler.js';

const schema: Tool = {
  name: 'drive_search',
  description: 'Search for files in Google Drive',
  inputSchema: {
    type: 'object',
    properties: {
      mimeType: {
        type: 'string',
        description: `Search for files by mimeType`,
        optional: true,
      },
      query: {
        type: 'string',
        description: `Search for files and folders by name. If query left empty, return all files.`,
        optional: true,
      },
      pageSize: {
        type: 'number',
        description: 'Number of results per page (max 100)',
        optional: true,
      },
      pageToken: {
        type: 'string',
        description: 'Token for the next page of results',
        optional: true,
      },
    },
    required: ['query'],
  },
};

interface SearchParams {
  query?: string
  mimeType?: string
  pageSize?: number
  pageToken?: string
}

const handler: ToolHandler<SearchParams> = async ({ query = '', mimeType, pageToken, pageSize }) => {
  const searchQuery = [];

  if (mimeType) {
    searchQuery.push(`mimeType = '${mimeType}'`);
  }

  if (query) {
    searchQuery.push(`name contains '${query}'`);
  }

  searchQuery.push('trashed = false');

  const list = await drive.files.list({
    q: searchQuery.join(' AND '),
    pageSize: pageSize || 10,
    pageToken: pageToken,
    orderBy: 'modifiedTime desc',
    fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size)',
  });

  const fileList = list.data.files
    ?.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
    }));

  const response = {
    count: list.data.files?.length,
    files: fileList,
    nextPageToken: list.data.nextPageToken ?? '',
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response),
      },
    ],
    isError: false,
  };
};

export default {
  handler,
  schema,
};
