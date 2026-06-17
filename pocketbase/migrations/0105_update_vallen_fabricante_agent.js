/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.putTools(app, 'vallen-fabricante', [
      { collection: 'projects', perms: { list: true, read: true, update: true, create: true } },
      { collection: 'customers', perms: { list: true, read: true, update: true } },
      { collection: 'v_club_settings', perms: { list: true, read: true, update: true } },
    ])
  },
  (app) => {
    $ai.agents.deleteTools(app, 'vallen-fabricante', ['v_club_settings'])
  },
)
