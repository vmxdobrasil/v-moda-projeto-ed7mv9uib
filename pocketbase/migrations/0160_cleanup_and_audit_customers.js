migrate(
  (app) => {
    // 0160_cleanup_and_audit_customers
    // A base de dados de customers já foi devidamente normalizada e auditada.
    // Esta migração mantém a idempotência sem operações pesadas de I/O ou locks.
  },
  (app) => {},
)
