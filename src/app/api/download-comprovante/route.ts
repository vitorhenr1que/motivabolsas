import { NextResponse } from 'next/server';
import { calcularSemestre } from '../../scripts/calcularSemestre';
import { calcularDesconto } from '../../scripts/calcularDesconto';
import { exportGoogleDocAsPDF,replaceTextsAndImagesInGoogleDoc, duplicateGoogleDoc, deleteGoogleDoc } from '../../services/googleApisAuth';
import { api } from '../../services/api';

export async function POST(request: Request) {
    let newFileId = '' // o finally não pega variáveis de detro do try
    const url = new URL(request.url);
    const baseUrl = url.origin;
    
    try {
      const { newName, name, course, instituition, cpf, discount, createdAt, id } = await request.json();
       

      const fileId = instituition.toUpperCase() === "FAZAG" ? "1BWGjxinMQS3CJIVGml3JI25CiFVxTcsCg7bKALDNBI4" : "1fh6VNGlWVydrYG1ePnzFH_89lSgt_o3thOzV_YfVna4"
      
      if (!fileId || typeof fileId !== 'string') {
        return NextResponse.json({ error: 'fileId inválido.' }, { status: 400 });
      }
  
      newFileId = await duplicateGoogleDoc(fileId, newName || 'Comprovante de Bolsa - Motiva Bolsas'); //Duplica e retorna o ID do novo documento
      console.log(newFileId)
      const objectId = await api.post('find-image-doc-id',{  // Pegar o id da imagem do novo documento fazendo outra chamada do google
        newFileId,
       })
       
      await replaceTextsAndImagesInGoogleDoc(newFileId, [ // Substituir o texto do documento
        {searchText: `{{DATA_PAGAMENTO}}`, replaceText: `${new Date().toLocaleDateString('pt-BR')}`},
        {searchText: `{{DATA_ATUAL}}`, replaceText: `${new Date().toLocaleDateString('pt-BR')}`},
        {searchText: `{{HORARIO_ATUAL}}`, replaceText: `${new Date().toLocaleTimeString('pt-BR')}`},
        {searchText: `{{NOME_ALUNO}}`, replaceText: `${name}`},
        {searchText: `{{CPF}}`, replaceText: `${cpf}`},
        {searchText: `{{CURSO}}`, replaceText: `${course.toUpperCase()}`},
        {searchText: `{{DESC}}`, replaceText: `${calcularDesconto(course, discount)}`},
        {searchText: `{{IES}}`, replaceText: `${instituition}`},
        {searchText: `{{PERIODO}}`, replaceText: calcularSemestre(new Date())},
        {searchText: `{{INGRESSO}}`, replaceText: calcularSemestre(createdAt)}
      ],
      [
        {imageObjectId: `${objectId.data.image_id}`, imageUrl: `${baseUrl}/api/qrcode?text=${baseUrl}/consulta/${id}`} // ID da imagem e a url
      ])

      const pdfBuffer = await exportGoogleDocAsPDF(newFileId); // Exportar o doc para pdf em buffer (binário)

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="documento.pdf"',
          'x-document-id': newFileId // opcional: enviar ID do novo documento como header
        }
      });
    } catch (error) {
      console.error('Erro ao duplicar:', error);
      return NextResponse.json({ error: 'Erro ao duplicar documento.' }, { status: 500 });
    } finally {
      // 4️⃣ Exclusão do documento duplicado (após envio)
      if (newFileId) {
        try {
           await deleteGoogleDoc(newFileId);
        } catch (deletionError) {
          console.error('Erro ao deletar o documento:', deletionError);
          // Obs: Não interrompe o fluxo do usuário mesmo que a exclusão falhe
        }
      }
    }
  }