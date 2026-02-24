import * as Dialog from "@radix-ui/react-dialog";
import styles from './style.module.scss'
import { FormEvent, useEffect, useState } from "react";
import { api } from "../../services/api";
import { Loading } from "../Loading";
import { PiReceipt, PiX } from "react-icons/pi";
import { ModalContent } from "./ModalContent";
import { useUser } from "../contexts/user-provider";
import { BoletoGerado } from "./BoletoGerado";

interface ModalContentProps {
  userId: string;
  adminKey: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
}


export function ModalBoleto({ userId, adminKey, cpf: initialCpf, name: initialName, email: initialEmail, phone: initialPhone }: ModalContentProps) {

  const [procurouFAZAG, setProcurouFAZAG] = useState('Sim')
  const [openModal, setOpenModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sevenNextDays, setSevenNextDays] = useState("")
  const [twoMonthsAgo, setTwoMonthsAgo] = useState("")
  const { setModalUser, codigoSolicitacao, setCodigoSolicitacao } = useUser()

  const [userData, setUserData] = useState({
    cpf: initialCpf,
    name: initialName,
    email: initialEmail,
    ddd: initialPhone.replace(/\D/g, '').substring(0, 2),
    tel: initialPhone.replace(/\D/g, '').substring(2),
    houseNumber: '',
    complement: '',
    person: 'Física',
    street: '',
    neighborhood: '',
    city: '',
    uf: '',
    cep: ''
  })

  async function fetchFullUserData() {
    setLoading(true)
    try {
      const response = await api.get(`usuarios/${userId}?secret_key=${adminKey}`)
      const user = response.data
      const addr = user.addresses?.[0] || {}

      const newData = {
        cpf: user.cpf,
        name: user.name,
        email: user.email,
        ddd: user.phone.replace(/\D/g, '').substring(0, 2),
        tel: user.phone.replace(/\D/g, '').substring(2),
        houseNumber: addr.number || '',
        complement: addr.complement || '',
        person: 'Física',
        street: addr.street || '',
        neighborhood: addr.neighborhood || '',
        city: addr.city || '',
        uf: addr.uf || '',
        cep: addr.cep || ''
      }

      setUserData(newData)
      setModalUser(newData)
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
      alert("Erro ao carregar endereço do usuário.")
    }
  }

  const getFormattedDate = (date: Date): string => date.toISOString().split("T")[0];

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7)
    setSevenNextDays(getFormattedDate(today));

    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - 2);
    setTwoMonthsAgo(getFormattedDate(pastDate));
  }, [])

  return (
    <>
      <Dialog.Root open={openModal} onOpenChange={(open) => {
        if (open === true) {
          setOpenModal(true)
          fetchFullUserData()
        } else {
          setOpenModal(false)
          setCodigoSolicitacao(undefined)
        }
      }}>
        <Dialog.Trigger asChild >
          <button className={styles.btnModal}>
            <PiReceipt size={20} />
            <span>Boleto</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.DialogOverlay} />
          <Dialog.Content className={styles.DialogContent}>

            {loading && <Loading />}

            <Dialog.Title className={styles.DialogTitle}>Boletos</Dialog.Title>
            <Dialog.Description className={styles.DialogDescription}>
              Gerencie e visualize os boletos do aluno.
            </Dialog.Description>

            {codigoSolicitacao ?
              <BoletoGerado /> :
              <ModalContent
                cpf={userData.cpf}
                sevenNextDays={sevenNextDays}
                twoMonthsAgo={twoMonthsAgo}
              />
            }

            <Dialog.Close asChild className={styles.close}>
              <button aria-label="Close">
                <PiX size={20} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}