'use client'
import { useEffect, useState } from "react"
import styles from './style.module.scss'
import { PrismicRichText } from "@prismicio/react"
import { PrismicNextLink } from "@prismicio/next"
import { PiCheckCircleFill, PiClipboardTextBold, PiInfoBold, PiMapPinFill, PiWarningCircleFill } from "react-icons/pi"

export function InfoCourse({ course_information, params }: any) {
    const [activeTab, setActiveTab] = useState<number>(0)
    const [urlMaps, setUrlMaps] = useState("")

    useEffect(() => {
        if (params === 'fazag') {
            setUrlMaps("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.9943920739865!2d-39.06707302519602!3d-13.350624667545612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x73e4165a4045dbf%3A0x4f9fdd7364a5b4e7!2sFAZAG!5e0!3m2!1spt-BR!2sbr!4v1732300198049!5m2!1spt-BR!2sbr")
        }
        if (params === 'farvalle') {
            setUrlMaps("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.1858199162457!2d-39.60802052525079!3d-13.023835887296324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x73fdcd9f7920d1f%3A0xd6607110d345a4cf!2sFAZAG%20Amargosa!5e0!3m2!1spt-BR!2sbr!4v1731615634123!5m2!1spt-BR!2sbr")
        }
    }, [params])

    const tabs = [
        { title: "Informações", icon: <PiInfoBold size={20} /> },
        { title: "Regras da Bolsa", icon: <PiClipboardTextBold size={20} /> },
        { title: "Localização", icon: <PiMapPinFill size={20} /> }
    ]

    return (
        <div className={styles.container}>
            <nav className={styles.tabsHeader}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={activeTab === index ? styles.tabItemActive : styles.tabItem}
                        onClick={() => setActiveTab(index)}
                        aria-selected={activeTab === index}
                        role="tab"
                    >
                        {tab.icon}
                        <span>{tab.title}</span>
                    </button>
                ))}
            </nav>

            <div className={styles.tabPanel} role="tabpanel">
                {activeTab === 0 && (
                    <div className={styles.courseInfoContainer}>
                        <PrismicRichText
                            field={course_information}
                            components={{
                                heading1: ({ children }) => <h2 className={styles.headingOne}>{children}</h2>,
                                heading2: ({ children }) => <h3 className={styles.headingTwo}>{children}</h3>,
                                heading3: ({ children }) => <h4 className={styles.headingThree}>{children}</h4>,
                                paragraph: ({ children }) => <p className={styles.paragraph}>{children}</p>,
                                image: ({ node, key }) => {
                                    const img = <img src={node.url} className={styles.image} alt={node.alt || ''} />
                                    return (
                                        <div key={key} className={styles.imageBlock}>
                                            {node.linkTo ? <PrismicNextLink field={node.linkTo}>{img}</PrismicNextLink> : img}
                                        </div>
                                    )
                                }
                            }}
                        />
                    </div>
                )}

                {activeTab === 1 && (
                    <div className={styles.regrasContainer}>
                        <div className={styles.descriptionSection}>
                            <div className={styles.iconHeading}>
                                <PiCheckCircleFill className={styles.iconSuccess} size={28} />
                                <h3>Quem pode solicitar a bolsa:</h3>
                            </div>
                            <ul className={styles.regrasUl}>
                                <li className={styles.regrasLi}>Estudantes que iniciarão sua primeira graduação.</li>
                                <li className={styles.regrasLi}>Estudantes que estão ingressando em sua segunda graduação.</li>
                                <li className={styles.regrasLi}>Estudantes que vêm por transferência de outra instituição.</li>
                                <li className={styles.regrasLi}>Estudantes já matriculados ou com algum vínculo acadêmico.</li>
                            </ul>
                        </div>

                        <div className={styles.descriptionSection}>
                            <div className={styles.iconHeading}>
                                <PiWarningCircleFill className={styles.iconWarning} size={28} />
                                <h3>Quem não pode solicitar:</h3>
                            </div>
                            <ul className={styles.regrasUl}>
                                <li className={styles.regrasLi}>Estudantes que ainda não concluíram o Ensino Médio.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 2 && (
                    <div className={styles.mapsContainer}>
                        <div className={styles.mapsHeading}>
                            <PiMapPinFill size={24} />
                            <h3>Endereço da Instituição</h3>
                        </div>
                        <iframe
                            src={urlMaps}
                            className={styles.iframeMaps}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                )}
            </div>
        </div>
    )
}
