import { ChangeEvent, useState } from 'react';
import styles from './style.module.scss'
import { PiEye, PiEyeClosed, PiLockKeyBold } from "react-icons/pi";

interface PasswordInputProps {
  id: string,
  label: string,
  placeholder: string,
}

export function PasswordInput({ id, label, placeholder }: PasswordInputProps) {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [toggleEye, setToggleEye] = useState(false)

  const validarSenha = (senha: string): boolean => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(senha);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const senha = e.target.value;
    setPassword(senha);

    if (senha && !validarSenha(senha)) {
      setError('Mínimo 8 caracteres, uma letra maiúscula, um número e um caractere especial.');
    } else {
      setError('');
    }
  };

  return (
    <div className={styles.inputContainer}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.divInput}>
        <PiLockKeyBold className={styles.inputIcon} />
        <input
          className={styles.passInput}
          type={toggleEye ? "text" : "password"}
          id={id}
          name={id}
          value={password}
          onChange={handleChange}
          placeholder={placeholder}
          required={true}
        />
        <span className={styles.toggleEye} onClick={() => setToggleEye(!toggleEye)}>
          {toggleEye ? <PiEyeClosed size={20} /> : <PiEye size={20} />}
        </span>
      </div>
      {error && <span className={styles.spanError}>{error}</span>}
    </div>
  );
};
