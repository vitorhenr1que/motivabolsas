import { getAuthenticatedClient } from "@/app/services/googleApisAuth";
import { google } from "googleapis";
import { NextResponse } from "next/server";

function extractImageObjectIds(content: any[], images: string[]) {
    if (!content) return;
  
    for (const element of content) {
      const paragraphElements = element.paragraph?.elements || [];
      const table = element.table;
      const tableOfContents = element.tableOfContents;
  
      for (const el of paragraphElements) {
        // Imagens inline
        const inlineId = el.inlineObjectElement?.inlineObjectId;
        if (inlineId) {
          images.push(inlineId);
        }
  
        // Imagens posicionadas (em frente ao texto)
        const positionedId = el.positionedObjectElement?.positionedObjectId;
        if (positionedId) {
          images.push(positionedId);
        }
      }
  
      // Tabelas
      if (table?.tableRows) {
        for (const row of table.tableRows) {
          for (const cell of row.tableCells) {
            extractImageObjectIds(cell.content, images);
          }
        }
      }
  
      // Sumário
      if (tableOfContents?.content) {
        extractImageObjectIds(tableOfContents.content, images);
      }
    }
  }

  export async function POST(request: Request) {
    const auth = getAuthenticatedClient();
    const docs = google.docs({ version: 'v1', auth });
    const {newFileId} = await request.json()
    
    try {
      const documentId = newFileId;
      const res = await docs.documents.get({ documentId });
  
      const imageObjectIds: string[] = [];
  
      extractImageObjectIds(
        res.data.body?.content || [],
        imageObjectIds
      );
  
      return NextResponse.json( {image_id: imageObjectIds[0]} );
  
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Erro ao buscar imagens.' }, { status: 500 });
    }
  }