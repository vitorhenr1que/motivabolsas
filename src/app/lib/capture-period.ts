import { prisma } from "../services/prisma";
import { calcularSemestre } from "../scripts/calcularSemestre";

export async function getCapturePeriod() {
  const settings = await prisma.captureSettings.findUnique({
    where: { id: "global" },
  });

  // Preserva o semestre automático até o administrador configurar a captação.
  return settings?.period ?? calcularSemestre(new Date());
}
