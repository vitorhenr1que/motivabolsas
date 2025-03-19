import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import styles from './style.module.scss'
import { FormEvent, useState } from "react";
import { api } from "../../services/api";
import { Loading } from "../Loading";




export function ModalResetRequest() {

        const [openModal, setOpenModal] = useState(false)
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState('')

        const validateEmail = (email: FormDataEntryValue) => { // Função de Validar e-mail
            return String(email)
              .toLowerCase()
              .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              );
          };

        async function handleSubmit(e: FormEvent){
          e.preventDefault()
          setLoading(true)
          
          const formData = new FormData(e.target as HTMLFormElement)
          const data = Object.fromEntries(formData)

           if(!!validateEmail(data.email) === false){ // Verificação de e-mail
                setError('Endereço de e-mail inválido. Por favor, insira um e-mail no formato correto (exemplo: nome@dominio.com).')
                setLoading(false)
                return 
            }

          try {
            await api.post('/reset-request', {
              email: data.email
            })
            setLoading(false)
            alert('E-mail de recuperação enviado! Verifique na sua caixa de entrada.')
            setOpenModal(false)

          } catch(err: any){
            console.log(err, 'Erro com a validação do formulário')
            setError(err.response.data.message)
            setLoading(false)
          }
        }
 
        return (
            <>
              <Dialog.Root open={openModal} onOpenChange={(open) => {
                if(open === true){
                  setOpenModal(true)
                  setError('')
                }else {
                  setOpenModal(false)
                  setError('')
                }
              }}>
    <Dialog.Trigger asChild >
        <span className={styles.resetButton}>Esqueci minha senha</span>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.DialogOverlay} />
      <Dialog.Content className={styles.DialogContent}>

   
        
        <Dialog.Title className={styles.DialogTitle}>Esqueci minha senha</Dialog.Title>
        <Dialog.Description className="DialogDescription">
          Digite o seu e-mail cadastrado para a recuperação da senha.
        </Dialog.Description>

        {/* Conteúdo aqui */}
        <form onSubmit={handleSubmit}>
            <div className={styles.contentDiv}>
                <input type="email" name="email" placeholder="Digite o seu e-mail aqui" className={styles.inputMail}/>
                {error && <span className={styles.error}>{error}</span>}
                <button className={styles.submitButton} type="submit">{loading ? <Loading/> : "Enviar e-mail de redefinição de senha"}</button>
            </div>
        </form>
       
        <Dialog.Close asChild className={styles.close}>
          <button className={styles.IconButton} aria-label="Close">
            <Cross2Icon className={styles.crossIcon} />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root> 
            </>
        )
    
}