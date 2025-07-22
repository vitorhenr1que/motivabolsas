'use client'

import { FormEvent, useEffect, useState } from "react"
import styles from './style.module.scss'
import { api } from "../services/api"
import { MdKeyboardArrowDown } from "react-icons/md";
import { LuCopy } from "react-icons/lu";
import { LuCopyCheck } from "react-icons/lu";
import { InfoCamp } from "../components/InfoCamp";
import { Loading } from "../components/Loading";
import { useUser } from "../components/contexts/user-provider";
import { getInterToken } from "../services/inter-token";
import { ModalBoleto } from "../components/ModalBoleto";
import { SearchUser } from "../components/SearchUser";

interface addressProps{
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

interface userDataProps{
    birthDate: Date | null,
    cpf: string,
    createdAt: Date,
    email: string,
    id: string,
    name: string,
    phone: string,
    currentPayment: boolean,
    customerId: string,
    renovacao: number,
    addresses: addressProps[]
}

export default function Usuarios(){
const [adminKey, setAdminKey] = useState("")
const [actualPage, setActualPage] = useState(0)
const [users, setUsers] = useState<userDataProps[]>()
const [totalPages, setTotalPages] = useState(0);
const [currentPage, setCurrentPage] = useState(0);
const [searchUsers, setSearchUsers] = useState<userDataProps[]>()
const [showInformation, setShowInformation] = useState<String>("")
const [toggle, setToggle] = useState(false)
const [loading, setLoading] = useState(false)
const [onlyPaid, setOnlyPaid] = useState(false)
const [searchTerm, setSearchTerm] = useState("")
const response = [1,2,3,4,5,6,7,8,9,10]
const {interToken, setInterToken} = useUser()

useEffect(() => {
    console.log(onlyPaid)
},[onlyPaid])



function handleClickShowInformation(id: string){ // Toggle para o Botão de "Mostrar Informações"
    setToggle(!toggle)
    setShowInformation(toggle ? id : "")
}

function humanizedDate(createdDate: string){
const date = new Date(createdDate);

const formatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const humanizedDate = formatter.format(date);

return humanizedDate
}

console.log(searchTerm)
    async function fetchUsers(page: number){
        try{
            setLoading(true)
            
            const response = await api.post('usuarios', {  
                secret_key: adminKey,
                page: page,
                onlyPaid: onlyPaid,
            })
            setUsers(response.data.users)
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
            setInterToken(await getInterToken())
            console.log(response)
            setLoading(false)
        } catch(e: any){
            console.log(e)
            setLoading(false)
            alert(e.response.data.error)
        } 
    }

    async function fetchPaginationUsers(page: number){
        try{
            
            
            const response = await api.post('usuarios', {  
                secret_key: adminKey,
                page: page,
                onlyPaid: onlyPaid,
            })
            setUsers(response.data.users)
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
            console.log(response)
            
        } catch(e: any){
            console.log(e)
            
            alert(e.response.data.error)
        } 
    }

    const paginationWindow = 10; // Define o tamanho fixo da janela (quantos botões serão mostrados)

    /**
     * Gera a janela fixa de 10 páginas, rolando como uma esteira.
     * Ao avançar uma página, uma página antiga desaparece e uma nova aparece.
     */
    const getVisiblePages = () => {
        // Define o início da janela com base direta na página atual.
        // Exemplo:
        // Página 0: start = 0
        // Página 4: start = 4 (página 1, 2 e 3 somem)
        const start = Math.max(currentPage - 3, 0);
    
        // Define o fim da janela, mantendo no máximo 10 páginas visíveis.
        let end = start + paginationWindow;
    
        // Ajuste para não ultrapassar o total de páginas.
        if (end > totalPages) {
            end = totalPages;
        }
    
        // Se chegou no fim e tem menos de 10 páginas, reposiciona o início:
        const adjustedStart = Math.max(end - paginationWindow, 0);
    
        // Gera o array de páginas que devem ser mostradas.
        return Array.from({ length: end - adjustedStart }, (_, index) => adjustedStart + index);
    };

        function Test(){
            console.log(interToken)
        }

        function FormatPhone(phone: any){
            return phone.match(/\((\d{2})\)\s(\d{5})-(\d{4})/)[1]
        }
        function FormatDdd(phone: any){
            return phone.match(/\((\d{2})\)\s(\d{5})-(\d{4})/)[2] + phone.match(/\((\d{2})\)\s(\d{5})-(\d{4})/)[3]
        }

    return (
        <div className={styles.container}>
            <button onClick={() => Test()}>Test</button>
            <h1>Lista de Usuários</h1>
            <div className={styles.inputContainer}>
                <input type="text" name="token" autoComplete="on" placeholder="Digite a chave de admnistrador" onChange={(e) => setAdminKey(e.target.value)} />
                <button onClick={() => fetchUsers(currentPage)}>
                    {loading ? <Loading/> : "Mostrar usuários"}
                </button>
                <div className={styles.isPaid}>
                    <label htmlFor="paid">Somente Pagos</label>
                    <input type="checkbox" id="paid" name="drone" value={""} onChange={() => setOnlyPaid(!onlyPaid)}/>
                </div>
            </div>
            <div className={styles.userList}>
              
                {users !== undefined && <div className={styles.userListContainer}>
                    <SearchUser searchUsers={searchUsers} setSearchUsers={setSearchUsers} onlyPaid={onlyPaid} adminKey={adminKey}/>
                    {!!searchUsers && searchUsers.map((index, position) => { // Quando existirem usuários buscados mostre isso:
                        return(
                            <div key={index.id} className={styles.userContainer}>
                            <div className={styles.userSimpleContainer}>
                                <div className={styles.spanContainer}>
                                    <span className={styles.name}>{index.name.toLocaleUpperCase()}</span>
                                    <span className={styles.cpf}>{index.cpf}</span>
                                </div>
                                <button className={styles.showButton} onClick={() => handleClickShowInformation(index.id)}><MdKeyboardArrowDown size={24}/><span>Mostrar Informações</span></button>
                            </div>
                            {showInformation === index.id && <div className={styles.showInformationContainer}>
                            
                            <InfoCamp campName={"Id: "} campValue={index.id} />
                            <InfoCamp campName={"Nome: "} campValue={index.name.toLocaleUpperCase()} />
                            <InfoCamp campName={"CPF: "} campValue={index.cpf} />
                            <InfoCamp campName={"E-mail: "} campValue={index.email} />
                            <InfoCamp campName={"Telefone: "} campValue={index.phone} />
                            <InfoCamp campName={"Rua: "} campValue={index.addresses[0].street} />
                            <InfoCamp campName={"Número: "} campValue={index.addresses[0].number} />
                            <InfoCamp campName={"Complemento: "} campValue={index.addresses[0].complement} />
                            <InfoCamp campName={"Bairro: "} campValue={index.addresses[0].neighborhood} />
                            <InfoCamp campName={"CEP: "} campValue={index.addresses[0].cep} />
                            <InfoCamp campName={"Cidade: "} campValue={index.addresses[0].city} />
                            <InfoCamp campName={"Identificação Stipe: "} campValue={index.customerId} />
                            <p><strong>Status da Bolsa: </strong><span className={index.currentPayment === true ? styles.statusActive : styles.statusInactive}>{index.currentPayment === true ? "Ativo" : "Inativo"}</span></p>
                            <div className={styles.lastDiv}>
                                <p><strong>Renovação: </strong>{index.renovacao >= 2 ? "Sim" : "Não"}</p>
                                <p><strong>Cadastro: </strong><span>{humanizedDate(`${index.createdAt}`).split(',')[0]}</span></p>
                                <ModalBoleto 
                                    cep={index.addresses[0].cep}
                                    city={index.addresses[0].city}
                                    complement={index.addresses[0].complement}
                                    cpf={index.cpf}
                                    email={index.email}
                                    houseNumber={index.addresses[0].number}
                                    neighborhood={index.addresses[0].neighborhood}
                                    name={index.name}
                                    person="FISICA"
                                    street={index.addresses[0].street}
                                    uf={index.addresses[0].uf}
                                    ddd={FormatPhone(index.phone)}
                                    tel={FormatDdd(index.phone)}
                                    key={index.id}
                                />
                            </div>
                            
                        </div>}
                        </div>
                        )
                    })}
                    {!searchUsers && users.map((index, position) => { // Caso não exista usuários buscado mostre isso
                    return (
                        <div key={index.id} className={styles.userContainer}> {/* Condicional para ocultar caso exista usuários buscados */}
                            <div className={styles.userSimpleContainer}>
                                <div className={styles.spanContainer}>
                                    <span className={styles.name}>{index.name.toLocaleUpperCase()}</span>
                                    <span className={styles.cpf}>{index.cpf}</span>
                                </div>
                                <button className={styles.showButton} onClick={() => handleClickShowInformation(index.id)}><MdKeyboardArrowDown size={24}/><span>Mostrar Informações</span></button>
                            </div>
                            {showInformation === index.id && <div className={styles.showInformationContainer}>
                            
                            <InfoCamp campName={"Id: "} campValue={index.id} />
                            <InfoCamp campName={"Nome: "} campValue={index.name.toLocaleUpperCase()} />
                            <InfoCamp campName={"CPF: "} campValue={index.cpf} />
                            <InfoCamp campName={"E-mail: "} campValue={index.email} />
                            <InfoCamp campName={"Telefone: "} campValue={index.phone} />
                            <InfoCamp campName={"Rua: "} campValue={index.addresses[0].street} />
                            <InfoCamp campName={"Número: "} campValue={index.addresses[0].number} />
                            <InfoCamp campName={"Complemento: "} campValue={index.addresses[0].complement} />
                            <InfoCamp campName={"Bairro: "} campValue={index.addresses[0].neighborhood} />
                            <InfoCamp campName={"CEP: "} campValue={index.addresses[0].cep} />
                            <InfoCamp campName={"Cidade: "} campValue={index.addresses[0].city} />
                            <InfoCamp campName={"Identificação Stipe: "} campValue={index.customerId} />
                            <p><strong>Status da Bolsa: </strong><span className={index.currentPayment === true ? styles.statusActive : styles.statusInactive}>{index.currentPayment === true ? "Ativo" : "Inativo"}</span></p>
                            <div className={styles.lastDiv}>
                                <p><strong>Renovação: </strong>{index.renovacao >= 2 ? "Sim" : "Não"}</p>
                                <p><strong>Cadastro: </strong><span>{humanizedDate(`${index.createdAt}`).split(',')[0]}</span></p>
                                <ModalBoleto 
                                    cep={index.addresses[0].cep}
                                    city={index.addresses[0].city}
                                    complement={index.addresses[0].complement}
                                    cpf={index.cpf}
                                    email={index.email}
                                    houseNumber={index.addresses[0].number}
                                    neighborhood={index.addresses[0].neighborhood}
                                    name={index.name}
                                    person="FISICA"
                                    street={index.addresses[0].street}
                                    uf={index.addresses[0].uf}
                                    ddd={FormatPhone(index.phone)}
                                    tel={FormatDdd(index.phone)}
                                    key={index.id}
                                />
                            </div>
                            
                        </div>}
                        </div>
                        
                    )
                })}</div>}
            </div>
            
                {users !== undefined && 
               <ul className={styles.paginationContainer}>
               <li className={styles.paginationItem}>
                   <button
                       className={styles.paginationButton}
                       onClick={() => fetchPaginationUsers(0)}
                       disabled={currentPage === 0}
                   >
                       {"<<"}
                   </button>
               </li>
           
               {getVisiblePages().map((page) => (
                   <li key={page} className={styles.paginationItem}>
                       <button
                           onClick={() => fetchPaginationUsers(page)}
                           className={currentPage === page
                               ? styles.paginationButtonActive
                               : styles.paginationButton
                           }
                       >
                           {page + 1}
                       </button>
                   </li>
               ))}
           
               <li className={styles.paginationItem}>
                   <button
                       className={styles.paginationButton}
                       onClick={() => fetchPaginationUsers(totalPages - 1)}
                       disabled={currentPage === totalPages - 1}
                   >
                       {">>"}
                   </button>
               </li>
           </ul>
                }
                
                    
           
        </div>
    )
}