import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Plus, ArrowRight } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ManufacturersHub() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'manufacturer') {
      navigate('/manufacturer')
      return
    }

    const loadManufacturers = async () => {
      try {
        const records = await pb.collection('users').getFullList({
          filter: 'role = "manufacturer"',
          sort: '-created',
        })
        setManufacturers(records)
      } catch (err) {
        console.error('Error loading manufacturers', err)
      } finally {
        setLoading(false)
      }
    }

    loadManufacturers()
  }, [user, navigate])

  if (user?.role === 'manufacturer') {
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fabricantes</h2>
          <p className="text-muted-foreground">Gerencie as marcas e fabricantes da plataforma.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Fabricante
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {manufacturers.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhum fabricante encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            manufacturers.map((m) => (
              <Card key={m.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={pb.files.getUrl(m, m.avatar)} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {m.name?.substring(0, 2).toUpperCase() || 'FB'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{m.name || 'Sem nome'}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate">{m.email}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">
                      {m.is_verified ? 'Verificado' : 'Pendente'}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Gerenciar <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
