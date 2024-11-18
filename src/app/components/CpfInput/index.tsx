import { useState } from 'react';
import styles from './style.module.scss'

export function CPFInput() {

  const [cpf, setCpf] = useState<string>('');
  const [error, setError] = useState<string>('');

  const formatarCPF = (cpf: string): string => {
    // Remove tudo que não for número
    cpf = cpf.replace(/\D/g, '');

    // Adiciona a pontuação automaticamente (XXX.XXX.XXX-XX)
    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (cpf.length > 6) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (cpf.length > 3) {
      cpf = cpf.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }

    return cpf;
  };

  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, ''); // Remove pontuações

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false; // Verifica se tem 11 dígitos ou se todos os números são iguais
    }

    let soma = 0;
    let resto;

    // Validação do primeiro dígito
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    // Validação do segundo dígito
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cpfFormatado = formatarCPF(e.target.value);
    setCpf(cpfFormatado);

    // Verifica o CPF apenas se ele estiver completo (XXX.XXX.XXX-XX)
    if (cpfFormatado.length === 14) {
      if (!validarCPF(cpfFormatado)) {
        setError("CPF inválido. Por favor, insira um CPF válido.");
        setCpf('')
      } else {
        setError(''); // Remove a mensagem de erro se o CPF for válido
        
      }
    } else {
      setError(''); // Limpa o erro se o CPF ainda não estiver completo
    }
  };


  return (
    <div className={styles.inputContainer}>
      <label htmlFor="cpf">CPF:</label>
      <input 
        className={styles.cpf}
        type="text"
        id="cpf"
        name="cpf"
        value={cpf}
        onChange={handleChange}
        maxLength={14}
        placeholder="Digite seu CPF"
      />
      {error && <span className={styles.spanError}>{error}</span>}
    </div>
  );
}