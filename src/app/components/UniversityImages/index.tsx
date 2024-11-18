'use client'

import Image from "next/image"
import styles from "./style.module.scss"
import { useState } from "react"
import { InfoCourse } from "../InfoCourse"
import { FarvallePhotosDocument, FarvallePhotosDocumentData, FazagPhotosDocument, FazagPhotosDocumentData, Simplify } from "../../../../prismicio-types"
import { StaticImport } from "next/dist/shared/lib/get-img-props"


type faculdadeImagesPrismicType =  Simplify<FarvallePhotosDocumentData> | Simplify<FazagPhotosDocumentData>

interface faculdadeProps{
    faculdadeImages: faculdadeImagesPrismicType
}

export function UniversityImages({faculdadeImages}: faculdadeProps ){
    const [activeImage, setActiveImage] = useState(0)
    console.log(activeImage)
    const images = [
        faculdadeImages.image_01.url,
        faculdadeImages.image_02.url,
        faculdadeImages.image_03.url,
        faculdadeImages.image_04.url
    ]
    return(
        <div className={styles.container}>
        <section className={styles.headerSectionContainer}>
            <div className={styles.activeImage}>
                <Image src={`${images[activeImage]}`} alt="" width={1280} height={728} className={styles.image} quality={100}/>
            </div>
            <div className={styles.imagesForSelection}>
                {images.map((index: string | null | undefined, position: number) => {
                    return (
                        <button key={position} className={styles.buttonImage} onClick={() => setActiveImage(position)}>
                            <Image src={`${index}`} alt="" width={100} height={100} className={styles.image} quality={100}/>
                        </button>
                    )
                })}
            </div>
        </section>
        </div>
    )
}