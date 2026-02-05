'use client'

import { FormEvent, useEffect, useState } from "react"
import styles from './style.module.scss'
import { api } from "../services/api"
import { Loading } from "../components/Loading"
import { useUser } from "../components/contexts/user-provider"
import { getInterToken } from "../services/inter-token"
import { SearchUser } from "../components/SearchUser"
import { EditUserModal } from "../components/EditUserModal"
import { PiCheckCircleBold, PiXCircleBold, PiPencilSimpleBold } from "react-icons/pi";
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
}

export default function Usuarios() {
    const [adminKey, setAdminKey] = useState("1234") // Default or empty
    const [users, setUsers] = useState<UserDataProps[]>([])
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchUsers, setSearchUsers] = useState<UserDataProps[]>()
    const [loading, setLoading] = useState(false)
    const [onlyPaid, setOnlyPaid] = useState(false)

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDataProps | null>(null);

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

    const handleEdit = (user: UserDataProps) => {
        setEditingUser(user);
        setEditModalOpen(true);
    };

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
            </div>

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
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button className={styles.actionButton} onClick={() => handleEdit(user)}>
                                                <PiPencilSimpleBold size={16} /> Editar
                                            </button>
                                            <ModalBoleto
                                                cpf={user.cpf}
                                                name={user.name}
                                                email={user.email}
                                                ddd={user.phone.replace(/\D/g, '').substring(0, 2)}
                                                tel={user.phone.replace(/\D/g, '').substring(2)}
                                                houseNumber={user.addresses?.[0]?.number || ''}
                                                complement={user.addresses?.[0]?.complement || ''}
                                                person="Física"
                                                street={user.addresses?.[0]?.street || ''}
                                                neighborhood={user.addresses?.[0]?.neighborhood || ''}
                                                city={user.addresses?.[0]?.city || ''}
                                                uf={user.addresses?.[0]?.uf || ''}
                                                cep={user.addresses?.[0]?.cep || ''}
                                            />
                                        </div>
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
        </div>
    )
}