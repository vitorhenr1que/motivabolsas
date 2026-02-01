import { ReactNode } from 'react'
import styles from './style.module.scss'

interface createInputProps {
    id: string,
    name: string,
    type: string,
    placeholder: string,
    label: string,
    required: boolean,
    maxLength: number,
    error?: string,
    icon?: ReactNode,
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export function CreateInput({ id, name, type, placeholder, label, required, maxLength, error, icon, onBlur }: createInputProps) {
    return (
        <div className={`${styles.inputContainer} ${error ? styles.hasError : ''}`}>
            <label htmlFor={id}>{label}</label>
            <div className={styles.inputWrapper}>
                {icon && <div className={styles.inputIcon}>{icon}</div>}
                <input
                    name={name}
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    maxLength={maxLength}
                    onBlur={onBlur}
                />
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    )
}