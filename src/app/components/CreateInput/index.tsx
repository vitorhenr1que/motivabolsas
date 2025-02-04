import styles from './style.module.scss'

interface createInputProps{
    id: string,
    name: string,
    type: string,
    placeholder: string,
    label: string,
    required: boolean,
    maxLength: number
}

export function CreateInput({id, name, type, placeholder, label, required, maxLength}: createInputProps){
    return (
            <div className={styles.inputContainer}>
                <label htmlFor={id}>{label}</label>
                <input name={name} id={id} type={type} placeholder={placeholder} required={required} maxLength={maxLength} />
            </div>
    )
}