'use client'
import { useState } from 'react';
import styles from './style.module.scss'
import { useUser } from '../../contexts/user-provider';
import { api } from '@/app/services/api';
import axios from 'axios';
interface cepUfProps{
    cepUf?: string
}
export function UFSelect({cepUf}: cepUfProps) {
  const [selectedUF, setSelectedUF] = useState('');
  const {setCity} = useUser()

  async function getCity(UF: string){ // Pega cidade na api do IBGE e coloca no context setCity
    
    const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${UF}/municipios`)
    setCity(response.data)
  }
  // Lista de siglas de estados do Brasil
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  console.log(selectedUF)

  return (
    <div className={styles.inputContainer}>
      <label htmlFor="uf">Estado: *</label>
      <div className={styles.divInput}>
        {cepUf ? <select id='uf' name='uf' className={styles.cepUf} >
        <option value={cepUf}>
          {cepUf}
        </option>
        </select> :
        <select id='uf' name='uf' className={styles.select} onChange={(e) => getCity(e.target.value)}>
        <option value={""}>Selecione</option>
        {estados.map((uf) => (
          <option key={uf} value={uf}>
            {uf}
          </option>
        ))}
        </select>
        }
     
      </div>

    </div>
  );
}