import { Tool } from '@modelcontextprotocol/sdk/types.js';
import drive from '~/drive.js';
import { ToolHandler } from '~/tools/types/ToolHandler.js';

const schema: Tool = {
  name: 'drive_read',
  description: 'Read contents of a file from Google Drive',
  inputSchema: {
    type: 'object',
    properties: {
      fileId: {
        type: 'string',
        description: 'The ID of the file',
      },
    },
    required: ['fileId'],
  },
};

const handler: ToolHandler<ReadHandlerParams> = async function ({ fileId }) {
  const fileMimeTypeCheck = await drive.files.get({
    fileId,
    fields: 'mimeType,name',
  });

  const { name: fileName, mimeType } = fileMimeTypeCheck.data;

  const file = await (isGoogleWorkspaceMimeType(mimeType) ? handleFileExport(fileId, mimeType) : handleFileGet(fileId));

  return {
    content: [
      {
        type: 'text',
        text: `Contents of ${fileName || fileId}:\n\n${file.data}`,
      },
    ],
    isError: false,
  };
};

interface ReadHandlerParams {
  fileId: string
}

const GOOGLE_WORKSPACE_MIME_TYPE_MAP = {
  'application/vnd.google-apps.audio': 'audio/mpeg',
  'application/vnd.google-apps.document': 'text/markdown',
  'application/vnd.google-apps.drawing': 'image/png',
  'application/vnd.google-apps.photo': 'image/png',
  'application/vnd.google-apps.presentation': 'text/plain',
  'application/vnd.google-apps.spreadsheet': 'text/csv',
  'application/vnd.google-apps.video': 'video/mpeg',
};

function isGoogleWorkspaceMimeType(mimeType?: string | null): mimeType is `application/vnd.google-apps${string}` {
  return !!mimeType?.startsWith('application/vnd.google-apps');
}

function mimeTypeisMappable(mimeType?: string | null): mimeType is keyof typeof GOOGLE_WORKSPACE_MIME_TYPE_MAP {
  return mimeType ? Object.hasOwn(GOOGLE_WORKSPACE_MIME_TYPE_MAP, mimeType) : false;
}

async function handleFileExport(fileId: string,
  mimeType: `application/vnd.google-apps${string}`) {
  return await drive.files.export(
    {
      fileId,
      mimeType: mimeTypeisMappable(mimeType) ? GOOGLE_WORKSPACE_MIME_TYPE_MAP[mimeType] : 'text/plain',
    },
    { responseType: 'text' },
  );
}

async function handleFileGet(fileId: string) {
  return await drive.files.get({
    fileId,
  });
}

export default {
  handler,
  schema,
};
