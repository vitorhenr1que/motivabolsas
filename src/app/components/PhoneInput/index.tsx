'use client'
import ReactInputMask from "react-input-mask";
import styles from './style.module.scss'
import { useState } from "react";

function PhoneInput() {
   const [phone, setPhone] = useState('')
   console.log(phone)
  return (
    <div className={styles.inputContainer}>
        
            <label htmlFor="phone">Telefone:</label>
            <div className={styles.divInput}>
         <ReactInputMask
          mask="(99) 99999-9999"
           placeholder="(XX) XXXXX-XXXX"
         >
          {(inputProps) => <input id="phone" name="phone" {...inputProps} type="text" />}
         </ReactInputMask>
        </div>
    </div>
  );
}

export default PhoneInput;