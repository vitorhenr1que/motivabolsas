import { NextResponse } from 'next/server';
import { prisma } from '../../services/prisma';
import {
    exportGoogleDocAsPDF,
    replaceTextsAndImagesInGoogleDoc,
    duplicateGoogleDoc
} from '../../services/googleApisAuth';

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
    let newFileId = '';

    try {
        const {
            name,
            cpf,
            semestre_atual,
            course,
            discount,
            dataAtual
        } = await request.json();

        // 1. Template do contrato
        const templateId = "1TkaZv_bzwoHmbG_n_5xGZnbODw1uStt8dtzJokLHOzk";

        // 2. Definição da duração do curso
        let duracao = "0";

        const courses4 = [
            "Administração",
            "Ciências Contábeis",
            "Educação Física (Bacharelado)",
            "Educação Física (Licenciatura)",
            "Nutrição",
            "Pedagogia",
            "Serviço Social"
        ];

        const courses2_5 = ["Estética e Cosmética"];

        const courses5 = [
            "Enfermagem",
            "Engenharia Civil",
            "Fisioterapia",
            "Farmácia",
            "Psicologia"
        ];

        if (courses4.includes(course)) duracao = "4";
        else if (courses2_5.includes(course)) duracao = "2,5";
        else if (courses5.includes(course)) duracao = "5";

        // 3. Duplicar o template no Drive
        newFileId = await duplicateGoogleDoc(
            templateId,
            `Contrato - ${name} (FAZAG)`
        );

        if (!newFileId) {
            return NextResponse.json(
                { error: 'Erro ao criar cópia do contrato.' },
                { status: 500 }
            );
        }

        // 4. Substituir placeholders
        await replaceTextsAndImagesInGoogleDoc(
            newFileId,
            [
                { searchText: '{{NOME_COMPLETO}}', replaceText: name },
                { searchText: '{{CPF}}', replaceText: cpf },
                { searchText: '{{PERIODO}}', replaceText: semestre_atual },
                { searchText: '{{CURSO}}', replaceText: course },
                { searchText: '{{DESCONTO}}', replaceText: discount },
                { searchText: '{{DURACAO}}', replaceText: duracao },
                { searchText: '{{DATA_ATUAL}}', replaceText: dataAtual },
            ],
            []
        );

        // 5. Exportar para PDF
        const pdfBuffer = await exportGoogleDocAsPDF(newFileId);

        // 6. Retornar PDF para download (Buffer -> Uint8Array)
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Contrato - ${name.replace(/\s+/g, '_')} (FAZAG).pdf"`,
            },
        });

    } catch (err: any) {
        console.error("download-contrato error:", err);

        // IMPORTANTE: retornar texto/json pra você conseguir ler pelo blob.text()
        return NextResponse.json(
            { error: "Falha ao gerar contrato", detail: err?.message ?? String(err) },
            { status: 500 }
        );
    }
}
