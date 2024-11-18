'use client'
import { useEffect, useState } from 'react'
import styles from './style.module.scss'
import { useRouter } from 'next/navigation'



export function Graduacao(){
    
    const [university, setUniversity] = useState<number>(0)
    const [course, setCourse] = useState<String>("administracao")
    const router = useRouter()
    
    console.log(course)
    function handleFind(){
        router.push(`/${faculdades[university].toLocaleLowerCase()}/${course}`)
    }
    const faculdades = ["FAZAG", "FARVALLE"] //Adicionar nova faculdade aqui

    const graduacao: any = [
        
            {
                "FAZAG": {
                    Presencial: [
                        {"0": ["ADMINISTRAÇÃO", "administracao"]}, 
                        {"1": ["CIÊNCIAS CONTÁBEIS", "ciencias-contabeis"]}, 
                        {"2": ["EDUCAÇÃO FÍSICA", "educacao-fisica"]}, 
                        {"3": ["ENFERMAGEM", "enfermagem"]}, 
                        {"4": ["ENGENHARIA CIVIL", "engenharia-civil"]}, 
                        {"5": ["ESTÉTICA E COSMÉTICA", "estetica-e-cosmetica"]}, 
                        {"6":["FARMÁCIA", "farmacia"]}, 
                        {"7": ["FISIOTERAPIA", "fisioterapia"]}, 
                        {"8": ["NUTRIÇÃO", "nutricao"]}, 
                        {"9": ["PEDAGOGIA", "pedagogia"]}, 
                        {"10": ["PSICOLOGIA", "psicologia"]}, 
                        {"11": ["SERVIÇO SOCIAL", "servico-social"]}
                    ]
                }
            },
        
            {
                "FARVALLE": {
                    Presencial: [
                        {"0": ["ENFERMAGEM", "enfermagem"]}, 
                        {"1": ["FISIOTERAPIA", "fisioterapia"]}, 
                        {"2": ["PEDAGOGIA", "pedagogia"]}
                    ]
                }
            }
             // Nova faculdade com os cursos aqui
    ]
    console.log(graduacao[0])
    console.log(course)
    useEffect(() => { // Quando trocar a seleção da instituição selecionar o primeiro curso por padrão[[]]
        console.log('test', )
        if(university === 0){
            setCourse(graduacao[0].FAZAG.Presencial[0][0][1])
        }
        if(university === 1){
            setCourse(graduacao[1].FARVALLE.Presencial[0][0][1])
        }
    },[university])
    return (
        <div className={styles.container}>
            <div className={styles.selectContainer}>
                <label htmlFor="inst-select">Selecione a instituição:</label>
                <select id='inst-select' onChange={(e) => setUniversity(Number(e.target.value))}>
                    <option value={0}>FAZAG</option>
                    <option value={1}>FARVALLE</option>
                </select>
            </div>
            <div className={styles.selectContainer}>
                <label htmlFor="course-select">Selecione o curso:</label>
                <select id='course-select' onChange={(e) => setCourse(e.target.value)}>
                <optgroup label='Selecione o curso'>
                {university === 0 && graduacao[0].FAZAG.Presencial.map((index: string, position: number) => {

                    return <option value={index[`${position}`][1]} key={position}>{index[`${position}`][0]}</option>
                })}
                {university === 1 && graduacao[1].FARVALLE.Presencial.map((index: string, position: number) => {
                     return <option value={index[`${position}`][1]} key={position}>{index[`${position}`][0]}</option>
                })}
                </optgroup>
                

                </select>
            </div>
            <button className={styles.buscar} onClick={() => handleFind()}>
                Buscar
            </button>
        </div>
    )
}