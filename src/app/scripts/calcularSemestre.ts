export function calcularSemestre(dateInput: Date | string) {
    const data = new Date(dateInput);  // Aceita ISO ou Date
    const anoAtual = data.getFullYear();
    const mes = data.getMonth() + 1;   // getMonth() começa do 0
  
    let anoSemestre;
    let semestre;
  
    if (mes >= 10 || mes <= 4) {
      // Outubro até Abril (ano seguinte .1)
      semestre = 1;
      anoSemestre = (mes >= 10) ? anoAtual + 1 : anoAtual;
    } else {
      // Maio até Setembro (ano atual .2)
      semestre = 2;
      anoSemestre = anoAtual;
    }
  
    return `${anoSemestre}.${semestre}`;
  }