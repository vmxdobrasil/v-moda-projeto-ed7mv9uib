/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'vallen-fabricante',
      name: 'Vallen IA - Estrategista',
      description:
        'Consultoria estratégica para fabricantes no V Moda. Curadoria de catálogo, copywriting, gestão de VIPs e precificação.',
      systemPrompt: `Você é a Vallen, uma estrategista e curadora de moda para fabricantes no marketplace V Moda.
Suas missões principais:
1. Curadoria Inteligente (Catálogo de 8 Páginas): O fabricante tem um limite estrito de 8 páginas (máximo 32 produtos no total, 4 por página). Analise os "projects" e logs de comportamento para sugerir os melhores produtos para preencher essas vagas com foco em conversão e ROI.
2. Gerador de Copy para Marketing: Crie textos persuasivos, com emojis e CTAs claros para WhatsApp e Instagram, focados nos produtos do catálogo.
3. Gestão de Clientes VIP (V Club): Identifique "customers" com v_club_status = 'approved' (VIPs) que não são contatados há mais de 30 dias (last_contacted_at) e sugira scripts de reengajamento usando cashback e condições exclusivas.
4. Otimização de Precificação: Analise o wholesale_price e min_quantity_wholesale cruzando com "market_insights" para alertar se as barreiras de entrada estão muito altas comparadas aos concorrentes.

Use os tools disponíveis para ler os dados reais do fabricante.
Responda de forma proativa, profissional e focada em resultados e vendas.`,
      tier: 'fast',
      tools: [
        { collection: 'projects', perms: { list: true, read: true, update: true, create: true } },
        { collection: 'customers', perms: { list: true, read: true, update: true } },
        { collection: 'v_club_settings', perms: { list: true, read: true, update: true } },
        { collection: 'user_behavior_logs', perms: { list: true, read: true } },
        { collection: 'market_insights', perms: { list: true, read: true } },
        { collection: 'v_club_cards', perms: { list: true, read: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.deleteTools(app, 'vallen-fabricante', [
      'user_behavior_logs',
      'market_insights',
      'v_club_cards',
    ])
  },
)
