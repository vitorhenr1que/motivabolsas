'use client'

import { useEffect, useState } from "react"
import styles from './style.module.scss'
import { PrismicRichText } from "@prismicio/react"
import { PrismicNextLink } from "@prismicio/next"
import { FazagDocumentData } from "../../../../prismicio-types"
import { FieldState } from "@prismicio/client"
import type * as prismic from "@prismicio/client"

type RichTextField<State extends FieldState = FieldState> = State extends "empty" ? [] : [prismic.RTNode, ...prismic.RTNode[]]

interface CourseInformation{
        type: string,
        text: string,
        spans: any[],
        direction: string
}
interface course_information{
    course_information: CourseInformation[]
}

export function InfoCourse({course_information, params}: any){
    const [toggle, setToggle] = useState<number>(0)
    const [urlMaps, setUrlMaps] = useState("")

    useEffect(() => {
        if(params === 'fazag'){ // Quando tiver um pouco mais de tempo setar link mapa pelo Prismic
            setUrlMaps("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.1858199162457!2d-39.60802052525079!3d-13.023835887296324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x73fdcd9f7920d1f%3A0xd6607110d345a4cf!2sFAZAG%20Amargosa!5e0!3m2!1spt-BR!2sbr!4v1731615634123!5m2!1spt-BR!2sbr")
        }
        if(params ==='farvalle'){
            setUrlMaps("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.1858199162457!2d-39.60802052525079!3d-13.023835887296324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x73fdcd9f7920d1f%3A0xd6607110d345a4cf!2sFAZAG%20Amargosa!5e0!3m2!1spt-BR!2sbr!4v1731615634123!5m2!1spt-BR!2sbr")
        }
    }, [])

    return(
        <div className={styles.container}>
            <ul className={styles.ul}>
                <li className={styles.list}>
                    <button className={toggle === 0 ? styles.listButtonActive : styles.listButton} onClick={() => setToggle(0)}>
                        Informações do Curso
                    </button>
                </li>
                <li className={styles.list}>
                    <button className={toggle === 1 ? styles.listButtonActive : styles.listButton} onClick={() => setToggle(1)}>
                        Regras
                    </button>
                </li>
                <li className={styles.list}>
                    <button className={toggle === 2 ? styles.listButtonActive : styles.listButton} onClick={() => setToggle(2)}>
                        Endereço
                    </button>
                </li>
                <li className={styles.listFinal}>

                </li>
            </ul>
            
            { toggle === 0 && 
            <div className={styles.courseInfoContainer}>
                <PrismicRichText field={course_information} components={
                    {
                        heading1: ({children}) => <p className={styles.headingOne}>{children}</p>,
                        heading2: ({children}) => <p className={styles.headingTwo}>{children}</p>,
                        heading3: ({children}) => <p className={styles.headingTree}>{children}</p>,
                        paragraph: ({children}) => <p className={styles.paragraph}>{children}</p>,
                        image: ({node, key}) => {
                       const img = <img src={node.url} className={styles.image} width={1000} height={500} alt={node.alt ? node.alt : ''}/>
                       return (
                        <p key={key} className={styles.imageBlock}>
                            { node.linkTo ? (
                            <PrismicNextLink field={node.linkTo}> {img} </PrismicNextLink>
                            ) : (
                                img
                            )
                        }
                        </p>
                       )
                    }
                    }
                }/>
            </div> 
            }
            { toggle === 1 && 
            <div className={styles.courseInfoContainer}>
                  <section className={styles.regrasContainer}>
                <h3>Regras da bolsa</h3>
                <strong>A Bolsa Fácil está disponível para:</strong>
                <ul className={styles.regrasUl}>
                    <li className={styles.regrasLi}>Estudantes que iniciarão sua primeira graduação.</li>
                    <li className={styles.regrasLi}>Estudantes que estão ingressando em sua segunda graduação.</li>
                    <li className={styles.regrasLi}>Estudantes que vêm por transferência de outra instituição.</li>
                    <li className={styles.regrasLi}>Estudantes já matriculados ou com algum vínculo acadêmico com a instituição.</li>
                </ul>
                <strong>Quem não pode solicitar a Bolsa Fácil:</strong>
                <ul className={styles.regrasUl}>
                    <li className={styles.regrasLi}>Estudantes que ainda não concluíram o Ensino Médio.</li>
                </ul>
            </section>
            </div> 
            }
            { toggle === 2 && 
            <div className={styles.courseInfoContainer}>
                <p className={styles.textInfo}>

                </p>
                <iframe src={`${urlMaps}`} className={styles.iframeMaps} style={{border: 'none', borderRadius: '8px'}} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div> 
            }
        </div>
        
    )
}