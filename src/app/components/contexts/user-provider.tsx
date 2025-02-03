'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from "@/app/services/api"

// Define os tipos das informações do usuário
interface User {
        birthDate: Date | null,
        cpf: string,
        createdAt: Date,
        email: string,
        id: string,
        name: string,
        currentPayment: boolean,
        customerId: string
}
export interface City {
  id: number,
  nome: string,
  microrregiao: any,
  "regiao-imediata": any,
}

interface InterTokenProps{
  interToken: string,
}

interface ModalUserProps{
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

// Define o tipo para o contexto, incluindo a função `setUser`
interface UserContextType {
 user: User | undefined;
 setUser: React.Dispatch<React.SetStateAction<User | undefined>> | any;
 city: City[] | null | undefined;
 setCity: React.Dispatch<React.SetStateAction<undefined>> | string | any;
 interToken: InterTokenProps | undefined;
 setInterToken: React.Dispatch<React.SetStateAction<undefined>> | string | any;
 modalUser: ModalUserProps | undefined;
 setModalUser: React.Dispatch<React.SetStateAction<ModalUserProps | undefined>> | any;
 codigoSolicitacao: string | undefined;
 setCodigoSolicitacao: React.Dispatch<React.SetStateAction<string | undefined>> | any;
}

// Cria o contexto do usuário com um valor inicial
const UserContext = createContext<UserContextType>({user: undefined, setUser: undefined, city: undefined, setCity: undefined, interToken: undefined, setInterToken: undefined, modalUser: undefined, setModalUser: undefined, codigoSolicitacao: undefined, setCodigoSolicitacao: undefined});

// Define as propriedades do UserProvider para aceitar os filhos
interface UserProviderProps {
  children: ReactNode;
}

// Provider do usuário
export const UserProvider = ({ children }: {children: ReactNode}) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [city, setCity] = useState<City[] | undefined>(undefined);
  const [interToken, setInterToken] = useState<InterTokenProps | undefined>(undefined);
  const [modalUser, setModalUser] = useState<ModalUserProps | undefined>(undefined)
  const [codigoSolicitacao, setCodigoSolicitacao] = useState<string | undefined>(undefined)

  return (
    <UserContext.Provider value={{ user, setUser, city,  setCity, interToken, setInterToken, modalUser, setModalUser, codigoSolicitacao, setCodigoSolicitacao}}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto do usuário, garantindo o tipo do retorno
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  return context;
};

