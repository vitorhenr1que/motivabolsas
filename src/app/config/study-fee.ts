export const CURRENT_STUDY_FEE = 97.00;

export function toStudyFeeAmount(studyFee: unknown): number {
    if (studyFee === null || studyFee === undefined) {
        throw new Error("Taxa de estudo não cadastrada para este aluno.");
    }

    const amount = Number(studyFee);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Taxa de estudo inválida para este aluno.");
    }

    return amount;
}
