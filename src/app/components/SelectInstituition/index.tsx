'use client'

import { useEffect, useState } from 'react'
import { getClient } from '../../services/prismic'
import styles from './style.module.scss'
import { FarvalleDocument, FazagDocument, UniversityDocument } from '../../../../prismicio-types'
import { Loading } from '../Loading'

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
                <label htmlFor="instituicao">Instituição: *</label>
                <select className={styles.selectInput} id='instituicao' name='instituition' onChange={(e) => getCourses(e.target.value)}>
                    <option value="" disabled selected>Selecione a Instituição</option>
                    {instituitions?.map((item, index) => (
                        <option key={index} value={item.uid}>
                            {item.data.university}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.selectDiv}>
                <label htmlFor="curso">Curso: *</label>
                <select className={styles.selectInput} id='curso' name='course' disabled={!courses || loadingCourses}>
                    <option value="" disabled selected>
                        {loadingCourses ? 'Carregando cursos...' : 'Selecione o Curso'}
                    </option>
                    {courses?.map((item, index) => (
                        <option key={index} value={`${item.data.name}`}>
                            {item.data.name}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}