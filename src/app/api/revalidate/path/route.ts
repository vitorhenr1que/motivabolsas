import { revalidatePath } from 'next/cache';

export async function GET(req: Request) {
    try {
        // Pega os parâmetros da URL
        const { searchParams } = new URL(req.url);
        const path = searchParams.get("path");

        if (!path) {
            return Response.json({ error: "Parâmetro 'path' é obrigatório" }, { status: 400 });
        }

        // Revalida a página informada
        revalidatePath(path);

        return Response.json({ message: `Página ${path} revalidada com sucesso!` });
    } catch (error) {
        return Response.json({ error: "Erro ao revalidar a página" }, { status: 500 });
    }
}