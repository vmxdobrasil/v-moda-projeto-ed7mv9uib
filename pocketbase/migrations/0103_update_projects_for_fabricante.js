/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')

    if (!projects.fields.getByName('embedding')) {
      projects.fields.add(new JSONField({ name: 'embedding' }))
    }
    if (!projects.fields.getByName('colors')) {
      projects.fields.add(new TextField({ name: 'colors' }))
    }
    if (!projects.fields.getByName('sizes')) {
      projects.fields.add(new TextField({ name: 'sizes' }))
    }
    if (!projects.fields.getByName('is_seasonal')) {
      projects.fields.add(new BoolField({ name: 'is_seasonal' }))
    }
    if (!projects.fields.getByName('gallery')) {
      projects.fields.add(
        new FileField({
          name: 'gallery',
          maxSelect: 4,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }

    app.save(projects)
  },
  (app) => {
    const projects = app.findCollectionByNameOrId('projects')
    projects.fields.removeByName('embedding')
    projects.fields.removeByName('colors')
    projects.fields.removeByName('sizes')
    projects.fields.removeByName('is_seasonal')
    projects.fields.removeByName('gallery')
    app.save(projects)
  },
)
