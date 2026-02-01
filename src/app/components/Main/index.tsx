'use client'
import Image from "next/image";
import styles from './style.module.scss'
import { GoMortarBoard } from "react-icons/go";
import { PiCertificateLight, PiCheckCircleFill, PiLightningFill, PiMagnifyingGlassBold, PiShieldCheckFill, PiStudentBold, PiTicketBold } from "react-icons/pi";
import { LiaPencilRulerSolid } from "react-icons/lia";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Graduacao } from "../Graduacao";
import { PosGraduacao } from "../PosGraduacao";
import { CursosTecnicos } from "../CursosTecnicos";
import Banner from '../../public/banner-bolsa.jpg'

export function Main() {
  const [toggleSelect, setToggleSelect] = useState(0)

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}>
          <Image
            className={styles.banner}
            src={Banner}
            alt="Estudantes sorrindo com diploma"
            quality={100}
            priority
          />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.badge} id="status_inscricoes">
              <span className={styles.dot}></span>
              Inscrições Abertas • 1º Semestre 2026
            </div>
            <h1>Conquiste seu diploma com <span className="text-gradient">bolsas de até 70%</span></h1>
            <p>Garanta sua vaga nas melhores faculdades com descontos exclusivos que valem por todo o curso. Rápido, seguro e sem burocracia.</p>

            <div className={styles.heroButtons}>
              <Link href="#como-funciona" className={styles.secondaryCTA}>
                Entenda como funciona
              </Link>
            </div>
          </div>

          <div className={styles.selectorContainer} id="search_selector_home">
            <div className={styles.selectorTitle}>
              <h3>Escolha seu curso:</h3>
            </div>
            <ul className={styles.tabContainer}>
              <li
                className={toggleSelect === 0 ? styles.tabItemActive : styles.tabItem}
                onClick={() => setToggleSelect(0)}
              >
                <div className={styles.tabLink}>
                  <GoMortarBoard size={24} className={styles.icon} />
                  <span>Graduação</span>
                </div>
              </li>
            </ul>
            <div className={styles.tabContent}>
              {toggleSelect === 0 && <Graduacao />}
              {toggleSelect === 1 && <PosGraduacao />}
              {toggleSelect === 2 && <CursosTecnicos />}
            </div>
            <p className={styles.selectorFooter}>
              Mais de 5.000 alunos já garantiram sua bolsa.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Benefícios - Diferenciais Rápidos */}
      <section className={styles.benefitsSection}>
        <div className="container-full">
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}><PiLightningFill /></div>
              <h3>Rápido e Fácil</h3>
              <p>Escolha seu curso e garanta sua bolsa em poucos minutos, sem burocracia.</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}><PiShieldCheckFill /></div>
              <h3>Pague com Segurança</h3>
              <p>Ambiente seguro para você realizar sua inscrição com total tranquilidade.</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}><PiCheckCircleFill /></div>
              <h3>Bolsa Garantida</h3>
              <p>Uma vez solicitada, sua bolsa é válida durante todo o curso escolhido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - Reformulado para passos visuais */}
      <section className={styles.howItWorks} id="como-funciona">
        <div className="container-full">
          <div className={styles.howHeader}>
            <h2 className={styles.sectionTitle}>É fácil começar a estudar com desconto</h2>
            <p className={styles.sectionSubtitle}>Siga o passo a passo e garanta sua economia para todo o curso.</p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepIconContainer}>
                <div className={styles.stepBadge}>1</div>
                <PiMagnifyingGlassBold size={40} />
              </div>
              <h4>Encontre sua bolsa</h4>
              <p>Pesquise e escolha a faculdade e o curso que deseja estudar.</p>
            </div>

            <div className={styles.step}>
              <div className={styles.stepIconContainer}>
                <div className={styles.stepBadge}>2</div>
                <PiTicketBold size={40} />
              </div>
              <h4>Reserve seu desconto</h4>
              <p>Solicite sua bolsa online em poucos minutos. É seguro e sem burocracia.</p>
            </div>

            <div className={styles.step}>
              <div className={styles.stepIconContainer}>
                <div className={styles.stepBadge}>3</div>
                <PiStudentBold size={40} />
              </div>
              <h4>Faça sua matrícula</h4>
              <p>Apresente seu comprovante na faculdade e comece a estudar pagando menos.</p>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p><strong>Dica:</strong> Milhares de alunos já estão cursando a faculdade dos sonhos com o nosso portal. Comece a sua jornada agora!</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className={styles.mainFooter}>
        <div className="container-full">
          <div className={styles.footerContent}>
            <p>&copy; 2026 Motiva Bolsas. Todos os direitos reservados.</p>
            <div className={styles.footerLinks}>
              <Link href="/termos">Termos de Uso</Link>
              <Link href="/privacidade">Política de Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

