export function calcularDesconto(curso: string, desconto: string | null): number {
    const descontosPadroes: Record<string, number> = {
      'Administração': 40,
      'Ciências Contábeis': 40,
      'Educação Física': 40,
      'Educação Física (Licenciatura)': 40,
      'Educação Física (Bacharelado)': 40,
      'Engenharia Civil': 40,
      'Enfermagem': 40,
      'Estética e Cosmética': 40,
      'Farmácia': 40,
      'Fisioterapia': 40,
      'Nutrição': 40,
      'Pedagogia': 40,
      'Psicologia': 30,
      'Serviço Social': 40
    };
  
    return desconto !== null
      ? parseInt(desconto)
      : (descontosPadroes[curso] || 0);
  }