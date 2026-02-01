import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import styles from './style.module.scss'
import { FormEvent, useState } from "react";
import { api } from "../../services/api";
import { Loading } from "../Loading";
import { PiEnvelopeSimpleBold } from "react-icons/pi";

export function ModalResetRequest() {
  const [openModal, setOpenModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: FormDataEntryValue) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData)

    if (!validateEmail(data.email)) {
      setError('E-mail inválido. Use o formato: nome@exemplo.com')
      setLoading(false)
      return
    }

    try {
      await api.post('/reset-request', {
        email: data.email
      })
      setLoading(false)
      alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      setOpenModal(false)
    } catch (err: any) {
      console.log(err, 'Erro ao solicitar reset')
      setError(err.response?.data?.message || 'Ocorreu um erro. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={openModal} onOpenChange={(open) => {
      setOpenModal(open)
      if (!open) setError('')
    }}>
      <Dialog.Trigger asChild>
        <button className={styles.resetButton} type="button">Esqueci minha senha</button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.DialogOverlay} />
        <Dialog.Content className={styles.DialogContent}>
          <Dialog.Title className={styles.DialogTitle}>
            Recuperar Senha
          </Dialog.Title>
          <Dialog.Description className={styles.DialogDescription}>
            Não se preocupe! Insira seu e-mail abaixo e enviaremos um link para você criar uma nova senha.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className={styles.contentDiv}>
            <div className={styles.inputWrapper}>
              <PiEnvelopeSimpleBold className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                required
                placeholder="Seu e-mail cadastrado"
                className={styles.inputMail}
              />
            </div>

            {error && <span className={styles.error}>{error}</span>}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading}
            >
              {loading ? <Loading /> : "Enviar link de recuperação"}
            </button>
          </form>

          <Dialog.Close asChild>
            <button className={styles.closeButton} aria-label="Fechar">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}