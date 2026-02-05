import { useUser } from '@/app/components/contexts/user-provider'
import styles from './style.module.scss'
import { api } from '@/app/services/api'
import { Loading } from '@/app/components/Loading'
import { useEffect, useState } from 'react'
import { PiPlusCircleBold } from "react-icons/pi";



export function ButtonGenerate() {
    const { interToken, modalUser, setCodigoSolicitacao, codigoSolicitacao } = useUser()
    const [loading, setLoading] = useState(false)

    async function handleClickGenerateBoleto() {
        setLoading(true)
        try {
            const response = await api.post('boletos/create', {
                interToken: interToken,
                email: modalUser?.email,
                ddd: modalUser?.ddd,
                phone: modalUser?.tel,
                houseNumber: modalUser?.houseNumber,
                complement: modalUser?.complement,
                cpf: modalUser?.cpf,
                name: modalUser?.name.toUpperCase(),
                street: modalUser?.street,
                city: modalUser?.city,
                neighborhood: modalUser?.neighborhood,
                uf: modalUser?.uf,
                cep: modalUser?.cep
            })

            setLoading(false)
            setCodigoSolicitacao(response.data.codigoSolicitacao)
            console.log(response.data) // codigoSolicitacao: "90400f95-3cb3-474e-b95a-42127e6b210a"

            return response.data
        } catch (e: any) {
            setLoading(false)
            console.log(e)
            return alert(`Erro: ${e.message}`)
        }
    }
    // async function handleClickGenerateBoleto(){
    //     setLoading(true)
    //     setCodigoSolicitacao("90400f95-3cb3-474e-b95a-42127e6b210a")
    //     setLoading(false)
    // }
    useEffect(() => {
        console.log(codigoSolicitacao)
    }, [codigoSolicitacao])
    return (
        <div className={styles.buttonWrapper}>
            <button
                className={styles.buttonGenerate}
                disabled={loading}
                onClick={() => handleClickGenerateBoleto()}
            >
                {loading ? <Loading /> : (
                    <>
                        <PiPlusCircleBold size={20} />
                        Gerar novo boleto
                    </>
                )}
            </button>
        </div>
    )
}