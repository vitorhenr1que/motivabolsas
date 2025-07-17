import { replaceMultipleTextsInGoogleDoc } from '@/app/services/googleDocsReplace';
import { duplicateGoogleDoc } from '../../services/googleApisAuth';
import { NextResponse } from 'next/server';
import { calcularSemestre } from '../../scripts/calcularSemestre';
import { calcularDesconto } from '../../scripts/calcularDesconto';

export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { newName, name, course, instituition, cpf, discount, createdAt } = body;

      const fileId = instituition.toUpperCase() === "FAZAG" ? "1BWGjxinMQS3CJIVGml3JI25CiFVxTcsCg7bKALDNBI4" : "1fh6VNGlWVydrYG1ePnzFH_89lSgt_o3thOzV_YfVna4"

      if (!fileId || typeof fileId !== 'string') {
        return NextResponse.json({ error: 'fileId inválido.' }, { status: 400 });
      }
  
      const newFileId = await duplicateGoogleDoc(fileId, newName || 'Comprovante de Bolsa - Motiva Bolsas');
console.log(newFileId)
      await replaceMultipleTextsInGoogleDoc(newFileId, [
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
      ])
      return NextResponse.json({
        message: 'Documento duplicado com sucesso!',
        newFileId
      });
    } catch (error) {
      console.error('Erro ao duplicar:', error);
      return NextResponse.json({ error: 'Erro ao duplicar documento.' }, { status: 500 });
    }
  }