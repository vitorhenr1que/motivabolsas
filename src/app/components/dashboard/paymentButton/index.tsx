'use client'

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { api } from "@/app/services/api"
import styles from './style.module.scss'
import { PiCreditCardBold } from "react-icons/pi"
import { Loading } from "../../Loading"
import { getInterToken } from "@/app/services/inter-token"

interface PaymentButtonProps {
    user: any;
    disabled?: boolean;
    loading?: boolean;
}

export default function PaymentButton({ user, disabled, loading }: PaymentButtonProps) {
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)

    async function handleCreateBoleto() {
        if (!user || disabled || isCreatingCheckout) return;

        try {
            setIsCreatingCheckout(true);
            const { access_token } = await getInterToken();

            const address = user.addresses?.[0];
            if (!address) {
                alert("Endereço não encontrado em seu perfil.");
                return;
            }

            const cleanPhone = user.phone.replace(/\D/g, '');
            const ddd = cleanPhone.substring(0, 2);
            const phone = cleanPhone.substring(2);

            await api.post('/boletos/create', {
                interToken: access_token,
                email: user.email,
                ddd,
                phone,
                houseNumber: address.number,
                complement: address.complement || "",
                cpf: user.cpf,
                name: user.name,
                street: address.street,
                city: address.city,
                neighborhood: address.neighborhood,
                uf: address.uf,
                cep: address.cep.replace(/\D/g, '')
            });

            // Recarregar para que a verificação de boletos no Dashboard detecte o novo boleto
            window.location.reload();

        } catch (e) {
            console.error('Erro ao criar boleto:', e);
            alert("Falha ao gerar o boleto. Por favor, tente novamente.");
        } finally {
            setIsCreatingCheckout(false);
        }
    }

    return (
        <button
            className={styles.paymentButton}
            onClick={handleCreateBoleto}
            disabled={isCreatingCheckout || disabled || loading}
        >
            {isCreatingCheckout || loading ? (
                <Loading />
            ) : (
                <>
                    <PiCreditCardBold />
                    <span>Ativar minha Bolsa</span>
                </>
            )}
        </button>
    )
}
