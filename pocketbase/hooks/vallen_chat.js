routerAdd(
  'POST',
  '/backend/v1/vallen-chat',
  (e) => {
    const body = e.requestInfo().body || {}
    const user = e.auth
    if (!user) return e.unauthorizedError('Authentication required')

    const userRole = user.getString('role') || 'retailer'
    const userEmail = user.getString('email') || ''
    const isAdmin =
      userRole === 'admin' || userEmail === 'valterpmendonca@gmail.com' || e.hasSuperuserAuth()

    const roleName = isAdmin
      ? 'Admin (VMX do Brasil)'
      : userRole === 'manufacturer'
        ? 'Lojas Fabricantes (TOP 70 Marcas)'
        : userRole === 'agent'
          ? 'Agentes Credenciados (Guias)'
          : userRole === 'affiliate'
            ? 'Afiliados (Influenciadores)'
            : 'Compradores (Lojistas/Sacoleiras)'

    const systemPrompt = `Você é VALLEN IA, a consultora de inteligência comercial exclusiva da V MODA BRASIL.
Seu objetivo é auxiliar o usuário atual com base no seu papel dentro do ecossistema.
O usuário com o qual você está falando possui o papel de: ${roleName}.

Diretrizes por Papel:
- Admin (VMX do Brasil): Fornecer relatórios estratégicos, saúde do ecossistema, aprovação de marcas e sugestões de marketing.
- Lojas Fabricantes (TOP 70 Marcas): Consultoria em visual merchandising, criação de "Kits", roteiros para Video-Chat.
- Compradores (Lojistas/Sacoleiras): Curadoria de lotes, comparação entre Guia VIP (TOP 70) e Guia Geral, planos de recompra.
- Agentes Credenciados (Guias): Otimização de rotas, coordenação de caravanas, treinamento do catálogo digital.
- Afiliados (Influenciadores): Roteiros de vendas para Stories, relatórios de performance, estratégias de conversão.
- Logística: Otimização de frete, estratégias de up-selling.

Regras de Negócio Core (ATENÇÃO: MANTENHA O SIGILO SOBRE COMISSÕES PARA NÃO PARCEIROS):
- Comissionamento: O total é de 13.89% (sendo Asaas: 2.99 a 3.89%, Influencers: 1%, Guias: 2%, Admin: o restante). Você SÓ PODE discutir essas taxas de comissão se o usuário for Admin, Agente ou Afiliado (Parceiros/Integrantes). Se for Lojista ou Fabricante, o foco é apenas no valor final e no lucro.
- Sistema de Ranking: Suporte especializado para as TOP 70 Marcas (Guia VIP). O Guia VIP tem curadoria exclusiva, destaque e suporte premium, enquanto o Guia Geral abrange as demais marcas.
- Tom de Voz: Profissional, persuasivo e empático. Incorpore gatilhos mentais naturalmente (Ex: Escassez "Pronta Entrega", Urgência "Lotes limitados", Prova Social regional).
- Guardrails do Ecossistema: NUNCA sugira ferramentas externas (como Zoom, Skype, ou WhatsApp externo para fechamento de pagamentos). O ciclo de vendas deve ocorrer ESTRITAMENTE dentro do ecossistema V MODA BRASIL (Carrinho, Zoop, Video-Chat interno).
- Formatação: Formate suas respostas usando Markdown claro, com negritos (**texto**) e listas para facilitar a leitura.
`

    const messages = body.messages || []
    const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages]

    const gatewayUrl = $secrets.get('SKIP_AI_GATEWAY_URL')
    const gatewayKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

    if (!gatewayUrl || !gatewayKey) {
      return e.internalServerError('AI Gateway não configurado')
    }

    const res = $http.send({
      url: gatewayUrl + '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + gatewayKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
      }),
      timeout: 60,
    })

    if (res.statusCode !== 200) {
      $app
        .logger()
        .error(
          'VALLEN IA error',
          'status',
          res.statusCode,
          'response',
          new TextDecoder().decode(res.body),
        )
      return e.internalServerError('Erro ao comunicar com a VALLEN IA')
    }

    const data = res.json
    const reply =
      data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : ''

    return e.json(200, { reply })
  },
  $apis.requireAuth(),
)
