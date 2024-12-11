'use client'
import { useEffect, useState } from 'react';
import styles from './style.module.scss'
import { City, useUser } from '../../contexts/user-provider';
interface cepUfProps{
    cepCity?: string
}
export function CitySelect({cepCity}: cepUfProps) {
  const [selectedUF, setSelectedUF] = useState('');
  const {city} = useUser()
  // Lista de siglas de estados do Brasil
  useEffect(() => {
    console.log(city)
  }, [city])

  return (
    <div className={styles.inputContainer}>
      <label htmlFor="uf">Cidade: *</label>
      <div className={styles.divInput}>
      <select id="city" name="city" className={cepCity ? styles.cepCity : styles.select} value={selectedUF} onChange={(e) => setSelectedUF(e.target.value)}>
      {cepCity ?
        <option value={cepCity}>
          {cepCity}
        </option>
        :
        <>
        <option value={""}>Selecione</option>
        {city?.map((index) => {
         return <option key={index.id} value={index.nome}>{index.nome}</option>
        })}
        </>
        }
        
      </select>
      </div>
 
    </div>
  );
}