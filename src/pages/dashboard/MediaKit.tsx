import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Image as ImageIcon } from 'lucide-react'

export default function MediaKit() {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const records = await pb.collection('projects').getFullList({
          expand: 'manufacturer',
          sort: '-created',
        })
        setProjects(records)
      } catch (e) {
        console.error('Error fetching projects:', e)
      }
    }
    fetchProjects()
  }, [])

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error downloading image', error)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-serif font-bold">Media Kit</h1>
        <p className="text-muted-foreground">
          Materiais de marketing disponibilizados pelos fabricantes para suas campanhas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden flex flex-col group">
            <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
              {project.image ? (
                <img
                  src={pb.files.getUrl(project, project.image)}
                  alt={project.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
            <CardHeader className="p-4 pb-2 flex-grow">
              <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-1">
                Por:{' '}
                {project.expand?.manufacturer?.name ||
                  project.expand?.manufacturer?.email ||
                  'Desconhecido'}
              </p>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  handleDownload(
                    pb.files.getUrl(project, project.image),
                    `${project.name.replace(/\s+/g, '_')}.jpg`,
                  )
                }
                disabled={!project.image}
              >
                <Download className="w-4 h-4 mr-2" /> Baixar
              </Button>
            </CardFooter>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
            Nenhum material disponível no momento.
          </div>
        )}
      </div>
    </div>
  )
}
