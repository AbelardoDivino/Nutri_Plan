import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Voltar</Link>
        <h1 style={{ marginTop: 16, marginBottom: 8 }}>Política de Privacidade</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="card" style={{ lineHeight: 1.7, fontSize: '0.92rem' }}>
          <h3>1. Quem somos</h3>
          <p>O NutriPlan é uma plataforma de acompanhamento nutricional e de treinos, operada por nutricionista responsável. Esta política descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

          <h3 style={{ marginTop: 16 }}>2. Dados coletados</h3>
          <p>Coletamos: nome, e-mail, telefone, data de nascimento, gênero, altura, peso, medidas corporais, objetivos, planos alimentares, treinos, registros de evolução e mensagens trocadas com a nutricionista. Dados de saúde são considerados dados sensíveis e recebem proteção reforçada.</p>

          <h3 style={{ marginTop: 16 }}>3. Finalidade</h3>
          <p>Os dados são utilizados exclusivamente para: elaborar e acompanhar planos alimentares e de treino, monitorar a evolução do paciente, permitir a comunicação entre paciente e nutricionista e cumprir obrigações legais e profissionais.</p>

          <h3 style={{ marginTop: 16 }}>4. Compartilhamento</h3>
          <p>Não compartilhamos seus dados com terceiros, exceto quando exigido por lei ou com seu consentimento expresso. Os dados são armazenados em servidores seguros com acesso restrito à nutricionista responsável.</p>

          <h3 style={{ marginTop: 16 }}>5. Segurança</h3>
          <p>Adotamos medidas técnicas e administrativas para proteger seus dados: senhas criptografadas (bcrypt), comunicação via HTTPS, controle de acesso por perfil (paciente/nutricionista) e rate limiting contra ataques.</p>

          <h3 style={{ marginTop: 16 }}>6. Seus direitos (LGPD)</h3>
          <p>Você tem direito a: confirmar a existência de tratamento; acessar seus dados; corrigir dados incompletos ou desatualizados; solicitar a anonimização, bloqueio ou eliminação; portabilidade dos dados; revogar o consentimento. Pacientes podem exportar seus dados e solicitar a exclusão da conta diretamente na área "Perfil".</p>

          <h3 style={{ marginTop: 16 }}>7. Retenção</h3>
          <p>Os dados são mantidos enquanto a relação de acompanhamento estiver ativa ou conforme exigido por obrigação legal/profissional. Após o encerramento, podem ser anonimizados ou excluídos a pedido.</p>

          <h3 style={{ marginTop: 16 }}>8. Contato do controlador (DPO)</h3>
          <p>Para exercer seus direitos ou esclarecer dúvidas, entre em contato com a nutricionista responsável através da área de mensagens do aplicativo ou pelo e-mail informado no cadastro.</p>
        </div>
      </div>
    </div>
  )
}