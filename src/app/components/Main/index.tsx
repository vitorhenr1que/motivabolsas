'use client'
import Image from "next/image";
import styles from './style.module.scss'
import { GoMortarBoard } from "react-icons/go";
import { PiCertificateLight } from "react-icons/pi";
import { LiaPencilRulerSolid } from "react-icons/lia";
import Link from "next/link";
import { useState } from "react";
import { Graduacao } from "../Graduacao";
import { PosGraduacao } from "../PosGraduacao";
import { CursosTecnicos } from "../CursosTecnicos";
import Banner from '../../public/banner-bolsa.jpg'


export function Main(){
   const [toggleSelect, setToggleSelect] = useState(0)

    return (
        <div className={styles.container}>
            <section className={styles.sectionContainer}>
  
                <Image className={styles.banner} src={Banner} alt="" quality={100}/>

                <div className={styles.selectorContainer}>
                <ul className={styles.tabContainer}>
                  <li className={toggleSelect === 0 ? styles.tabItemActive : styles.tabItem}>
                    <Link href="#" className={styles.tabLink} onClick={() => setToggleSelect(0)} >
                    <GoMortarBoard size={32} className={styles.icon} color="white"/>
                    <span>Graduação</span>
                    </Link>
                  </li>

                  {/*<li className={toggleSelect === 1 ? styles.tabItemActive : styles.tabItem}>
                   <Link href="#" className={styles.tabLink} onClick={() => setToggleSelect(1)}>
                   <PiCertificateLight className={styles.icon} size={32} color="white"/>
                   <span>Pós-Graduação</span>
                   </Link>
                  </li>
                  <li className={toggleSelect === 2 ? styles.tabItemActive : styles.tabItem}>
                    <Link href="#" className={styles.tabLink} onClick={() => setToggleSelect(2)} >
                    <LiaPencilRulerSolid size={32} className={styles.icon} color="white"/>
                    <span>Cursos Técnicos</span>
                    </Link>
                  </li>*/}

                </ul>
                {toggleSelect === 0 && <Graduacao/>}
                {toggleSelect === 1 && <PosGraduacao/>}
                {toggleSelect === 2 && <CursosTecnicos/>}
                </div>
                
            </section>
            <section className={styles.cfContainer}>
              <div className={styles.textContainer}>
                <p className={styles.cfTitle}>Como Funciona</p>

                <p>O Motiva Bolsas é um programa de inclusão educacional que conecta jovens estudantes e adultos que não podem arcar com o valor integral de uma mensalidade em instituições de ensino particular de Graduação, Pós-Graduação e Cursos de Extensão. Através do nosso portal, você tem acesso a bolsas de estudo parciais ou integrais, além de créditos educativos.</p>

                <div className={styles.cfSpan}>
                  <span className={styles.cfSpanBold}>Este projeto é de iniciativa privada.</span>
                  <span>As bolsas de estudo oferecidas podem variar conforme as parcerias firmadas com as instituições de ensino participantes.</span>
                </div>

              </div>
            </section>
            <section className={styles.sectionWidthContainer}>
                <div className={styles.divWidthContainer}>
                  <h3>Cidades com bolsas de estudo</h3>
                  <table>
                   
                  </table>
                </div>
            </section>
                
        </div>
    )
}