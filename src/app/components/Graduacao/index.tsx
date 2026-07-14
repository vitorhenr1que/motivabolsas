'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PiShieldCheckFill } from 'react-icons/pi'

import { getClient } from '../../services/prismic'
import styles from './style.module.scss'

type University = 'fazag' | 'farvalle'

interface CourseOption {
    name: string
    uid: string
}

const universities: Array<{ label: string; value: University }> = [
    { label: 'FAZAG', value: 'fazag' },
    { label: 'FARVALLE', value: 'farvalle' },
]

export function Graduacao() {
    const [university, setUniversity] = useState<University>('fazag')
    const [courses, setCourses] = useState<CourseOption[]>([])
    const [course, setCourse] = useState('')
    const [loadingCourses, setLoadingCourses] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let active = true

        async function loadCourses() {
            setLoadingCourses(true)
            setCourse('')

            try {
                const client = getClient()
                const documents = await client.getAllByType(university, {
                    orderings: [{ field: `my.${university}.name`, direction: 'asc' }],
                })

                if (!active) return

                const availableCourses = documents
                    .filter((document) => document.uid && document.data.name)
                    .map((document) => ({
                        name: document.data.name as string,
                        uid: document.uid,
                    }))

                setCourses(availableCourses)
                setCourse(availableCourses[0]?.uid ?? '')
            } catch (error) {
                console.error('Erro ao carregar os cursos do Prismic:', error)
                if (active) setCourses([])
            } finally {
                if (active) setLoadingCourses(false)
            }
        }

        loadCourses()

        return () => {
            active = false
        }
    }, [university])

    function handleFind() {
        if (course) router.push(`/${university}/${course}`)
    }

    return (
        <div className={styles.container}>
            <div className={styles.formGrid}>
                <div className={styles.selectContainer}>
                    <label htmlFor="inst-select">Instituição:</label>
                    <select
                        id="inst-select"
                        value={university}
                        onChange={(event) => setUniversity(event.target.value as University)}
                    >
                        {universities.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectContainer}>
                    <label htmlFor="course-select">Curso desejado:</label>
                    <select
                        id="course-select"
                        value={course}
                        onChange={(event) => setCourse(event.target.value)}
                        disabled={loadingCourses || courses.length === 0}
                    >
                        {loadingCourses && <option value="">Carregando cursos...</option>}
                        {!loadingCourses && courses.length === 0 && <option value="">Nenhum curso disponível</option>}
                        {courses.map((item) => (
                            <option key={item.uid} value={item.uid}>{item.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <button
                    className={styles.buscar}
                    onClick={handleFind}
                    disabled={!course || loadingCourses}
                >
                    Ver Bolsas Disponíveis
                </button>
            </div>

            <div className={styles.trustBadge}>
                <PiShieldCheckFill size={18} />
                <span>Solicitação 100% gratuita e sem compromisso</span>
            </div>
        </div>
    )
}
