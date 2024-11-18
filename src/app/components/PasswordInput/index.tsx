import { ChangeEvent, useState } from 'react';
import styles from './style.module.scss'
import { PiEye } from "react-icons/pi";
import { PiEyeClosed } from "react-icons/pi";

interface PasswordInputProps{
    id: string,
    label: string,
    placeholder: string,
}
export function PasswordInput ({id, label, placeholder}: PasswordInputProps){
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [toggleEye, setToggleEye] = useState(false)


  const validarSenha = (senha: string): boolean => {
    // Regex para validar a senha:
    // - Pelo menos uma letra maiúscula
    // - Pelo menos um caractere especial
    // - Pelo menos um número
    // - Pelo menos 8 caracteres no total
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(senha);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const senha = e.target.value;
    setPassword(senha);

    // Valida a senha enquanto o usuário digita
    if (!validarSenha(senha)) {
      setError(
        'A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, um número e um caractere especial.'
      );
    } else {
      setError(''); // Remove a mensagem de erro se a senha for válida
    }
  };

  return (
    <div className={styles.inputContainer}>
      <label htmlFor={id}>{label}</label>
      <div  className={styles.divInput}>
        <input
          className={styles.passInput}
          type={toggleEye ? "text" : "password"}
          id={id}
          name={id}
          value={password}
          onChange={handleChange}
          placeholder={placeholder}
      />
        <span className={styles.toggleEye} onClick={() => setToggleEye(!toggleEye)}>
            {toggleEye ? <PiEyeClosed size={20}/> : <PiEye size={20}/>}
        </span>
      </div>
      
      {error && <span className={styles.spanError}>{error}</span>}
    </div>
  );
};