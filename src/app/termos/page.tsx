import Link from 'next/link';
import { PiArrowLeftBold } from 'react-icons/pi';
import styles from './style.module.scss';

export default function TermosPage() {
    return (
        <div className={styles.legalWrapper}>
            <article className={styles.contentCard}>
                <header>
                    <h1>Termos de Uso</h1>
                    <p>Última atualização: 01 de Fevereiro de 2026</p>
                </header>

                <section>
                    <h2>1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar e utilizar o portal Motiva Bolsas, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso.
                        Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
                    </p>
                </section>

                <section>
                    <h2>2. Serviços Oferecidos</h2>
                    <p>
                        O Motiva Bolsas atua como um facilitador entre estudantes e instituições de ensino parceiras, oferecendo bolsas de estudo e descontos exclusivos nas mensalidades.
                        Não somos uma instituição de ensino e não garantimos a aprovação no vestibular ou processo seletivo da faculdade.
                    </p>
                </section>

                <section>
                    <h2>3. Responsabilidades do Aluno</h2>
                    <ul>
                        <li>Fornecer informações verdadeiras e precisas durante o cadastro.</li>
                        <li>Cumprir com os requisitos de elegibilidade da instituição de ensino escolhida.</li>
                        <li>Realizar o pagamento da Taxa de Adesão para garantir o benefício da bolsa.</li>
                        <li>Manter-se em dia com as mensalidades junto à faculdade para manter o desconto.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Propriedade Intelectual</h2>
                    <p>
                        Todo o conteúdo presente neste site, incluindo textos, gráficos, logos e software, é de propriedade do Motiva Bolsas ou de seus licenciadores e está protegido por leis de direitos autorais.
                    </p>
                </section>

                <section>
                    <h2>5. Alterações nos Termos</h2>
                    <p>
                        Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações entrarão em vigor imediatamente após sua publicação no site.
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
