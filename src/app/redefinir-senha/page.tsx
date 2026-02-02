'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect, Suspense } from 'react'
import styles from './style.module.scss'
import { PasswordInput } from '../components/PasswordInput'
import { api } from '../services/api'
import { Loading } from '../components/Loading'
import { PiWarningCircleBold, PiShieldCheckBold, PiArrowLeftBold, PiEnvelopeSimpleBold } from 'react-icons/pi'
import Link from 'next/link'
import { useUser } from '../components/contexts/user-provider'

function RedefinirSenhaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useUser()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // State 2: Request Mode (Requesting the link)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [requestEmail, setRequestEmail] = useState('')

  const emailParam = searchParams.get('email')
  const tokenParam = searchParams.get('token')

  // State for Logged In User (Change Password)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Remove redirect logic
  /* 
  useEffect(() => {
    if (user && (!emailParam || !tokenParam)) {
      router.push('/perfil?editPassword=true')
    }
  }, [emailParam, tokenParam, user, router])
  */

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/
    return regex.test(password)
  }

  // --- HANDLER FOR RESETTING PASSWORD (WITH TOKEN) ---
  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData)
    const password = String(data.password)
    const passConfirm = String(data.passConfirm)

    if (password !== passConfirm) {
      setError('As senhas não coincidem. Verifique e tente novamente.')
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('A senha deve ter 8+ caracteres, com letra maiúscula, número e caractere especial.')
      setLoading(false)
      return
    }

    try {
      await api.post('/reset-password', {
        email: emailParam,
        token: tokenParam,
        password
      })

      setSuccess(true)
      setLoading(false)

      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err)
      const message = err.response?.data?.message || 'Ocorreu um erro ao tentar redefinir sua senha. Verifique se o link ainda é válido.'
      setError(message)
      setLoading(false)
    }
  }

  // --- HANDLER FOR UPDATING PASSWORD (LOGGED IN) ---
  async function handlePasswordUpdate(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Preencha todos os campos.')
      setLoading(false)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('As novas senhas não coincidem.')
      setLoading(false)
      return
    }

    if (!validatePassword(passwordForm.newPassword)) {
      setError('A nova senha deve ter 8+ caracteres, com letra maiúscula, número e caractere especial.')
      setLoading(false)
      return
    }

    try {
      await api.patch('/user/update-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })

      setSuccess(true)
      setLoading(false)

      setTimeout(() => {
        // Optional: redirect or just stay
        router.push('/dashboard')
      }, 3000)

    } catch (err: any) {
      console.error('Erro ao atualizar senha:', err)
      const message = err.response?.data?.error || 'Erro ao atualizar senha. Verifique sua senha atual.'
      setError(message)
      setLoading(false)
    }
  }

  // --- HANDLER FOR REQUESTING RESET LINK (NO TOKEN) ---
  async function handleRequestSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestEmail)) {
      setError('Por favor, insira um endereço de e-mail válido.')
      setLoading(false)
      return
    }

    try {
      await api.post('/reset-request', { email: requestEmail })
      setRequestSuccess(true)
      setLoading(false)
    } catch (err: any) {
      console.error('Erro na solicitação:', err)
      const message = err.response?.data?.message || 'Não foi possível enviar o link. Tente novamente mais tarde.'
      setError(message)
      setLoading(false)
    }
  }

  // --- RENDER SUCCESS STATE (PASSWORD CHANGED) ---
  if (success) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.authCard}>
          <div className={styles.invalidState} style={{ color: '#10b981' }}>
            <PiShieldCheckBold className={styles.icon} style={{ color: '#10b981' }} />
            <h2 style={{ color: '#0f172a' }}>Senha Alterada!</h2>
            <p>Sua senha foi atualizada com sucesso.</p>
            {user ? (
              <Link href="/dashboard" className={styles.backLink} style={{ background: '#10b981', color: 'white' }}>
                Voltar ao Dashboard
              </Link>
            ) : (
              <Link href="/login" className={styles.backLink} style={{ background: '#10b981', color: 'white' }}>
                Ir para Login agora
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER CHANGE PASSWORD FORM (LOGGED IN USER) ---
  if (user && !emailParam && !tokenParam) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.authCard}>
          <header className={styles.header}>
            <h1>Alterar Senha</h1>
            <p>Para sua segurança, confirme sua senha atual antes de definir uma nova.</p>
          </header>

          <form className={styles.formContainer} onSubmit={handlePasswordUpdate}>
            <div className={styles.inputGroup}>
              <PasswordInput
                id="oldPassword"
                name="oldPassword"
                label="Senha Atual"
                placeholder="Sua senha atual"
                required
                value={passwordForm.oldPassword}
                onChange={(e: any) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              />
            </div>

            <div className={styles.inputGroup}>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="Nova Senha"
                placeholder="Crie uma nova senha forte"
                required
                value={passwordForm.newPassword}
                onChange={(e: any) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div className={styles.inputGroup}>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmar Nova Senha"
                placeholder="Repita a nova senha"
                required
                value={passwordForm.confirmPassword}
                onChange={(e: any) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            {error && (
              <div className={styles.errorBox}>
                <PiWarningCircleBold />
                <span>{error}</span>
              </div>
            )}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading}
            >
              {loading ? <Loading /> : "Atualizar Senha"}
            </button>

            <Link href="/dashboard" style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <PiArrowLeftBold /> Voltar ao Dashboard
            </Link>
          </form>
        </div>
      </div>
    )
  }

  // --- RENDER RESET FORM (HAS TOKEN) ---
  if (emailParam && tokenParam) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.authCard}>
          <header className={styles.header}>
            <h1>Nova Senha</h1>
            <p>Crie uma senha forte e segura para proteger sua conta.</p>
          </header>

          <form className={styles.formContainer} onSubmit={handleResetSubmit}>
            <div className={styles.inputGroup}>
              <PasswordInput
                id="password"
                name="password"
                label="Digite sua nova senha"
                placeholder="Crie uma senha forte"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <PasswordInput
                id="passConfirm"
                name="passConfirm"
                label="Confirme sua nova senha"
                placeholder="Repita a senha anterior"
                required
              />
            </div>

            {error && (
              <div className={styles.errorBox}>
                <PiWarningCircleBold />
                <span>{error}</span>
              </div>
            )}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading}
            >
              {loading ? <Loading /> : "Redefinir Minha Senha"}
            </button>

            <Link href="/login" style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <PiArrowLeftBold /> Voltar para o login
            </Link>
          </form>
        </div>
      </div>
    )
  }

  // --- RENDER REQUEST SUCCESS (LINK SENT) ---
  if (requestSuccess) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.authCard}>
          <div className={styles.invalidState} style={{ color: '#114a69' }}>
            <PiEnvelopeSimpleBold className={styles.icon} />
            <h2 style={{ color: '#0f172a' }}>Verifique seu E-mail</h2>
            <p>Enviamos um link de recuperação para <strong>{requestEmail}</strong>. <br />Verifique sua caixa de entrada e spam.</p>
            <Link href="/login" className={styles.backLink}>
              Voltar para o Login
            </Link>
            <button
              onClick={() => setRequestSuccess(false)}
              style={{ marginTop: '1rem', color: '#64748b', textDecoration: 'underline', fontSize: '0.875rem' }}
            >
              Tentar outro e-mail
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER REQUEST FORM (NO TOKEN - DEFAULT STATE) ---
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        <header className={styles.header}>
          <h1>Recuperar Senha</h1>
          <p>Informe seu e-mail cadastrado para receber o link de redefinição.</p>
        </header>

        <form className={styles.formContainer} onSubmit={handleRequestSubmit}>
          <div className={styles.inputGroup}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>E-mail</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <PiEnvelopeSimpleBold style={{ position: 'absolute', left: '1rem', color: '#64748b', fontSize: '1.25rem' }} />
              <input
                type="email"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '1rem',
                  color: '#0f172a'
                }}
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <PiWarningCircleBold />
              <span>{error}</span>
            </div>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? <Loading /> : "Enviar Link de Recuperação"}
          </button>

          <Link href="/login" style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <PiArrowLeftBold /> Voltar para o login
          </Link>
        </form>
      </div>
    </div>
  )
}

export default function RedefinirSenha() {
  return (
    <Suspense fallback={
      <div className={styles.pageWrapper}>
        <Loading />
      </div>
    }>
      <RedefinirSenhaContent />
    </Suspense>
  )
}