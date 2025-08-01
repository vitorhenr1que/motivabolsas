import styles from './style.module.scss'

export default function PoliticaDeBolsa(){
    return (
        <div className={styles.container}>
        <h2>POLÍTICA DE DESCONTOS E BOLSAS</h2>
        <p>A Faculdade FAZAG, em parceria com nossa empresa, oferece aos alunos diversas oportunidades de desconto por meio de bolsas educacionais e condições promocionais. Esta política tem como objetivo esclarecer como essas ofertas funcionam e quais são suas regras de validade.</p>
      
        <h3>DESCONTOS CONTRATUAIS</h3>
        <p>O desconto aplicado ao aluno é sempre aquele que está registrado no contrato assinado no momento da adesão da bolsa. Esse valor é garantido ao longo da vigência do contrato, respeitando os termos acordados entre as partes.</p>
      
        <h3>OFERTAS PROMOCIONAIS</h3>
        <p>Antes e no período da matrícula, é comum realizarmos campanhas promocionais com descontos maiores para novos ingressantes. Essas campanhas são sempre por tempo limitado, com datas definidas de início e término, e são válidas somente para quem garante a matrícula dentro do período da promoção.</p>
        <p>Essas ofertas não são retroativas, ou seja, se a matrícula foi realizada fora do período promocional, o aluno não terá direito ao desconto especial anterior.</p>
      
        <h3>RENOVAÇÃO DE BOLSA</h3>
        <p>Para manter a validade da bolsa ao longo do curso, é necessário que o aluno:</p>
        <ul>
          <li>Realize a renovação de matrícula dentro do prazo definido pela instituição;</li>
          <li>Efetue o pagamento da taxa de renovação, no valor de <strong>R$87,00</strong>, no momento da renovação semestral da instituição.</li>
        </ul>
        <p>Essa taxa garante a continuidade do vínculo entre a bolsa concedida e a instituição de ensino. Em caso de não pagamento ou perda do prazo de renovação, o desconto pode ser suspenso ou cancelado, conforme as regras institucionais.</p>
      
        <h3>CAMPANHAS FUTURAS E COMUNICAÇÃO</h3>
        <p>Durante o período de curso, podem surgir novas campanhas com descontos ou bolsas especiais. Sempre que isso ocorrer, os alunos serão avisados por e-mail, WhatsApp ou outros canais oficiais, com instruções sobre como participar.</p>
      
        <h3>INFORMAÇÕES ADICIONAIS</h3>
        <ul>
          <li>A empresa não garante que ofertas anteriores serão repetidas.</li>
          <li>Os descontos são intransferíveis e não acumuláveis com outras promoções, salvo quando informado.</li>
          <li>Para dúvidas ou suporte, os alunos podem entrar em contato com o atendimento oficial.</li>
        </ul>
        </div>
    )
}