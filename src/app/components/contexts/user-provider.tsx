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

// Define o tipo para o contexto, incluindo a função `setUser`
interface UserContextType {
  user: User | undefined;
 setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

// Cria o contexto do usuário com um valor inicial
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define as propriedades do UserProvider para aceitar os filhos
interface UserProviderProps {
  children: ReactNode;
}

// Provider do usuário
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);



  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto do usuário, garantindo o tipo do retorno
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

