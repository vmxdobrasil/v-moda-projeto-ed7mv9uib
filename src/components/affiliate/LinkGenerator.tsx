import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Copy, Trash2, Link2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getLinks, createLink, deleteLink, type LinkRastreio } from '@/services/links-rastreio'
import { useRealtime } from '@/hooks/use-realtime'

function generateShortCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function LinkGenerator({ affiliateCode }: { affiliateCode: string }) {
  const { toast } = useToast()
  const [links, setLinks] = useState<LinkRastreio[]>([])
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const loadLinks = async () => {
    try {
      const data = await getLinks()
      setLinks(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadLinks()
  }, [])

  useRealtime('links_rastreio', () => loadLinks())

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !url) return
    setLoading(true)
    try {
      const shortCode = generateShortCode()
      await createLink({ name, original_url: url, short_code: shortCode })
      setName('')
      setUrl('')
      toast({ title: 'Link criado com sucesso!' })
      loadLinks()
    } catch (err: any) {
      toast({ title: 'Erro ao criar link', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const buildAffiliateUrl = (originalUrl: string, shortCode: string) => {
    const separator = originalUrl.includes('?') ? '&' : '?'
    return `${originalUrl}${separator}ref=${affiliateCode}&short=${shortCode}`
  }

  const copyLink = (link: LinkRastreio) => {
    const fullUrl = buildAffiliateUrl(link.original_url, link.short_code)
    navigator.clipboard.writeText(fullUrl)
    toast({ title: 'Link copiado!' })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(id)
      toast({ title: 'Link removido' })
      loadLinks()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Gerar Novo Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="link-name">Nome do Link</Label>
              <Input
                id="link-name"
                placeholder="Ex: Produto Destaque, TOP 100..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL de Destino</Label>
              <Input
                id="link-url"
                placeholder="https://vmodabrasil.goskip.app/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-electric hover:bg-electric/90 text-electric-foreground"
              disabled={loading}
            >
              {loading ? 'Gerando...' : 'Gerar meu Link'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" /> Meus Links ({links.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Cliques</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Nenhum link criado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.name}</TableCell>
                    <TableCell className="text-center">{link.clicks || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => copyLink(link)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(link.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
