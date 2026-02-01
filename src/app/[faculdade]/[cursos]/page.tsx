import Link from 'next/link'
import styles from './style.module.scss'
import { UniversityImages } from '@/app/components/UniversityImages'
import { InfoCourse } from '@/app/components/InfoCourse'
import { getClient } from '@/app/services/prismic'
import Image from 'next/image'
import { FarvalleDocumentData, FazagDocumentData, Simplify } from '../../../../prismicio-types'
import { SolicitarBolsa } from '@/app/components/SolicitarBolsa'
import { notFound } from 'next/navigation'
import { PiCaretRightBold, PiClockBold, PiGraduationCapBold, PiMapPinBold } from 'react-icons/pi'

type faculdade = "fazag" | "farvalle"

type course = Simplify<FazagDocumentData> | Simplify<FarvalleDocumentData>

interface ParamsProps {
    params: {
        faculdade: faculdade,
        cursos: string
    }
}

const FACULDADES_PERMITIDAS = ['fazag', 'farvalle'];

export default async function Curso({ params }: ParamsProps) {
    if (!FACULDADES_PERMITIDAS.includes(params.faculdade)) {
        notFound();
    }

    const slugValido = /^[a-z0-9-]+$/.test(params.cursos);
    if (!slugValido) {
        notFound();
    }

    const client = getClient()

    const response = await client.getByUID(`${params.faculdade}`, `${params.cursos}`, {})
    const course: course = response.data

    const responseImages = await client.getByUID(`${params.faculdade}_photos`, `${params.faculdade}`)
    const faculdadeImages = responseImages.data

    const discountedPrice = course.total_value && course.discount !== null
        ? (course.total_value - (course.total_value * course.discount / 100)).toFixed(2)
        : '0.00';

    return (
        <div className={styles.container}>
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb}>
                <Link href="/">Home</Link>
                <PiCaretRightBold />
                <span className={styles.active}>{params.faculdade.toUpperCase()}</span>
                <PiCaretRightBold />
                <span>{course.name}</span>
            </nav>

            <section className={styles.headerTitle}>
                <h1>Graduação em {course.name}</h1>
                <p>Conheça a infraestrutura da {params.faculdade.toUpperCase()} e garanta seu desconto.</p>
            </section>

            <section className={styles.main}>
                <div className={styles.divImages}>
                    <UniversityImages faculdadeImages={faculdadeImages} />
                </div>

                <aside className={styles.courseSidebar}>
                    <div className={styles.courseCard}>
                        <div className={styles.courseHeader}>
                            <div className={styles.modalidadeBadge}>
                                <PiGraduationCapBold size={18} />
                                <span>{course.modality}</span>
                            </div>
                            <span className={styles.vagasBadge}>16 Vagas Restantes</span>

                            <h3>{course.name?.toUpperCase()}</h3>

                            <div className={styles.courseDetails}>
                                <div className={styles.detailItem}>
                                    <PiClockBold />
                                    <span>4 anos</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <PiMapPinBold />
                                    <span>{params.faculdade.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.priceContainer}>
                            <div className={styles.originalPrice}>
                                <s>R$ {course.total_value?.toFixed(2)}</s>
                                <span className={styles.discountBadge}>-{course?.discount}% OFF</span>
                            </div>

                            <div className={styles.finalPrice}>
                                <span className={styles.currency}>R$</span>
                                <span className={styles.value}>{discountedPrice}</span>
                                <span className={styles.period}>/mês</span>
                            </div>
                            <p className={styles.durationNote}>Mensalidade fixa durante todo o curso</p>
                        </div>

                        <div className={styles.ctaContainer}>
                            <SolicitarBolsa faculdade={params.faculdade} fixed={false} />
                            <Link href="#info" className={styles.linkInfo}>Ver detalhes do curso</Link>
                        </div>
                    </div>
                </aside>

                {/* Mobile Fixed CTA */}
                <div className={styles.courseContainerFixed}>
                    <div className={styles.fixedInfo}>
                        <h3>{course.name}</h3>
                        <div className={styles.fixedPrices}>
                            <s>R$ {course.total_value?.toFixed(2)}</s>
                            <span>R$ <strong>{discountedPrice}</strong>/mês</span>
                        </div>
                    </div>
                    <SolicitarBolsa faculdade={params.faculdade} fixed={true} />
                </div>
            </section>

            <div id="info">
                <InfoCourse course_information={course.course_information} params={params.faculdade} />
            </div>
        </div>
    )
}
