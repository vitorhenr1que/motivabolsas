import Link from 'next/link';
import { PiArrowLeftBold } from 'react-icons/pi';
import styles from './style.module.scss';

export default function PrivacidadePage() {
    return (
        <div className={styles.legalWrapper}>
            <article className={styles.contentCard}>
                <header>
                    <h1>Política de Privacidade</h1>
                    <p>Última atualização: 01 de Fevereiro de 2026</p>
                </header>

                <section>
                    <h2>1. Coleta de Informações</h2>
                    <p>
                        Coletamos informações pessoais que você nos fornece voluntariamente ao se cadastrar no portal, como nome, CPF, e-mail, telefone e dados acadêmicos de interesse.
                    </p>
                </section>

                <section>
                    <h2>2. Uso dos Dados</h2>
                    <p>
                        Seus dados são utilizados para:
                    </p>
                    <ul>
                        <li>Processar sua solicitação de bolsa de estudos.</li>
                        <li>Comunicar-nos com você sobre sua matrícula e benefícios.</li>
                        <li>Melhorar nossos serviços e personalizar sua experiência.</li>
                        <li>Garantir a segurança e integridade das transações.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Compartilhamento com Terceiros</h2>
                    <p>
                        Compartilhamos suas informações apenas com as instituições de ensino escolhidas por você para viabilizar a concessão da bolsa. Não vendemos suas informações para terceiros.
                    </p>
                </section>

                <section>
                    <h2>4. Segurança dos Dados</h2>
                    <p>
                        Empregamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, perda ou alteração.
                    </p>
                </section>

                <section>
                    <h2>5. Seus Direitos (LGPD)</h2>
                    <p>
                        Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento através do nosso canal de suporte.
                    </p>
                </section>

                <section>
                    <h2>6. Cookies</h2>
                    <p>
                        Utilizamos cookies para entender como os usuários interagem com nosso site e para melhorar a navegação. Você pode gerenciar as preferências de cookies em seu navegador.
                    </p>
                </section>

                <footer>
                    <Link href="/" className={styles.backHome}>
                        <PiArrowLeftBold />
                        Voltar para a Home
                    </Link>
                </footer>
            </article>
        </div>
    );
}
