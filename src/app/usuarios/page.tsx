'use client'

import { FormEvent, useEffect, useState } from "react"
import styles from './style.module.scss'
import { api } from "../services/api"
import { Loading } from "../components/Loading"
import { useUser } from "../components/contexts/user-provider"
import { getInterToken } from "../services/inter-token"
import { SearchUser } from "../components/SearchUser"
import { EditUserModal } from "../components/EditUserModal"
import * as Dialog from "@radix-ui/react-dialog";
import { PiCheckCircleBold, PiXCircleBold, PiPencilSimpleBold, PiFileTextBold, PiEyeBold, PiDotsThreeBold, PiTrashBold, PiXBold, PiReceipt } from "react-icons/pi";
import { ModalBoleto } from "../components/ModalBoleto";

interface AddressProps {
    cep: string,
    city: string,
    complement: string,
    id: string,
    neighborhood: string,
    number: string,
    street: string,
    uf: string,
    userId: string
}

interface UserDataProps {
    birthDate: Date | null,
    cpf: string,
    createdAt: Date,
    email: string,
    id: string,
    name: string,
    phone: string,
    currentPayment: boolean,
    firstPayment: boolean,
    customerId: string,
    renovacao: number,
    course?: string,
    instituition?: string,
    discount?: string,
    addresses: AddressProps[]
    _count?: {
        contracts: number
    }
}

export default function Usuarios() {
    const [adminKey, setAdminKey] = useState("1234") // Default or empty
    const [users, setUsers] = useState<UserDataProps[]>([])
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchUsers, setSearchUsers] = useState<UserDataProps[]>()
    const [loading, setLoading] = useState(false)
    const [onlyPaid, setOnlyPaid] = useState(false)
    const [periodModalOpen, setPeriodModalOpen] = useState(false)
    const [capturePeriod, setCapturePeriod] = useState("")
    const [periodBusy, setPeriodBusy] = useState(false)
    const [periodError, setPeriodError] = useState("")
    const [periodMessage, setPeriodMessage] = useState("")

    async function openCapturePeriod() {
        setPeriodBusy(true)
        setPeriodMessage("")
        setPeriodError("")
        try {
            const response = await api.post('admin/capture-period', { secret_key: adminKey })
            setCapturePeriod(response.data.period ?? "")
            setPeriodModalOpen(true)
        } catch (e: any) {
            setPeriodMessage(e.response?.data?.error || "Erro ao carregar o período de captação.")
        } finally {
            setPeriodBusy(false)
        }
    }

    async function saveCapturePeriod(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPeriodBusy(true)
        setPeriodError("")
        try {
            const response = await api.put('admin/capture-period', {
                secret_key: adminKey,
                period: capturePeriod,
            })
            setCapturePeriod(response.data.period)
            setPeriodModalOpen(false)
            setPeriodMessage(`Período de captação ${response.data.period} salvo. Será usado nos novos contratos.`)
        } catch (e: any) {
            setPeriodError(e.response?.data?.error || "Erro ao salvar o período de captação.")
        } finally {
            setPeriodBusy(false)
        }
    }

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDataProps | null>(null);
    const [actionsUser, setActionsUser] = useState<UserDataProps | null>(null);
    const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
    const [boletoUser, setBoletoUser] = useState<UserDataProps | null>(null);
    const [boletoModalOpen, setBoletoModalOpen] = useState(false);
    const [actionsPosition, setActionsPosition] = useState({ top: 0, left: 0 });
    const [deletingContract, setDeletingContract] = useState(false);

    const { interToken, setInterToken } = useUser()

    async function fetchUsers(page: number) {
        try {
            setLoading(true)
            // Optionally handle Inter Token if needed for something else, keeping it for compatibility
            // const { access_token } = await getInterToken()
            // setInterToken(access_token)
            const { access_token } = await getInterToken()
            setInterToken(access_token)
            const response = await api.post('usuarios', {
                secret_key: adminKey,
                page: page,
                onlyPaid: onlyPaid,
            })
            setUsers(response.data.users)
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
            setLoading(false)
        } catch (e: any) {
            console.log(e)
            setLoading(false)
            alert(e.response?.data?.error || "Erro ao buscar usuários. Verifique a chave.")
        }
    }

    const handleEdit = async (user: UserDataProps) => {
        try {
            setLoading(true);
            const response = await api.get(`usuarios/${user.id}?secret_key=${adminKey}`);
            setEditingUser(response.data);
            setEditModalOpen(true);
            setLoading(false);
        } catch (e: any) {
            console.error(e);
            setLoading(false);
            alert("Erro ao carregar detalhes do usuário.");
        }
    };

    const handleViewDashboard = async (user: UserDataProps) => {
        try {
            setLoading(true);
            await api.post('/admin/preview', { userId: user.id, secret_key: adminKey });
            window.open('/dashboard', '_blank', 'noopener,noreferrer');
        } catch (e: any) {
            alert(e.response?.data?.error || "Não foi possível abrir o dashboard.");
        } finally {
            setLoading(false);
        }
    };

    async function handleDownloadComprovante(user: UserDataProps) {
        try {
            setLoading(true)
            const response = await api.post('download-comprovante', {
                name: user?.name,
                course: user?.course,
                instituition: user?.instituition,
                cpf: user?.cpf,
                discount: user?.discount,
                createdAt: user?.createdAt,
                id: user?.id
            }, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `comprovante_${user.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setLoading(false)
        } catch (e: any) {
            console.error(e)
            setLoading(false)
            alert("Erro ao gerar comprovante. Verifique as informações do usuário.")
        }
    }

    async function handleDeleteContract(user: UserDataProps) {
        const hasContract = (user._count?.contracts ?? 0) > 0;
        if (!hasContract || deletingContract) return;

        const confirmed = window.confirm(
            `Excluir ${user._count?.contracts} contrato(s) de ${user.name}? Esta ação remove o contrato e suas assinaturas para que um novo possa ser gerado.`
        );
        if (!confirmed) return;

        try {
            setDeletingContract(true);
            await api.delete(`usuarios/${user.id}/contrato?secret_key=${encodeURIComponent(adminKey)}`);
            setActionsSheetOpen(false);
            setActionsUser(null);
            handleSuccess();
        } catch (e: any) {
            alert(e.response?.data?.error || "Não foi possível excluir o contrato.");
        } finally {
            setDeletingContract(false);
        }
    }

    const handleSuccess = () => {
        // Refresh list
        if (searchUsers) {
            // If we are searching, we might technically need to re-search or just update the item in the list.
            // For simplicity, we just trigger a refresh of the main list. 
            // To properly update search results, we'd need to re-trigger the search or update state locally.
            // We'll update the local state for searchUsers if generic update
            fetchUsers(currentPage);
            // Ideally we should re-fetch search, but we don't have the search term here easily unless we lift state from SearchUser.
            // We'll clear search or let user search again for fresh data if they want perfectly synced data.
            setSearchUsers(undefined); // Clear search to show updated main list
        } else {
            fetchUsers(currentPage);
        }
    }

    const paginationWindow = 5;
    const getVisiblePages = () => {
        const start = Math.max(currentPage - 2, 0);
        let end = start + paginationWindow;
        if (end > totalPages) end = totalPages;
        const adjustedStart = Math.max(end - paginationWindow, 0);
        return Array.from({ length: end - adjustedStart }, (_, index) => adjustedStart + index);
    };

    const displayUsers = searchUsers || users;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Painel Administrativo de Usuários</h1>
            </header>

            <div className={styles.controls}>
                <input
                    type="text"
                    name="token"
                    placeholder="Chave de Administrador"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                />

                <div className={styles.filters}>
                    <input
                        type="checkbox"
                        id="paid"
                        checked={onlyPaid}
                        onChange={() => setOnlyPaid(!onlyPaid)}
                    />
                    <label htmlFor="paid">Somente Ativos (Pagos)</label>
                </div>

                <button onClick={() => fetchUsers(0)}>
                    {loading ? <Loading /> : "Carregar Usuários"}
                </button>
                <button type="button" onClick={openCapturePeriod} disabled={!adminKey.trim() || periodBusy}>
                    {periodBusy ? "Aguarde..." : "Período de captação"}
                </button>
            </div>
            {periodMessage && <p className={styles.periodMessage} role="status">{periodMessage}</p>}

            <Dialog.Root open={periodModalOpen} onOpenChange={(open) => { if (!periodBusy) setPeriodModalOpen(open) }}>
                <Dialog.Portal>
                    <Dialog.Overlay className={styles.periodOverlay} />
                    <Dialog.Content className={styles.periodModal}>
                        <Dialog.Title>Período de captação</Dialog.Title>
                        <Dialog.Description>
                            Defina o período que preencherá {'{{PERIODO}}'} nos novos contratos.
                            Contratos já gerados mantêm o período original.
                        </Dialog.Description>
                        <form onSubmit={saveCapturePeriod}>
                            <label htmlFor="capture-period">Ano e semestre</label>
                            <input
                                id="capture-period"
                                type="text"
                                placeholder="2027.1"
                                value={capturePeriod}
                                onChange={(event) => setCapturePeriod(event.target.value)}
                                pattern={'[0-9]{4}\\.[12]'}
                                maxLength={6}
                                title="Use o formato 2027.1 ou 2027.2"
                                required
                                disabled={periodBusy}
                                aria-describedby={periodError ? "capture-period-error" : undefined}
                            />
                            {periodError && <p id="capture-period-error" role="alert">{periodError}</p>}
                            <div className={styles.periodButtons}>
                                <Dialog.Close type="button" disabled={periodBusy}>Cancelar</Dialog.Close>
                                <button type="submit" disabled={periodBusy}>
                                    {periodBusy ? "Salvando..." : "Salvar período"}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Search Component Reuse */}
            {/* Note: We pass adminKey and onlyPaid. SearchUser component handles its own search API call and sets searchUsers parent state */}
            <div style={{ marginBottom: '20px' }}>
                <SearchUser
                    searchUsers={searchUsers}
                    setSearchUsers={setSearchUsers}
                    onlyPaid={onlyPaid}
                    adminKey={adminKey}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Status Bolsa</th>
                            <th>Contrato</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayUsers && displayUsers.length > 0 ? (
                            displayUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.cpf}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${user.currentPayment ? styles.active : styles.inactive}`}>
                                            {user.currentPayment ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.contractBadge} ${user.firstPayment ? styles.signed : ''}`}>
                                            {user.firstPayment ? (
                                                <><PiCheckCircleBold /> Assinado</>
                                            ) : (
                                                <><PiXCircleBold /> Pendente</>
                                            )}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className={styles.actionsTrigger}
                                            onClick={(event) => {
                                                const trigger = event.currentTarget.getBoundingClientRect();
                                                const menuWidth = Math.min(272, window.innerWidth - 16);
                                                const menuHeight = 330;
                                                const fitsOnLeft = trigger.left >= menuWidth + 16;
                                                const left = fitsOnLeft
                                                    ? trigger.left - menuWidth - 8
                                                    : Math.min(trigger.right + 8, window.innerWidth - menuWidth - 8);

                                                setActionsPosition({
                                                    left: Math.max(8, left),
                                                    top: Math.max(8, Math.min(trigger.top, window.innerHeight - menuHeight - 8)),
                                                });
                                                setActionsUser(user);
                                                setActionsSheetOpen(true);
                                            }}
                                            aria-label={`Abrir ações de ${user.name}`}
                                            aria-haspopup="dialog"
                                            aria-expanded={actionsSheetOpen && actionsUser?.id === user.id}
                                        >
                                            <PiDotsThreeBold size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                    {loading ? "Carregando..." : "Nenhum usuário encontrado."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Only show if not searching) */}
            {!searchUsers && totalPages > 1 && (
                <ul className={styles.pagination}>
                    <li>
                        <button
                            onClick={() => fetchUsers(0)}
                            disabled={currentPage === 0}
                        >
                            {"<<"}
                        </button>
                    </li>
                    {getVisiblePages().map((page) => (
                        <li key={page}>
                            <button
                                onClick={() => fetchUsers(page)}
                                className={currentPage === page ? styles.active : ''}
                            >
                                {page + 1}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => fetchUsers(totalPages - 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            {">>"}
                        </button>
                    </li>
                </ul>
            )}

            <EditUserModal
                user={editingUser}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                onSuccess={handleSuccess}
                adminKey={adminKey}
            />

            <Dialog.Root open={actionsSheetOpen} onOpenChange={setActionsSheetOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className={styles.actionsOverlay} />
                    <Dialog.Content
                        className={styles.actionsSheet}
                        style={{ top: actionsPosition.top, left: actionsPosition.left }}
                    >
                        <div className={styles.sheetHeader}>
                            <div>
                                <Dialog.Title>Ações do usuário</Dialog.Title>
                                <Dialog.Description>{actionsUser?.name}</Dialog.Description>
                            </div>
                            <Dialog.Close className={styles.sheetClose} aria-label="Fechar ações">
                                <PiXBold size={18} />
                            </Dialog.Close>
                        </div>

                        {actionsUser && (
                            <div className={styles.sheetActions}>
                                <button className={styles.sheetAction} onClick={() => {
                                    setActionsSheetOpen(false);
                                    handleViewDashboard(actionsUser);
                                }}>
                                    <PiEyeBold size={19} /> Ver dashboard
                                </button>
                                <button className={styles.sheetAction} onClick={() => {
                                    setActionsSheetOpen(false);
                                    handleEdit(actionsUser);
                                }}>
                                    <PiPencilSimpleBold size={19} /> Editar usuário
                                </button>
                                {actionsUser.currentPayment && (
                                    <button className={styles.sheetAction} onClick={() => {
                                        setActionsSheetOpen(false);
                                        handleDownloadComprovante(actionsUser);
                                    }} disabled={loading}>
                                        <PiFileTextBold size={19} /> Comprovante
                                    </button>
                                )}
                                <button className={styles.sheetAction} onClick={() => {
                                    setBoletoUser(actionsUser);
                                    setBoletoModalOpen(true);
                                    setActionsSheetOpen(false);
                                }}>
                                    <PiReceipt size={20} /> Boleto
                                </button>
                                {(actionsUser._count?.contracts ?? 0) > 0 && (
                                    <button className={`${styles.sheetAction} ${styles.deleteContractAction}`} onClick={() => handleDeleteContract(actionsUser)} disabled={deletingContract}>
                                        <PiTrashBold size={19} /> {deletingContract ? "Excluindo contrato..." : "Excluir contrato"}
                                    </button>
                                )}
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {boletoUser && (
                <ModalBoleto
                    userId={boletoUser.id}
                    adminKey={adminKey}
                    cpf={boletoUser.cpf}
                    name={boletoUser.name}
                    email={boletoUser.email}
                    phone={boletoUser.phone}
                    open={boletoModalOpen}
                    hideTrigger
                    onOpenChange={(open) => {
                        setBoletoModalOpen(open);
                        if (!open) setBoletoUser(null);
                    }}
                />
            )}
        </div>
    )
}
