'use client'
import { LuCopy, LuCopyCheck } from 'react-icons/lu'
import styles from './style.module.scss'
import { useState } from 'react';

interface InfoCampProps{
    campName: string,
    campValue: string
}

export function InfoCamp({campName, campValue}: InfoCampProps){
    const [copied, setCopied] = useState(false)
    const handleCopy = async (text:string) => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (error) {
          console.error("Falha ao copiar o texto: ", error);
        }
      };

    return (
        <>
        <hr  className={styles.hr}/>
        <div className={styles.infoDiv}>
             <p><strong>{campName} </strong><span>{campValue}</span></p>
             <button className={styles.copyButton} onClick={() => handleCopy(campValue)}>{copied ? <LuCopyCheck size={16}/> : <LuCopy size={16}/>}<span>Copiar</span></button>
        </div>
        </>
        
    )
}