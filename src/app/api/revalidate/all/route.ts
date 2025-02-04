import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        revalidatePath("/"); // Revalida todo o site

        return Response.json({ message: "Todas as páginas foram revalidadas" });
    } catch (error) {
        return Response.json({ error: "Erro ao revalidar" }, { status: 500 });
    }
}