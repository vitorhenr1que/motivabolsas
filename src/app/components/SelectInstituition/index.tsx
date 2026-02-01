'use client'

import { useEffect, useState } from 'react'
import { getClient } from '../../services/prismic'
import styles from './style.module.scss'
import { FarvalleDocument, FazagDocument, UniversityDocument } from '../../../../prismicio-types'
import { PiBankBold, PiBookOpenBold, PiCaretDownBold } from 'react-icons/pi'

export function SelectInstituition() {

    type universityType = 'fazag' | 'farvalle' // Adicionar novas instituições aqui
    type courseType = FazagDocument<string> | FarvalleDocument<string>

    const [instituitions, setInstituitions] = useState<UniversityDocument<string>[] | undefined>(undefined)
    const [courses, setCourses] = useState<courseType[] | undefined>(undefined)

    const [loadingCourses, setLoadingCourses] = useState(false)

    async function getInstituitions() {
        const client = getClient()
        const response = await client.getAllByType('university', {})
        setInstituitions(response)
    }

    async function getCourses(uid: string) {
        setLoadingCourses(true)
        setCourses(undefined)

        const client = getClient()
        const response = await client.getAllByType(uid as universityType, {
            orderings: [
                {
                    field: `my.${uid}.name`,
                    direction: 'asc'
                }
            ]
        })

        setCourses(response as courseType[])
        setLoadingCourses(false)
    }

    useEffect(() => {
        getInstituitions()
    }, [])

    return (
        <>
            <div className={styles.selectDiv}>
                <label htmlFor="instituicao">Instituição</label>
                <div className={styles.selectWrapper}>
                    <PiBankBold className={styles.inputIcon} />
                    <select className={styles.selectInput} id='instituicao' name='instituition' onChange={(e) => getCourses(e.target.value)} required defaultValue="">
                        <option value="" disabled>Onde você quer estudar?</option>
                        {instituitions?.map((item, index) => (
                            <option key={index} value={item.uid}>
                                {item.data.university}
                            </option>
                        ))}
                    </select>
                    <PiCaretDownBold className={styles.chevronIcon} />
                </div>
            </div>

            <div className={styles.selectDiv}>
                <label htmlFor="curso">Curso de Interesse</label>
                <div className={styles.selectWrapper}>
                    <PiBookOpenBold className={styles.inputIcon} />
                    <select className={styles.selectInput} id='curso' name='course' disabled={!courses || loadingCourses} required defaultValue="">
                        <option value="" disabled>
                            {loadingCourses ? 'Carregando cursos...' : 'Qual curso você busca?'}
                        </option>
                        {courses?.map((item, index) => (
                            <option key={index} value={`${item.data.name}`}>
                                {item.data.name}
                            </option>
                        ))}
                    </select>
                    <PiCaretDownBold className={styles.chevronIcon} />
                </div>
            </div>
        </>
    )
}
