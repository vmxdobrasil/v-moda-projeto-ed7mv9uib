migrate(
  (app) => {
    app.db().newQuery("UPDATE users SET commission_rate = 2 WHERE role = 'affiliate'").execute()
  },
  (app) => {
    app.db().newQuery("UPDATE users SET commission_rate = NULL WHERE role = 'affiliate'").execute()
  },
)
