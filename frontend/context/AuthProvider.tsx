"use client"

import { useContext, useState, createContext } from "react";
import { UserProps } from "@/types/common.types";

interface ContextProps {
  user: UserProps | null,
  filter: string,
  changeFilter: (filter:string) => void,
  isLogged: boolean,
  login: (data:UserProps) => void
}

const AuthContext = createContext<ContextProps>({
  user: null,
  isLogged: false,
  filter: "",
  changeFilter: () => {},
  login: () => {}
});

const AuthProvider = ({ children }: {children: React.ReactNode}) =>  {
  const [user, setUser] = useState<UserProps | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [filter, setFilter]     =     useState("");


  const login = (data:UserProps) =>
  {
    setUser(data);
    setIsLogged(true);
  }

  const changeFilter = (filter:string) =>
  {
      setFilter(filter);
  }

  return (
    <AuthContext.Provider value={{user, filter, isLogged, changeFilter, login}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
}