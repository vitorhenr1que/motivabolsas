
import {  OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const {google} = require('googleapis')
/**
 * Retorna cliente OAuth2 autenticado.
 */
export function getAuthenticatedClient(): OAuth2Client {
    
  const credentialsPath = path.join(process.cwd(), 'src/app/credentials/credentials.json');
  const tokenPath = path.join(process.cwd(), 'src/app/credentials/token.json');

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}
/**
 * Duplica um Google Docs.
 */
export async function duplicateGoogleDoc(originalFileId: string, newFileName: string): Promise<string> {
  
    const auth = getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });
  
    const fileMetadata = {
      name: newFileName
    };
  
    const response = await drive.files.copy({
      fileId: originalFileId,
      requestBody: fileMetadata
    });
  
    return response.data.id || '';
  }
