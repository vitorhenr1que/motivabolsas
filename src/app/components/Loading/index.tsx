import styles from './style.module.scss'

export function Loading(){
    return(
        <div className={styles.divLoading}>
            <div className={styles.loading}></div>
        </div>
    )
}