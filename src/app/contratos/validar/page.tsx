'use client'

import { api } from '../../services/api'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import styles from './style.module.scss'
import { Loading } from '../../components/Loading'



export default function ValidarPage() {
  const searchParams = useSearchParams()
  const documentoId = searchParams.get('doc')
  const [status, setStatus] = useState<'valido' | 'invalido'>('valido')
  const [motivo, setMotivo] = useState('')
  const [secret_key, setSecretKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSucceess] = useState<string>('')
  const [message, setMessage] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(true)

  const enviarValidacao = async () => {
    try{
        setLoading(true)
        const response = await api.post('contratos/validacao',{
            documentoId, status, motivo, secret_key
        })
        setLoading(false)
        setIsSucceess(styles.divSuccess)
        setMessage('Validação enviada com sucesso!')
        setShowSuccessMessage(true)
        return 
    } catch(e){
        console.log('Erro ao validar: ', e)
        setLoading(false)
        setIsSucceess(styles.divNoSuccess)
        setMessage('Ocorreu um erro ao enviar a validação!')
        setShowSuccessMessage(true)
        return 
    }
    }

  return (
    <div className={styles.container}>
      <h1 className="text-xl font-bold">Validação de Contrato</h1>
      <div className={ showSuccessMessage ? isSuccess : styles.divSuccessIsInv}><strong>{message}</strong></div>
      {documentoId && (
        <iframe
          src={`https://urflzgdnzbwugbvpmzuf.supabase.co/storage/v1/object/public/contratos/${documentoId}`}
          width="100%"
          height="600px"
          className={styles.iframe}
        />
      )}
      <div className={styles.divInputContainer}>

      
        <div className={styles.divInput}>
            <label htmlFor="token">Código de Administrador: </label>
            <input
                className={styles.input}
                placeholder="Token de Administrador"
                name="token"
                id='token'
                type="text"
                value={secret_key}
                onChange={(e) => setSecretKey(e.target.value)}
              />
        </div>
      <div className={styles.divInput}>
        <label htmlFor='status'>Status:</label>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value as 'valido' | 'invalido')}
          name='status'
          id='status'
        >
          <option value="valido">Válido</option>
          <option value="invalido">Inválido</option>
        </select>
      </div>

      {status === 'invalido' && (
        <div className={styles.divInput}>
          <label htmlFor='motivo'>Motivo:</label>
          <input
            className={styles.input}
            id='motivo'
            type="text"
            name='motivo'
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Informe o motivo"
          />

        </div>
      )}
      <div className={styles.divInput}>
      <button
        className={styles.button}
        onClick={enviarValidacao}
      >
        {loading ? <Loading/> : "Enviar Validação"}
      </button>
      </div>
    
      </div>
    </div>
  )
}