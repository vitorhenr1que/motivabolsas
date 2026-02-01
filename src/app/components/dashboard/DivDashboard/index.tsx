'use client'
import { ReactNode } from "react";
import styles from './style.module.scss'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@/app/services/logout";
import { useUser } from "../../contexts/user-provider";
import { PiHouseBold, PiUserBold, PiCreditCardBold, PiSignOutBold, PiListBold } from "react-icons/pi";

interface UserProviderProps {
    children: ReactNode;
}

export const DivDashboard: React.FC<UserProviderProps> = ({ children }) => {
    const { setUser } = useUser()
    const pathname = usePathname();

    function handleLogOut() {
        setUser(undefined)
        SignOut()
    }

    const isActive = (path: string) => pathname === path;

    return (
        <div className={styles.layoutContainer}>
            <div className={styles.mainWrapper}>
                <aside className={styles.sidebar}>
                    <div className={styles.mobileHeader}>
                        <h2>Menu</h2>
                    </div>

                    <nav className={styles.navMenu}>
                        <div className={styles.navGroup}>
                            <label>Principal</label>
                            <Link
                                href="/dashboard"
                                className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
                            >
                                <PiHouseBold />
                                <span>Visão Geral</span>
                            </Link>
                        </div>

                        <div className={styles.navGroup}>
                            <label>Financeiro</label>
                            <Link
                                href="/pagamentos"
                                className={`${styles.navLink} ${isActive('/pagamentos') ? styles.active : ''}`}
                            >
                                <PiCreditCardBold />
                                <span>Pagamentos</span>
                            </Link>
                        </div>

                        <div className={styles.navGroup}>
                            <label>Minha Conta</label>
                            <Link
                                href="/perfil"
                                className={`${styles.navLink} ${isActive('/perfil') ? styles.active : ''}`}
                            >
                                <PiUserBold />
                                <span>Meus Dados</span>
                            </Link>
                        </div>
                    </nav>

                    <div className={styles.footerMenu}>
                        <button onClick={handleLogOut} className={styles.logoutBtn}>
                            <PiSignOutBold />
                            <span>Sair da conta</span>
                        </button>
                    </div>
                </aside>

                <main className={styles.contentArea}>
                    {children}
                </main>
            </div>
        </div>
    )
}