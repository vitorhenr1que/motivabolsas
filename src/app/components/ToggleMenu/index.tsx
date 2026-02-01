'use client'
import { IoMenu } from "react-icons/io5";
import styles from './style.module.scss'
import { useEffect, useState } from "react";
import Link from "next/link";
import { PiHouseBold, PiPhoneBold, PiLayoutBold, PiUserCircleBold, PiCurrencyDollarBold, PiXBold } from "react-icons/pi";

interface isLoggedProps {
    isLogged: boolean;
}

export function ToggleMenu({ isLogged }: isLoggedProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Prevenir scroll do body quando o menu estiver aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    // Fechar com ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleClose = () => setIsOpen(false);

    return (
        <>
            <button
                className={styles.toggleTrigger}
                onClick={() => setIsOpen(true)}
                aria-label="Abrir menu"
            >
                <IoMenu size={28} />
            </button>

            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                onClick={handleClose}
            />

            {/* Drawer Menu */}
            <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
                <div className={styles.drawerHeader}>
                    <div className={styles.logoPlaceholder}>Motiva Bolsas</div>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <PiXBold size={24} />
                    </button>
                </div>

                <nav className={styles.drawerBody}>
                    <div className={styles.menuSection}>
                        <span className={styles.sectionTitle}>Navegação</span>
                        <div className={styles.linkGroup}>
                            <Link href="/" className={styles.menuLink} onClick={handleClose}>
                                <PiHouseBold size={22} />
                                <span>Início</span>
                            </Link>
                            <Link href="/contato" className={styles.menuLink} onClick={handleClose}>
                                <PiPhoneBold size={22} />
                                <span>Contato</span>
                            </Link>
                        </div>
                    </div>

                    {isLogged && (
                        <div className={styles.menuSection}>
                            <span className={styles.sectionTitle}>Área do Aluno</span>
                            <div className={styles.linkGroup}>
                                <Link href="/dashboard" className={styles.menuLink} onClick={handleClose}>
                                    <PiLayoutBold size={22} />
                                    <span>Painel do Aluno</span>
                                </Link>
                                <Link href="/perfil" className={styles.menuLink} onClick={handleClose}>
                                    <PiUserCircleBold size={22} />
                                    <span>Minha Conta</span>
                                </Link>
                                <Link href="/pagamentos" className={styles.menuLink} onClick={handleClose}>
                                    <PiCurrencyDollarBold size={22} />
                                    <span>Pagamentos</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>

                <div className={styles.drawerFooter}>
                    <p>© 2026 Motiva Bolsas</p>
                    <span>v1.2.0</span>
                </div>
            </aside>
        </>
    )
}
