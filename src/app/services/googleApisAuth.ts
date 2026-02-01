import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';
const SCOPES = ['https://www.googleapis.com/auth/drive'];
/**
 * Retorna cliente OAuth2 autenticado.
 */
export function getAuthenticatedClient(): OAuth2Client {
  // Credenciais do cliente OAuth 2.0
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  // Tokens de acesso (access_token e refresh_token)
  const token = {
    access_token: process.env.GOOGLE_ACCESS_TOKEN!,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
    scope: process.env.GOOGLE_TOKEN_SCOPE || 'https://www.googleapis.com/auth/drive',
    token_type: 'Bearer',
    expiry_date: Number(process.env.GOOGLE_TOKEN_EXPIRY_DATE) || undefined
  };

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

// DUPLICAR DOCUMENTOS GOOGLE DOCS
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


// SUBSTITUIR TEXTOS DOS DOCUMENTOS
export async function replaceTextsAndImagesInGoogleDoc(
  documentId: string,
  textReplacements: { searchText: string, replaceText: string }[],
  imageReplacements: { imageObjectId: string, imageUrl: string }[]
): Promise<void> {
  const auth = getAuthenticatedClient();
  const docs = google.docs({ version: 'v1', auth });

  // Substituições de texto
  const textRequests = textReplacements.map(item => ({
    replaceAllText: {
      containsText: {
        text: item.searchText,
        matchCase: false
      },
      replaceText: item.replaceText
    }
  }));

  // Substituições de imagens
  const imageRequests = imageReplacements.map(item => ({
    replaceImage: {
      imageObjectId: item.imageObjectId,
      imageReplaceMethod: 'CENTER_CROP', // Ou 'UNSPECIFIED'
      uri: `${item.imageUrl}`
    }
  }));

  // Unifica as requisições
  const requests = [...textRequests, ...imageRequests];

  // Executa o batchUpdate
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: requests
    }
  });

  console.log(`Textos e imagens substituídos no documento ${documentId}`);
}


// EXPORTAR DOC > PDF COMO BUFFER (BINÁRIO) 
export async function exportGoogleDocAsPDF(documentId: string): Promise<Buffer> {
  const auth = getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.export(
    {
      fileId: documentId,
      mimeType: 'application/pdf'
    },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(res.data as ArrayBuffer);
}

// DELETAR DOCUMENTOS
export async function deleteGoogleDoc(documentId: string): Promise<void> {
  const auth = getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  await drive.files.delete({
    fileId: documentId
  });

  console.log(`Documento ${documentId} deletado do Google Drive.`);
}




// UPLOAD DE PDF PARA O DRIVE
// UPLOAD DE PDF PARA O DRIVE
export async function uploadPDFToDrive(
  fileName: string,
  pdfBuffer: Buffer | Uint8Array,
  folderId?: string
): Promise<string> {
  const auth = getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
    mimeType: 'application/pdf',
  };

  // Convert Buffer to Readable Stream
  const bufferStream = new Readable();
  bufferStream.push(Buffer.from(pdfBuffer));
  bufferStream.push(null); // Signal end of stream

  const media = {
    mimeType: 'application/pdf',
    body: bufferStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });

  return response.data.id || '';
}

// BAIXAR ARQUIVO DO DRIVE (Qualquer tipo, ex: PDF pronto)
export async function downloadFileFromDrive(fileId: string): Promise<Buffer> {
  const auth = getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(res.data as ArrayBuffer);
}

// OBTER PARENT FOLDER ID
export async function getFileParents(fileId: string): Promise<string[]> {
  const auth = getAuthenticatedClient();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.get({
    fileId,
    fields: "parents",
  });

  return res.data.parents || [];
}

// RETORNAR TODAS AS IMAGE ID DO DOCUMENTO (Não pode estar em frente ao texto)
export async function listImageObjectIds(documentId: string): Promise<string[]> {
  const auth = getAuthenticatedClient();
  const docs = google.docs({ version: 'v1', auth });

  const response = await docs.documents.get({ documentId });

  const documentBody = response.data.body?.content || [];

  const imageObjectIds: string[] = [];

  for (const element of documentBody) {
    const paragraph = element.paragraph;

    if (paragraph && paragraph.elements) {
      for (const el of paragraph.elements) {
        if (el.inlineObjectElement) {
          const objectId = el.inlineObjectElement.inlineObjectId;
          if (objectId) {
            imageObjectIds.push(objectId);
          }
        }
      }
    }
  }

  console.log(`Imagens encontradas: ${imageObjectIds.length}`);
  console.log(imageObjectIds);

  return imageObjectIds;
}
