'use client'
import { useEffect, useState } from "react"
import { useUser } from "../components/contexts/user-provider"
import { api } from "../services/api"
import { DivDashboard } from "../components/dashboard/DivDashboard"
import { Loading } from "../components/Loading"
import styles from './style.module.scss'
import {
    PiUserBold,
    PiEnvelopeSimpleBold,
    PiIdentificationCardBold,
    PiPhoneBold,
    PiMapPinBold,
    PiGraduationCapBold,
    PiBuildingsBold,
    PiShieldCheckBold,
    PiCalendarBlankBold,
    PiLockBold,
    PiCheckCircleFill,
    PiWarningCircleFill,
    PiCloudArrowUpBold,
    PiXCircleBold,
    PiCheckBold,
    PiLockKeyBold
} from "react-icons/pi"

interface Address {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    uf: string;
    city: string;
    cep: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
    birthDate: string | null;
    course: string;
    instituition: string;
    discount: string | null;
    currentPayment: boolean;
    createdAt: string;
    addresses: Address[];
}

export default function Profile() {
    const { user: contextUser } = useUser()
    const [userData, setUserData] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    // Edit States
    const [isEditingContact, setIsEditingContact] = useState(false)
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Password States
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        async function fetchUserData() {
            try {
                setLoading(true)
                const response = await api.post('/userinfo')
                setUserData(response.data)
                setEditForm(response.data)
            } catch (error) {
                console.error("Erro ao carregar dados do perfil:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    const applyPhoneMask = (value: string) => {
        const numbers = value.replace(/\D/g, "")
        const charCount = numbers.length

        if (charCount <= 2) {
            return `(${numbers}`
        } else if (charCount <= 7) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
        } else {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
        }
    }

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        let finalValue = value
        if (field === 'phone') {
            // Limpa tudo que não for número antes de aplicar a máscara
            const rawValue = value.replace(/\D/g, "")
            finalValue = applyPhoneMask(rawValue)
        }
        setEditForm(prev => ({ ...prev, [field]: finalValue }))
    }

    const applyCepMask = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 5) return numbers;
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }

    const handleAddressChange = async (field: keyof Address, value: string) => {
        let finalValue = value;

        if (field === 'cep') {
            finalValue = applyCepMask(value);
            const rawCep = value.replace(/\D/g, "");

            // Busca CEP automática
            if (rawCep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        setEditForm(prev => {
                            const currentAddresses = [...(prev.addresses || [])];
                            currentAddresses[0] = {
                                ...currentAddresses[0],
                                city: data.localidade,
                                uf: data.uf,
                                street: data.logradouro,
                                neighborhood: data.bairro,
                                cep: finalValue
                            };
                            return { ...prev, addresses: currentAddresses };
                        });
                        return; // Evita a atualização dupla abaixo
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            }
        }

        setEditForm(prev => {
            const currentAddresses = [...(prev.addresses || [])];
            if (currentAddresses.length === 0) {
                currentAddresses.push({
                    street: '',
                    number: '',
                    complement: '',
                    neighborhood: '',
                    city: '',
                    uf: '',
                    cep: ''
                });
            }
            currentAddresses[0] = { ...currentAddresses[0], [field]: finalValue };
            return { ...prev, addresses: currentAddresses };
        })
    }

    const handleSave = async (section: 'contact' | 'address') => {
        try {
            setSaving(true)

            const rawForm = { ...editForm };

            if (section === 'contact') {
                const phoneNumbers = editForm.phone?.replace(/\D/g, "") || ""
                if (phoneNumbers.length !== 11) {
                    setFeedback({ type: 'error', message: 'Telefone inválido. Digite o DDD + 9 números.' })
                    setSaving(false)
                    setTimeout(() => setFeedback(null), 3000)
                    return
                }
            }

            if (section === 'address' && editForm.addresses?.[0]) {
                const rawCep = editForm.addresses[0].cep.replace(/\D/g, "");
                if (rawCep.length !== 8) {
                    setFeedback({ type: 'error', message: 'CEP incompleto ou inválido.' })
                    setSaving(false)
                    setTimeout(() => setFeedback(null), 3000)
                    return
                }
                // Limpa o CEP para salvar apenas números conforme pedido
                rawForm.addresses = [{
                    ...editForm.addresses[0],
                    cep: rawCep
                }];
            }

            // Real API call to update user data
            await api.patch('/user/update', rawForm);

            // Update local state to reflect changes immediately
            if (userData && editForm) {
                setUserData({ ...userData, ...editForm } as UserProfile);
            }

            setFeedback({ type: 'success', message: 'Informações atualizadas com sucesso!' })
            setIsEditingContact(false)
            setIsEditingAddress(false)
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            setFeedback({ type: 'error', message: 'Erro ao salvar informações. Verifique sua conexão.' })
        } finally {
            setSaving(false)
            setTimeout(() => setFeedback(null), 4000)
        }
    }

    const handleCancel = (section: 'contact' | 'address' | 'password') => {
        if (section === 'password') {
            setIsChangingPassword(false)
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
            return
        }
        setEditForm(userData || {})
        if (section === 'contact') setIsEditingContact(false)
        if (section === 'address') setIsEditingAddress(false)
    }

    const handlePasswordUpdate = async () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setFeedback({ type: 'error', message: 'Preencha todos os campos de senha.' })
            setTimeout(() => setFeedback(null), 3000)
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setFeedback({ type: 'error', message: 'As novas senhas não coincidem.' })
            setTimeout(() => setFeedback(null), 3000)
            return
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(passwordForm.newPassword)) {
            setFeedback({
                type: 'error',
                message: 'A nova senha deve ter 8+ caracteres, uma letra maiúscula e um caractere especial.'
            })
            setTimeout(() => setFeedback(null), 5000)
            return
        }

        try {
            setSaving(true)
            await api.patch('/user/update-password', {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            })

            setFeedback({ type: 'success', message: 'Senha atualizada com sucesso!' })
            setIsChangingPassword(false)
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Erro ao atualizar senha.'
            setFeedback({ type: 'error', message: msg })
        } finally {
            setSaving(false)
            setTimeout(() => setFeedback(null), 4000)
        }
    }

    if (loading) {
        return (
            <DivDashboard>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Loading />
                </div>
            </DivDashboard>
        )
    }

    if (!userData) {
        return (
            <DivDashboard>
                <div className={styles.profileWrapper}>
                    <p>Não foi possível carregar as informações do perfil.</p>
                </div>
            </DivDashboard>
        )
    }

    const maskCpf = (cpf: string) => {
        if (!cpf) return ""
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4")
    }

    const maskEmail = (email: string) => {
        if (!email) return ""
        const [user, domain] = email.split('@')
        if (!domain) return email
        const maskedUser = user.charAt(0) + "****" + user.charAt(user.length - 1)
        return `${maskedUser}@${domain}`
    }

    const firstLetter = userData.name.charAt(0).toUpperCase()
    const address = editForm.addresses?.[0] || userData.addresses?.[0]
    const isPaid = userData.currentPayment

    return (
        <DivDashboard>
            <div className={styles.profileWrapper}>
                {feedback && (
                    <div className={`${styles.feedback} ${styles[feedback.type]}`}>
                        {feedback.type === 'success' ? <PiCheckBold /> : <PiXCircleBold />}
                        <span>{feedback.message}</span>
                    </div>
                )}

                <header className={styles.header}>
                    <h1>Meu Perfil</h1>
                    <p>Gerencie suas informações pessoais e dados da sua bolsa.</p>
                </header>

                <div className={styles.profileGrid}>
                    <aside className={styles.sidebar}>
                        <div className={styles.avatarCard}>
                            <div className={styles.avatarCircle}>{firstLetter}</div>
                            <h2>{userData.name.split(' ')[0]}</h2>
                            <div className={`${styles.statusBadge} ${isPaid ? styles.active : styles.pending}`} style={{ margin: '0.5rem 0' }}>
                                {isPaid ? <PiCheckCircleFill /> : <PiWarningCircleFill />}
                                <span>{isPaid ? "Bolsa Ativada" : "Aguardando Ativação"}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Membro desde {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                        </div>

                        <div className={styles.securityNote}>
                            <PiShieldCheckBold />
                            <div>
                                <h4>Privacidade e LGPD</h4>
                                <p>Seus dados são processados em conformidade com a Lei Geral de Proteção de Dados, garantindo total sigilo e segurança em nossa plataforma.</p>
                            </div>
                        </div>
                    </aside>

                    <main className={styles.mainContent}>
                        {/* Dados Pessoais - SOMENTE LEITURA */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.headerTitle}>
                                    <PiLockBold />
                                    <h3>Dados de Identificação</h3>
                                </div>
                                <span className={styles.readOnlyBadge}>Protegido</span>
                            </div>
                            <div className={styles.sectionBody}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Nome Completo</label>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {userData.name} <PiLockBold style={{ color: '#cbd5e1', fontSize: '0.875rem' }} />
                                        </p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Email de Acesso</label>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {maskEmail(userData.email)} <PiLockBold style={{ color: '#cbd5e1', fontSize: '0.875rem' }} />
                                        </p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>CPF</label>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {maskCpf(userData.cpf)} <PiLockBold style={{ color: '#cbd5e1', fontSize: '0.875rem' }} />
                                        </p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Status Financeiro</label>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: isPaid ? '#059669' : '#d97706' }}>
                                            {isPaid ? <PiCheckCircleFill /> : <PiWarningCircleFill />}
                                            {isPaid ? "Regularizado" : "Pendente"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Informações de Contato - EDITÁVEL */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.headerTitle}>
                                    <PiPhoneBold />
                                    <h3>Contato</h3>
                                </div>
                                {!isEditingContact && (
                                    <button className={styles.editBtn} onClick={() => setIsEditingContact(true)}>Editar</button>
                                )}
                            </div>
                            <div className={styles.sectionBody}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Telefone (WhatsApp)</label>
                                        {isEditingContact ? (
                                            <input
                                                type="text"
                                                className={styles.editInput}
                                                value={editForm.phone || ''}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                placeholder="(00) 00000-0000"
                                            />
                                        ) : (
                                            <p>{userData.phone || "Não informado"}</p>
                                        )}
                                    </div>
                                </div>

                                {isEditingContact && (
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.btnSave}
                                            onClick={() => handleSave('contact')}
                                            disabled={saving}
                                        >
                                            {saving ? <Loading /> : <><PiCloudArrowUpBold /> Salvar Alterações</>}
                                        </button>
                                        <button
                                            className={styles.btnCancel}
                                            onClick={() => handleCancel('contact')}
                                            disabled={saving}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Endereço - EDITÁVEL */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.headerTitle}>
                                    <PiMapPinBold />
                                    <h3>Endereço de Correspondência</h3>
                                </div>
                                {!isEditingAddress && (
                                    <button className={styles.editBtn} onClick={() => setIsEditingAddress(true)}>Editar</button>
                                )}
                            </div>
                            <div className={styles.sectionBody}>
                                {address || isEditingAddress ? (
                                    <>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                                                <label>Rua / Logradouro</label>
                                                {isEditingAddress ? (
                                                    <input
                                                        type="text"
                                                        className={styles.editInput}
                                                        value={address?.street || ''}
                                                        onChange={(e) => handleAddressChange('street', e.target.value)}
                                                    />
                                                ) : (
                                                    <p>{address?.street}, {address?.number}</p>
                                                )}
                                            </div>
                                            {isEditingAddress && (
                                                <div className={styles.infoItem}>
                                                    <label>Número</label>
                                                    <input
                                                        type="text"
                                                        className={styles.editInput}
                                                        value={address?.number || ''}
                                                        onChange={(e) => handleAddressChange('number', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                            <div className={styles.infoItem}>
                                                <label>Bairro</label>
                                                {isEditingAddress ? (
                                                    <input
                                                        type="text"
                                                        className={styles.editInput}
                                                        value={address?.neighborhood || ''}
                                                        onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                                                    />
                                                ) : (
                                                    <p>{address?.neighborhood}</p>
                                                )}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>Complemento</label>
                                                {isEditingAddress ? (
                                                    <input
                                                        type="text"
                                                        className={styles.editInput}
                                                        value={address?.complement || ''}
                                                        onChange={(e) => handleAddressChange('complement', e.target.value)}
                                                    />
                                                ) : (
                                                    <p>{address?.complement || "Nenhum"}</p>
                                                )}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>CEP</label>
                                                {isEditingAddress ? (
                                                    <input
                                                        type="text"
                                                        className={styles.editInput}
                                                        value={address?.cep || ''}
                                                        onChange={(e) => handleAddressChange('cep', e.target.value)}
                                                        placeholder="00000-000"
                                                        maxLength={9}
                                                    />
                                                ) : (
                                                    <p>{address?.cep}</p>
                                                )}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>Cidade</label>
                                                {isEditingAddress ? (
                                                    <input
                                                        type="text"
                                                        className={`${styles.editInput} ${styles.readOnlyInput}`}
                                                        value={address?.city || ''}
                                                        readOnly
                                                        placeholder="Preenchido via CEP"
                                                    />
                                                ) : (
                                                    <p>{address?.city}</p>
                                                )}
                                            </div>
                                            <div className={styles.infoItem}>
                                                <label>UF</label>
                                                {isEditingAddress ? (
                                                    <input
                                                        type="text"
                                                        className={`${styles.editInput} ${styles.readOnlyInput}`}
                                                        value={address?.uf || ''}
                                                        readOnly
                                                        placeholder="UF"
                                                    />
                                                ) : (
                                                    <p>{address?.uf}</p>
                                                )}
                                            </div>
                                        </div>

                                        {isEditingAddress && (
                                            <div className={styles.actionButtons}>
                                                <button
                                                    className={styles.btnSave}
                                                    onClick={() => handleSave('address')}
                                                    disabled={saving}
                                                >
                                                    {saving ? <Loading /> : <><PiCloudArrowUpBold /> Salvar Alterações</>}
                                                </button>
                                                <button
                                                    className={styles.btnCancel}
                                                    onClick={() => handleCancel('address')}
                                                    disabled={saving}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Nenhum endereço cadastrado.</p>
                                )}
                            </div>
                        </section>

                        {/* Segurança e Senha */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.headerTitle}>
                                    <PiLockKeyBold />
                                    <h3>Segurança da Conta</h3>
                                </div>
                                {!isChangingPassword && (
                                    <button className={styles.editBtn} onClick={() => setIsChangingPassword(true)}>Alterar Senha</button>
                                )}
                            </div>
                            <div className={styles.sectionBody}>
                                {isChangingPassword ? (
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <label>Senha Atual</label>
                                            <input
                                                type="password"
                                                className={styles.editInput}
                                                value={passwordForm.oldPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                                placeholder="Digite sua senha atual"
                                            />
                                        </div>
                                        <div />
                                        <div className={styles.infoItem}>
                                            <label>Nova Senha</label>
                                            <input
                                                type="password"
                                                className={styles.editInput}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="8+ caracteres, maiúscula e símbolo"
                                            />
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>Confirmar Nova Senha</label>
                                            <input
                                                type="password"
                                                className={styles.editInput}
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="Repita a nova senha"
                                            />
                                        </div>

                                        <div className={styles.actionButtons} style={{ gridColumn: 'span 2' }}>
                                            <button
                                                className={styles.btnSave}
                                                onClick={handlePasswordUpdate}
                                                disabled={saving}
                                            >
                                                {saving ? <Loading /> : <><PiShieldCheckBold /> Confirmar Alteração</>}
                                            </button>
                                            <button
                                                className={styles.btnCancel}
                                                onClick={() => handleCancel('password')}
                                                disabled={saving}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.infoItem}>
                                        <p style={{ color: '#64748b', fontSize: '0.9375rem', fontWeight: 500 }}>
                                            Sua senha é protegida por criptografia de ponta a ponta.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </DivDashboard>
    )
}
