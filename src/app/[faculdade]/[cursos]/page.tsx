import Link from 'next/link'
import styles from './style.module.scss'
import { UniversityImages } from '@/app/components/UniversityImages'
import { InfoCourse } from '@/app/components/InfoCourse'
import { getClient } from '@/app/services/prismic'
import Image from 'next/image'
import { FarvalleDocumentData, FazagDocumentData, Simplify } from '../../../../prismicio-types'

type faculdade = "fazag" | "farvalle"  // Colocar novas faculdades aqui

type course = Simplify<FazagDocumentData> | Simplify<FarvalleDocumentData>

interface courseProps{
    
}
// colocar NODE_ENV = production

interface ParamsProps{
    params: {
        faculdade: faculdade,
        cursos: string
    }
}



export default async function Curso({params}: ParamsProps){
    console.log('faculdade/cursos - Params: ', params)
    const parametros = params

        const client = getClient()
        
        const response = await client.getByUID(`${params.faculdade}`, `${params.cursos}`, {})
        const course: course = response.data

         const responseImages = await client.getByUID(`${params.faculdade}_photos`, `${params.faculdade}`)
         const faculdadeImages = responseImages.data
         console.log(faculdadeImages) 
    return (
        <div className={styles.container}>
            <h1>Fotos da {params.faculdade.toUpperCase()}</h1>
            <section className={styles.main}>
                <div className={styles.divImages}> {/* Container das Imagens */}
                <UniversityImages faculdadeImages={faculdadeImages}/>
                </div> 

                <div className={styles.courseContainer}> {/* Container dos Cursos */}
                    <div className={styles.courseHeader}>
                    <div className={styles.textsContainer}>
                        <h3>{course.name?.toUpperCase()}</h3>
                        <div className={styles.modalidade}>{course.modality}</div>
                        <span className={styles.vagas}>16 Vagas Restantes</span>
                        <div className={styles.totalValueContainer}>
                            <s className={styles.totalValue}>R$ {course.total_value?.toFixed(2)}</s>
                            <div className={styles.discountContainer}>
                                <span className={styles.discount}>-{course?.discount}%</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.imageCourse}>
                        <Image className={styles.image} src={`${course?.course_image.url}`} alt={`Curso de ${course.name}`} width={500} height={500} quality={100}/>
                    </div>
                    
                    </div>
                    <div className={styles.courseMain}>
                    <div className={styles.discountValueContainer}>
                        <span className={styles.discountText}>R$ </span>
                        <span className={styles.discountValue}>{course.total_value && course.discount !== null ? (course?.total_value - (course?.total_value * course?.discount / 100)).toFixed(2) : ''}</span>
                        <span className={styles.discountText}> /mês</span>
                    </div>
                    <span>Durante todo o curso</span>
                    <div className={styles.courseFooter}>
                        <Link href="#" className={styles.comoFunciona}>Como funciona?</Link>
                        <Link className={styles.linkButton} id={`click_whatsapp_${params.faculdade}`} href="https://api.whatsapp.com/send/?phone=5575982802259&text=Ol%C3%A1%2C+gostaria+de+solicitar+minha+bolsa.&type=phone_number&app_absent=0">Solicitar Bolsa</Link>
                    </div>
                </div>
                    
                </div>
                <div className={styles.courseContainerFixed}> {/* Container Fixado somente para disp. móveis */}
                    <h3>{course.name}</h3>
                    <div className={styles.fixedContainer}>
                        <div className={styles.fixedValuesContainer}>
                            <s>R$ {course.total_value?.toFixed(2)}</s>
                            <span>R$ <strong>{course.total_value && course.discount !== null ? (course?.total_value - (course?.total_value * course?.discount / 100)).toFixed(2) : ''}</strong> /mês</span>
                        </div>
                        <Link id={`click_whatsapp_${params.faculdade}`} href={"https://api.whatsapp.com/send/?phone=5575982802259&text=Ol%C3%A1%2C+gostaria+de+solicitar+minha+bolsa.&type=phone_number&app_absent=0"}  className={styles.fixedLinkButton}>
                            <span>Solicitar Bolsa</span>
                        </Link>
                    </div>
                </div>
            </section>
            <InfoCourse course_information={course.course_information} params={params.faculdade} />
          
        </div>
    )
}