import { NextResponse } from 'next/server';
import { calcularSemestre } from '../../scripts/calcularSemestre';
import { calcularDesconto } from '../../scripts/calcularDesconto';
import {
  exportGoogleDocAsPDF,
  replaceTextsAndImagesInGoogleDoc,
  duplicateGoogleDoc,
  deleteGoogleDoc
} from '../../services/googleApisAuth';
import axios from 'axios';

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let newFileId = ''; // o finally não pega variáveis de dentro do try
  const url = new URL(request.url);
  const baseUrl = url.origin;

  try {
    const { newName, name, course, instituition, cpf, discount, createdAt, id } =
      await request.json();

    const fileId =
      instituition.toUpperCase() === "FAZAG"
        ? "1BWGjxinMQS3CJIVGml3JI25CiFVxTcsCg7bKALDNBI4"
        : "1fh6VNGlWVydrYG1ePnzFH_89lSgt_o3thOzV_YfVna4";

    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json({ error: 'fileId inválido.' }, { status: 400 });
    }

    // 1) Duplicar doc
    newFileId = await duplicateGoogleDoc(
      fileId,
      newName || 'Comprovante de Bolsa - Motiva Bolsas'
    );

    if (!newFileId) {
      return NextResponse.json(
        { error: 'Erro ao criar cópia do comprovante.' },
        { status: 500 }
      );
    }

    console.log("Novo documento:", newFileId);

    // 2) Pegar image_id do doc duplicado
    const objectId = await axios.post(`${baseUrl}/api/find-image-doc-id`, {
      newFileId
    });

    // 3) Substituir textos e imagem
    await replaceTextsAndImagesInGoogleDoc(
      newFileId,
      [
        { searchText: `{{DATA_PAGAMENTO}}`, replaceText: `${new Date().toLocaleDateString('pt-BR')}` },
        { searchText: `{{DATA_ATUAL}}`, replaceText: `${new Date().toLocaleDateString('pt-BR')}` },
        { searchText: `{{HORARIO_ATUAL}}`, replaceText: `${new Date().toLocaleTimeString('pt-BR')}` },
        { searchText: `{{NOME_ALUNO}}`, replaceText: `${name}` },
        { searchText: `{{CPF}}`, replaceText: `${cpf}` },
        { searchText: `{{CURSO}}`, replaceText: `${course.toUpperCase()}` },
        { searchText: `{{DESC}}`, replaceText: `${calcularDesconto(course, discount)}` },
        { searchText: `{{IES}}`, replaceText: `${instituition}` },
        { searchText: `{{PERIODO}}`, replaceText: calcularSemestre(new Date()) },
        { searchText: `{{INGRESSO}}`, replaceText: calcularSemestre(createdAt) }
      ],
      [
        {
          imageObjectId: `${objectId.data.image_id}`,
          imageUrl: `${baseUrl}/api/qrcode?text=${baseUrl}/consulta/${id}`
        }
      ]
    );

    // 4) Exportar para PDF (Buffer)
    const pdfBuffer = await exportGoogleDocAsPDF(newFileId);

    // 5) Retornar como download (Buffer -> Uint8Array)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="documento.pdf"',
        'x-document-id': newFileId
      }
    });
  } catch (error: any) {
    console.error('Erro ao duplicar:', error);

    const details =
      error?.response?.data || // quando é erro de axios (ex: find-image-doc-id)
      error?.errors ||         // padrão googleapis em alguns casos
      error?.message ||        // padrão JS
      "Erro desconhecido";

    return NextResponse.json(
      { error: 'Erro ao duplicar documento.', details },
      { status: 500 }
    );
  } finally {
    // 6) Excluir doc duplicado após responder
    if (newFileId) {
      try {
        await deleteGoogleDoc(newFileId);
      } catch (deletionError) {
        console.error('Erro ao deletar o documento:', deletionError);
      }
    }
  }
}
