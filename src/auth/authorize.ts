import { authenticate } from '@google-cloud/local-auth';
import { auth } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const GOOGLE_AUTH_DIR = process.env.GOOGLE_AUTH_DIR;

if (!GOOGLE_AUTH_DIR) {
  throw new Error('Set GOOGLE_AUTH_DIR environment variable');
}

const TOKEN_PATH = path.join(GOOGLE_AUTH_DIR, 'token.json');
const CREDENTIALS_PATH = path.join(GOOGLE_AUTH_DIR, 'credentials.json');

function loadSavedCredentialsIfExist() {
  try {
    const tokenJson = readFileSync(TOKEN_PATH);
    const credentialsJson = readFileSync(CREDENTIALS_PATH);

    const tokens = JSON.parse(tokenJson.toString());
    const credentials = JSON.parse(credentialsJson.toString());

    const client = new auth.OAuth2({
      clientId: tokens.client_id,
      clientSecret: tokens.client_secret,
      redirectUri: credentials.installed.redirect_uris[0],
    });

    client.setCredentials(tokens);
    return client;
  }
  catch (err) {
    console.error(err);
    return null;
  }
}

function saveCredentials(client: OAuth2Client) {
  const content = readFileSync(CREDENTIALS_PATH);
  const keys = JSON.parse(content.toString());
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  writeFileSync(TOKEN_PATH, payload);
}

export default async function authorize() {
  let client = loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    saveCredentials(client);
  }
  return client;
}
