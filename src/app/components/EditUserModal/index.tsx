import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState, FormEvent } from "react";
import styles from './style.module.scss';
import axios from "axios"; // Using direct axios or api service
import { api } from "../../services/api"; // Assuming this is set up correctly

interface AddressProps {
    id: string;
    cep: string;
    city: string;
    complement: string;
    neighborhood: string;
    number: string;
    street: string;
    uf: string;
}

interface UserProps {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    customerId: string; // Read-only
    createdAt: string | Date; // Read-only
    currentPayment: boolean; // Status da Bolsa
    firstPayment: boolean; // Contrato Assinado
    renovacao: number;
    addresses: AddressProps[];
}

interface EditUserModalProps {
    user: UserProps | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    adminKey: string;
}

export function EditUserModal({ user, open, onOpenChange, onSuccess, adminKey }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [renovacao, setRenovacao] = useState(0);
    const [currentPayment, setCurrentPayment] = useState(false);
    const [firstPayment, setFirstPayment] = useState(false);

    // Address State (assuming single address for editing)
    const [address, setAddress] = useState<AddressProps | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone);
            setRenovacao(user.renovacao);
            setCurrentPayment(user.currentPayment);
            setFirstPayment(user.firstPayment);

            if (user.addresses && user.addresses.length > 0) {
                setAddress({ ...user.addresses[0] });
            } else {
                // If no address, create empty structure (though id is missing)
                // In a real scenario we'd handle create vs update address
                setAddress({
                    id: "",
                    cep: "",
                    city: "",
                    complement: "",
                    neighborhood: "",
                    number: "",
                    street: "",
                    uf: ""
                });
            }
        }
    }, [user, open]);

    const handleAddressChange = (field: keyof AddressProps, value: string) => {
        if (address) {
            setAddress({ ...address, [field]: value });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        try {
            await api.put('usuarios', {
                secret_key: adminKey,
                id: user.id,
                name,
                email,
                phone,
                renovacao,
                currentPayment,
                firstPayment,
                address // This sends the updated address object
            });

            alert("Usuário atualizado com sucesso!");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || "Erro ao atualizar usuário.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.DialogOverlay} />
                <Dialog.Content className={styles.DialogContent}>
                    <Dialog.Title className={styles.DialogTitle}>Editar Usuário</Dialog.Title>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.grid}>
                            {/* Read Only Fields */}
                            <div className={styles.field}>
                                <label>ID</label>
                                <input type="text" value={user.id} disabled />
                            </div>
                            <div className={styles.field}>
                                <label>CPF</label>
                                <input type="text" value={user.cpf} disabled />
                            </div>
                            <div className={styles.field}>
                                <label>Stripe ID</label>
                                <input type="text" value={user.customerId} disabled />
                            </div>
                            <div className={styles.field}>
                                <label>Criado em</label>
                                <input type="text" value={new Date(user.createdAt).toLocaleDateString()} disabled />
                            </div>

                            {/* Editable Fields */}
                            <div className={`${styles.field} ${styles.full}`}>
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Telefone</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Renovação (Ciclo)</label>
                                <input
                                    type="number"
                                    value={renovacao}
                                    onChange={(e) => setRenovacao(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Address Fields */}
                        <h4 style={{ marginBottom: '10px', marginTop: '20px' }}>Endereço</h4>
                        {address && (
                            <div className={styles.grid}>
                                <div className={styles.field}>
                                    <label>CEP</label>
                                    <input type="text" value={address.cep} onChange={(e) => handleAddressChange('cep', e.target.value)} />
                                </div>
                                <div className={`${styles.field} ${styles.full}`}>
                                    <label>Rua</label>
                                    <input type="text" value={address.street} onChange={(e) => handleAddressChange('street', e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>Número</label>
                                    <input type="text" value={address.number} onChange={(e) => handleAddressChange('number', e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>Complemento</label>
                                    <input type="text" value={address.complement} onChange={(e) => handleAddressChange('complement', e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>Bairro</label>
                                    <input type="text" value={address.neighborhood} onChange={(e) => handleAddressChange('neighborhood', e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>Cidade</label>
                                    <input type="text" value={address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>UF</label>
                                    <input type="text" value={address.uf} onChange={(e) => handleAddressChange('uf', e.target.value)} maxLength={2} />
                                </div>
                            </div>
                        )}

                        <div className={styles.checkboxField}>
                            <input
                                type="checkbox"
                                id="active"
                                checked={currentPayment}
                                onChange={(e) => setCurrentPayment(e.target.checked)}
                            />
                            <label htmlFor="active">Ativo (Status da Bolsa)</label>
                        </div>

                        <div className={styles.checkboxField}>
                            <input
                                type="checkbox"
                                id="contract"
                                checked={firstPayment}
                                onChange={(e) => setFirstPayment(e.target.checked)}
                            />
                            <label htmlFor="contract">Contrato Assinado (Primeiro Pagamento)</label>
                        </div>

                        <div className={styles.actions}>
                            <button type="button" className={styles.cancelButton} onClick={() => onOpenChange(false)}>Cancelar</button>
                            <button type="submit" className={styles.saveButton} disabled={loading}>
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
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
