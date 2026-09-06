// Rotator central para envio de WhatsApp com round-robin e throttle anti-banimento
// Este módulo expõe a função global $whatsappRotator para ser usada nos hooks.

const DEFAULT_API_URL = 'https://evolution-evolution.6xxwvj.easypanel.host'
const DEFAULT_API_KEY = '7i5UsFq1MM8pEbt8NqCVDPglfY8v9LTd'
const DEFAULT_INSTANCE = 'vmoda'
const DEFAULT_THROTTLE_SEC = 8

function normalizePhone(raw) {
  if (!raw) return ''
  let phone = String(raw).replace(/\D/g, '')
  if (phone.length === 10) {
    phone = '55' + phone.substring(0, 2) + '9' + phone.substring(2)
  } else if (phone.length === 11 && !phone.startsWith('55')) {
    phone = '55' + phone
  } else if (phone.length === 12 && phone.startsWith('55')) {
    phone = '55' + phone.substring(2, 4) + '9' + phone.substring(4)
  }
  return phone
}

function getActiveConfigsForUser(userId) {
  let configs = []
  try {
    if (userId) {
      configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'user = {:userId} && (is_active = true || is_active = null)',
        'last_used_at,created',
        100,
        0,
        { userId: userId },
      )
    }
  } catch (_) {}

  // Fallback para admin caso o usuário não tenha nenhuma instância cadastrada
  if ((!configs || configs.length === 0) && userId) {
    try {
      const admin = $app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      if (admin && admin.id !== userId) {
        configs = $app.findRecordsByFilter(
          'whatsapp_configs',
          'user = {:userId} && (is_active = true || is_active = null)',
          'last_used_at,created',
          100,
          0,
          { userId: admin.id },
        )
      }
    } catch (_) {}
  }

  // Fallback geral: qualquer config ativa no sistema
  if (!configs || configs.length === 0) {
    try {
      configs = $app.findRecordsByFilter(
        'whatsapp_configs',
        'is_active = true || is_active = null',
        'last_used_at,created',
        100,
        0,
      )
    } catch (_) {}
  }

  return configs || []
}

function sendWithRotation(options) {
  const userId = options.userId
  const rawPhone = options.phone
  const message = options.message
  const specificInstance = options.instanceId
  const requestedConfigId = options.configId

  const phone = normalizePhone(rawPhone)
  if (!phone || phone.length < 12) {
    return {
      success: false,
      error: 'Telefone inválido para envio (esperado formato brasileiro 55+DDD+9 dígitos)',
      statusCode: 400,
    }
  }
  if (!message || !message.trim()) {
    return {
      success: false,
      error: 'Mensagem vazia',
      statusCode: 400,
    }
  }

  const allConfigs = getActiveConfigsForUser(userId)
  let candidateConfigs = []

  if (requestedConfigId) {
    candidateConfigs = allConfigs.filter((c) => c.id === requestedConfigId)
  } else if (specificInstance) {
    candidateConfigs = allConfigs.filter((c) => {
      const ids = (c.getString('instance_id') || '').split(',').map((s) => s.trim())
      return ids.includes(specificInstance)
    })
  }

  if (candidateConfigs.length === 0) {
    candidateConfigs = allConfigs.slice()
  }

  // Se mesmo assim não houver configs no banco, usa fallback com segredos
  if (candidateConfigs.length === 0) {
    const apiUrl = ($secrets.get('EVOLUTION_API_URL') || DEFAULT_API_URL).replace(/\/$/, '')
    const token = $secrets.get('EVOLUTION_API_KEY') || DEFAULT_API_KEY
    const instance = specificInstance || DEFAULT_INSTANCE

    const res = sendDirectEvolution(apiUrl, token, instance, phone, message)
    return {
      success: res.success,
      instance: instance,
      label: 'Instância Padrão',
      statusCode: res.statusCode,
      error: res.error,
      data: res.data,
    }
  }

  // Ordena candidateConfigs pelo last_used_at asc (ROUND-ROBIN circular justo: o menos recentemente usado vai primeiro)
  candidateConfigs.sort((a, b) => {
    const timeA = a.getString('last_used_at') ? new Date(a.getString('last_used_at')).getTime() : 0
    const timeB = b.getString('last_used_at') ? new Date(b.getString('last_used_at')).getTime() : 0
    return timeA - timeB
  })

  let lastError = null
  let attempts = 0

  for (let i = 0; i < candidateConfigs.length; i++) {
    const cfg = candidateConfigs[i]
    let apiUrl = (
      cfg.getString('api_url') ||
      $secrets.get('EVOLUTION_API_URL') ||
      DEFAULT_API_URL
    ).replace(/\/$/, '')
    let token = cfg.getString('token') || $secrets.get('EVOLUTION_API_KEY') || DEFAULT_API_KEY
    const rawInstance = cfg.getString('instance_id') || DEFAULT_INSTANCE
    const instanceList = rawInstance
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s)
    const targetInstance = instanceList[0] || DEFAULT_INSTANCE
    const label = cfg.getString('label') || targetInstance
    const throttleSec = cfg.getInt('throttle_interval_sec') || DEFAULT_THROTTLE_SEC

    // Anti-banimento (throttle): verifica se o intervalo mínimo foi respeitado
    const lastUsedStr = cfg.getString('last_used_at')
    if (lastUsedStr) {
      const lastUsedTime = new Date(lastUsedStr).getTime()
      const now = Date.now()
      const elapsedSec = (now - lastUsedTime) / 1000
      if (elapsedSec < throttleSec) {
        const waitMs = Math.min(Math.ceil((throttleSec - elapsedSec) * 1000), 10000)
        // Se temos múltiplas instâncias candidatas e esta acabou de disparar, pula para a próxima no rodízio
        if (candidateConfigs.length > 1 && elapsedSec < Math.max(3, throttleSec / 2)) {
          continue
        }
        // Se é a única ou precisa esperar um pouco, espera o throttle com busy wait
        const sleepStart = Date.now()
        while (Date.now() - sleepStart < waitMs) {
          // busy wait seguro
        }
      }
    }

    attempts++
    const sendRes = sendDirectEvolution(apiUrl, token, targetInstance, phone, message)

    if (sendRes.success) {
      // Atualiza last_used_at da configuração vencedora para avançar o round-robin
      try {
        const recToUpdate = $app.findRecordById('whatsapp_configs', cfg.id)
        recToUpdate.set('last_used_at', new Date().toISOString())
        $app.saveNoValidate(recToUpdate)
      } catch (saveErr) {
        $app
          .logger()
          .error('Falha ao atualizar last_used_at em whatsapp_configs', 'err', String(saveErr))
      }

      return {
        success: true,
        instance: targetInstance,
        label: label,
        configId: cfg.id,
        phone: phone,
        statusCode: sendRes.statusCode,
        data: sendRes.data,
      }
    } else {
      lastError = sendRes.error || `Status ${sendRes.statusCode}`
      $app
        .logger()
        .warn(
          'Falha ao disparar pelo número/instância ' + targetInstance + ', tentando próxima...',
          'error',
          lastError,
        )
      // Continua o loop para a próxima instância em rodízio (failover automático)
    }
  }

  return {
    success: false,
    error: `Todas as ${attempts} instâncias ativas falharam. Último erro: ${lastError}`,
    statusCode: 500,
  }
}

function sendDirectEvolution(apiUrl, token, instance, phone, message) {
  const humanDelay = Math.floor(Math.random() * 2000) + 1000 // 1000ms a 3000ms
  const endpoint = `${apiUrl}/message/sendText/${instance}`

  try {
    const res = $http.send({
      url: endpoint,
      method: 'POST',
      headers: {
        apikey: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: phone,
        options: {
          delay: humanDelay,
          presence: 'composing',
        },
        textMessage: { text: message },
      }),
      timeout: 15,
    })

    if (res.statusCode === 200 || res.statusCode === 201) {
      return { success: true, statusCode: res.statusCode, data: res.json }
    } else {
      let errMsg = `Status ${res.statusCode}`
      try {
        if (res.json && (res.json.message || res.json.error)) {
          errMsg = res.json.message || res.json.error
        }
      } catch (_) {}
      return { success: false, statusCode: res.statusCode, error: errMsg, data: res.json }
    }
  } catch (err) {
    return { success: false, statusCode: 500, error: String(err) }
  }
}

// Expõe no escopo global do PocketBase
$whatsappRotator = {
  sendWithRotation: sendWithRotation,
  getActiveConfigsForUser: getActiveConfigsForUser,
  normalizePhone: normalizePhone,
}
