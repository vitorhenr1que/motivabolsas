import { ChangeEvent, useState } from 'react';
import styles from './style.module.scss'
import { PiEye, PiEyeClosed, PiLockKeyBold } from "react-icons/pi";

interface PasswordInputProps {
  id: string,
  label: string,
  placeholder: string,
  name?: string,
  required?: boolean,
  value?: string,
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export function PasswordInput({ id, label, placeholder, name, required, value, onChange }: PasswordInputProps) {
  const [internalPassword, setInternalPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [toggleEye, setToggleEye] = useState(false)

  const isControlled = value !== undefined;
  const password = isControlled ? value : internalPassword;

  const validarSenha = (senha: string): boolean => {
    // A validação pode ser feita aqui ou no pai. Vamos manter aqui também para feedback visual se não for controllado ou se quiserem feedback imediato
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(senha);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const senha = e.target.value;

    if (!isControlled) {
      setInternalPassword(senha);
    }

    if (onChange) {
      onChange(e);
    }

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
          name={name || id}
          value={password}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
        />
        <span className={styles.toggleEye} onClick={() => setToggleEye(!toggleEye)}>
          {toggleEye ? <PiEyeClosed size={20} /> : <PiEye size={20} />}
        </span>
      </div>
      {error && <span className={styles.spanError}>{error}</span>}
    </div>
  );
};
