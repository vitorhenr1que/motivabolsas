import { ReactNode } from "react";
import styles from './style.module.scss'
import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { SignOut } from "@/app/services/logout";
import { useUser } from "../../contexts/user-provider";

interface UserProviderProps {
    children: ReactNode;
  }

export const DivDashboard: React.FC<UserProviderProps> = ({children}) => {
const {setUser} = useUser()
    
    function handleLogOut(){
        setUser(undefined)
        SignOut()
       }
    return (
        <div className={styles.container}>
         <div className={styles.dashboardContainer}>
            <div className={styles.aSide}>
                <h1>Dashboard</h1>
                <div className={styles.aSideLinks}>
                <Link href={"/dashboard"} className={styles.link}>
                        Painel
                    </Link>
                    <Link href={"#"} className={styles.link}>
                        Minha conta
                    </Link>
                    <Link href={"/pagamentos"}className={styles.link}>
                        Pagamentos
                    </Link>
                    <button onClick={() => {handleLogOut()}} className={styles.logOutButton}>
                    <MdOutlineLogout size={32}/>
                        <span>Sair da conta</span>
                    </button>
                </div>
                
            </div>
            <hr className={styles.hr}/>
            <div className={styles.mainDashboard}>
            {children}
            </div>
         </div>
       
        
        </div>
    )
}