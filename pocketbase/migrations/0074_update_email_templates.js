migrate(
  (app) => {
    let logoUrl = 'https://vmoda.goskip.app/og-image.png' // Fallback
    try {
      const record = app.findFirstRecordByData('brand_settings', 'key', 'brand_logo')
      if (record && record.getString('value_file')) {
        const instanceUrl = $secrets.get('PB_INSTANCE_URL') || 'https://vmoda.goskip.app'
        logoUrl = `${instanceUrl}/api/files/brand_settings/${record.id}/${record.getString('value_file')}`
      }
    } catch (e) {
      // Graceful fallback if brand setting isn't found
    }

    const primaryColor = '#ff6b00'

    const verificationHtml = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Arial,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f9f9f9;padding:40px 0;">
        <tr><td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <tr><td align="center" style="padding:40px 20px;border-bottom:1px solid #eeeeee;">
              <img src="${logoUrl}" alt="V Moda Brasil" width="280" style="display:block;max-width:100%;height:auto;" />
            </td></tr>
            <tr><td style="padding:40px 30px;color:#333333;font-size:16px;line-height:1.6;">
              <h2 style="margin-top:0;color:#111111;">Verifique seu E-mail</h2>
              <p>Olá,</p>
              <p>Obrigado por se cadastrar na V Moda Brasil. Por favor, clique no botão abaixo para verificar seu endereço de e-mail e ativar sua conta.</p>
              <div style="text-align:center;margin:30px 0;">
                <a href="{ACTION_URL}" style="display:inline-block;padding:14px 30px;background-color:${primaryColor};color:#ffffff;text-decoration:none;font-weight:bold;border-radius:4px;text-transform:uppercase;letter-spacing:1px;">Verificar E-mail</a>
              </div>
              <p>Se você não criou uma conta, pode ignorar este e-mail com segurança.</p>
              <p>Atenciosamente,<br/>Equipe V Moda Brasil</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `

    const resetHtml = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Arial,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f9f9f9;padding:40px 0;">
        <tr><td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <tr><td align="center" style="padding:40px 20px;border-bottom:1px solid #eeeeee;">
              <img src="${logoUrl}" alt="V Moda Brasil" width="280" style="display:block;max-width:100%;height:auto;" />
            </td></tr>
            <tr><td style="padding:40px 30px;color:#333333;font-size:16px;line-height:1.6;">
              <h2 style="margin-top:0;color:#111111;">Recuperação de Senha</h2>
              <p>Olá,</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta na V Moda Brasil. Clique no botão abaixo para criar uma nova senha.</p>
              <div style="text-align:center;margin:30px 0;">
                <a href="{ACTION_URL}" style="display:inline-block;padding:14px 30px;background-color:${primaryColor};color:#ffffff;text-decoration:none;font-weight:bold;border-radius:4px;text-transform:uppercase;letter-spacing:1px;">Redefinir Senha</a>
              </div>
              <p>Se você não solicitou a redefinição, pode ignorar este e-mail com segurança. Sua senha permanecerá a mesma.</p>
              <p>Atenciosamente,<br/>Equipe V Moda Brasil</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `

    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    app
      .db()
      .newQuery(`
    UPDATE _collections 
    SET options = json_set(
      options, 
      '$.verificationTemplate.body', {:verificationBody},
      '$.resetPasswordTemplate.body', {:resetBody}
    )
    WHERE id = {:id}
  `)
      .bind({
        id: col.id,
        verificationBody: verificationHtml,
        resetBody: resetHtml,
      })
      .execute()
  },
  (app) => {
    // Revert intentionally omitted to prevent wiping user custom configurations
  },
)
