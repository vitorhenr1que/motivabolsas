import styles from './style.module.scss'

interface createInputProps{
    id: string,
    name: string,
    type: string,
    placeholder: string,
    label: string,
    required: boolean
}

export function CreateInput({id, name, type, placeholder, label, required}: createInputProps){
    return (
            <div className={styles.inputContainer}>
                <label htmlFor={id}>{label}</label>
                <input name={name} id={id} type={type} placeholder={placeholder} required={required} />
            </div>
    )
}