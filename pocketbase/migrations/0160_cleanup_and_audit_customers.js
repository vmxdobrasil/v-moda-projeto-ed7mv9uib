migrate(
  (app) => {
    // 1. Remoção de Placeholders:
    // Excluir registros onde name começa com "Top Feminina" E os campos phone e email estão vazios ou nulos.
    app.db().newQuery("DELETE FROM customers WHERE (name LIKE 'Top Feminina%' OR name = 'Top Feminina') AND (phone IS NULL OR phone = '') AND (email IS NULL OR email = '')").execute()

    // 2. Correção de Nomes "FALSE":
    // Para registros onde name é exatamente "FALSE", alterar para "Lead WhatsApp [últimos 4 dígitos do phone]"
    app.db().newQuery("UPDATE customers SET name = 'Lead WhatsApp ' || CASE WHEN LENGTH(phone) >= 4 THEN SUBSTR(phone, -4) WHEN LENGTH(phone) > 0 THEN phone ELSE '0000' END WHERE UPPER(TRIM(name)) = 'FALSE'").execute()

    // 3. Limpeza de Telefones:
    // Remover caracteres não numéricos comuns do phone
    app.db().newQuery("UPDATE customers SET phone = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', ''), '.', '') WHERE phone IS NOT NULL AND (phone LIKE '% %' OR phone LIKE '%-%' OR phone LIKE '%(%' OR phone LIKE '%)%' OR phone LIKE '%+%' OR phone LIKE '%.%')").execute()
  },
  (app) => {}
)
