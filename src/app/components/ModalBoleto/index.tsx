import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import styles from './style.module.scss'
import * as ToggleGroup  from "@radix-ui/react-toggle-group";
import { FormEvent, useEffect, useState } from "react";
import { api } from "../../services/api";
import { Loading } from "../Loading";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { ModalContent } from "./ModalContent";
import { useUser } from "../contexts/user-provider";
import { BoletoGerado } from "./BoletoGerado";

interface ModalContentProps{
    cpf: string;
    name: string;
    email: string;
    ddd: string;
    tel: string;
    houseNumber: string;
    complement: string;
    person: string;
    street: string;
    neighborhood: string;
    city: string;
    uf: string;
    cep: string;
}


export function ModalBoleto({cpf, name, email, ddd, tel, houseNumber, complement, person, street, neighborhood, city, uf, cep}: ModalContentProps) {

        const [procurouFAZAG, setProcurouFAZAG] = useState('Sim')
        const [openModal, setOpenModal] = useState(false)
        const [loading, setLoading] = useState(false)
        const [sevenNextDays, setSevenNextDays] = useState("")
        const [twoMonthsAgo, setTwoMonthsAgo] = useState("")
        const {setModalUser, codigoSolicitacao, setCodigoSolicitacao} = useUser()

        async function handleSubmit(e: FormEvent){
          e.preventDefault()
          setLoading(true)
          
          const formData = new FormData(e.target as HTMLFormElement)
          const data = Object.fromEntries(formData)
          
          try {
            await api.post('/ouvidoria/create', {
              nome: data.nome,
              email: data.email,
              motivo: data.motivo,
              text: data.text,
              vinculo: data.vinculo,
              procurouSetor: procurouFAZAG
            })

            await api.post('/ouvidoria/nodemailer', {
              nome: data.nome,
              email: data.email,
              motivo: data.motivo,
              text: data.text,
              vinculo: data.vinculo,
              procurouSetor: procurouFAZAG
            }) 
            setLoading(false)
            
            alert('Mensagem enviada!')
            setOpenModal(false)
          } catch(err){
            console.log(err, 'Erro com a validação do formulário')
          }
        }
        const getFormattedDate = (date: Date): string => date.toISOString().split("T")[0];
        useEffect(()=>{
            const today = new Date();
            today.setDate(today.getDate() + 7)
            setSevenNextDays(getFormattedDate(today));
            
            const pastDate = new Date();
            pastDate.setMonth(today.getMonth() - 2); // Quantidade de meses atrás
            setTwoMonthsAgo(getFormattedDate(pastDate));

            setModalUser({cpf, name, email, ddd, tel, houseNumber, complement, person, street, neighborhood, city, uf, cep})
            console.log('modalUser selected!')
        },[])
        return (
            <>
              <Dialog.Root open={openModal} onOpenChange={(open) => {
                if(open === true){
                  setOpenModal(true)
                }else {
                  setOpenModal(false)
                  setCodigoSolicitacao(undefined) // remove o código gerado do contexto ao fechar o modal
                }
              }}>
    <Dialog.Trigger asChild >
      <button className={`${styles.btnModal} btn btn-light`}>
        <FaFileInvoiceDollar size={24} className={styles.icon}/>
        <span>Boleto/Pix</span>
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.DialogOverlay} />
      <Dialog.Content className={styles.DialogContent}>

        {loading && <Loading/>}
        
        <Dialog.Title className={styles.DialogTitle}>Boletos</Dialog.Title>
        <Dialog.Description className="DialogDescription">
          Lista de boletos.
        </Dialog.Description>

        {/* Conteúdo aqui */}
        {codigoSolicitacao ? 
        <BoletoGerado/> : 
        <ModalContent
            cpf={cpf}
            sevenNextDays={sevenNextDays}
            twoMonthsAgo={twoMonthsAgo}
        />
        }
        
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