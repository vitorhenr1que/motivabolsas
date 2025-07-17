import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getAuthenticatedClient } from './googleApisAuth';

/**
 * Substitui múltiplos textos dentro do documento.
 */
export async function replaceMultipleTextsInGoogleDoc(
  documentId: string,
  replacements: { searchText: string, replaceText: string }[]
): Promise<void> {
  const auth = getAuthenticatedClient();
  const docs = google.docs({ version: 'v1', auth });

  const requests = replacements.map(item => ({
    replaceAllText: {
      containsText: {
        text: item.searchText,     // Ex: {{nome}}
        matchCase: false
      },
      replaceText: item.replaceText  // Ex: João
    }
  }));

  await docs.documents.batchUpdate({
    documentId: documentId,
    requestBody: {
      requests: requests
    }
  });

  console.log(`Substituições concluídas no documento ${documentId}`);
}