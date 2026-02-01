'use client'
import ReactInputMask from "react-input-mask";
import styles from './style.module.scss'
import { useState } from "react";
import { PiPhoneBold } from 'react-icons/pi';

interface PhoneInputProps {
  error?: string;
}

function PhoneInput({ error }: PhoneInputProps) {
  const [phone, setPhone] = useState('')
  return (
    <div className={styles.inputContainer}>
      <label htmlFor="phone">WhatsApp</label>
      <div className={`${styles.divInput} ${error ? styles.error : ''}`}>
        <PiPhoneBold className={styles.inputIcon} />
        <ReactInputMask
          mask="(99) 99999-9999"
          maskChar={null}
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        >
          {(inputProps: any) => <input id="phone" name="phone" {...inputProps} type="text" />}
        </ReactInputMask>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export default PhoneInput;