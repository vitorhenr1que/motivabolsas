import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials/credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'credentials/token.json');

/**
 * Solicita o código de autorização do usuário via terminal.
 */
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

/**
 * Gera e salva o token de acesso.
 */
async function generateToken(): Promise<void> {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const credentials = JSON.parse(content);

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔑 Acesse esta URL para autorizar o aplicativo:\n');
  console.log(authUrl);

  const code = await askQuestion('\n📥 Cole aqui o código de autorização: ');

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

  console.log(`\n✅ Token salvo em: ${TOKEN_PATH}`);
}

generateToken().catch(console.error);