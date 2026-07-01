import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Store, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'

interface Unidade {
  id: string
  name: string
  type: string
  address?: string
  phone?: string
  city?: string
  state?: string
}

export function StoreManagement() {
  const { user } = useAuth()
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Unidade | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: 'factory',
    address: '',
    phone: '',
    city: '',
    state: '',
  })

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const res = await pb.collection('unidades_lojas').getFullList({
        filter: `manufacturer = "${user.id}"`,
        sort: 'name',
      })
      setUnidades(res as unknown as Unidade[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('unidades_lojas', loadData)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const data = new FormData()
      data.append('manufacturer', user.id)
      data.append('name', form.name)
      data.append('type', form.type)
      data.append('address', form.address)
      data.append('phone', form.phone)
      data.append('city', form.city)
      data.append('state', form.state)
      if (editing) {
        await pb.collection('unidades_lojas').update(editing.id, data)
        toast.success('Unidade atualizada!')
      } else {
        await pb.collection('unidades_lojas').create(data)
        toast.success('Unidade cadastrada!')
      }
      setOpen(false)
      setEditing(null)
      setForm({ name: '', type: 'factory', address: '', phone: '', city: '', state: '' })
      loadData()
    } catch {
      toast.error('Erro ao salvar unidade')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta unidade?')) return
    try {
      await pb.collection('unidades_lojas').delete(id)
      toast.success('Unidade excluída')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const openEdit = (u: Unidade) => {
    setEditing(u)
    setForm({
      name: u.name,
      type: u.type,
      address: u.address || '',
      phone: u.phone || '',
      city: u.city || '',
      state: u.state || '',
    })
    setOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">Unidades & Filiais</h1>
          <p className="text-muted-foreground">Gerencie lojas de fábrica e filiais da sua marca.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) {
              setEditing(null)
              setForm({ name: '', type: 'factory', address: '', phone: '', city: '', state: '' })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-electric hover:bg-electric/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Unidade *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ex: Loja de Fábrica - Bom Retiro"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factory">Loja de Fábrica</SelectItem>
                    <SelectItem value="branch">Filial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado (UF)</Label>
                <Input
                  value={form.state}
                  maxLength={2}
                  onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                />
              </div>
              <Button type="submit" className="w-full bg-electric hover:bg-electric/90 text-white">
                {editing ? 'Salvar' : 'Cadastrar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : unidades.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Nenhuma unidade cadastrada. Clique em "Nova Unidade" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {unidades.map((u) => (
            <Card key={u.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-navy">{u.name}</h3>
                  <span className="text-xs uppercase tracking-wider text-electric font-semibold">
                    {u.type === 'factory' ? 'Loja de Fábrica' : 'Filial'}
                  </span>
                </div>
                {u.address && (
                  <p className="text-sm text-muted-foreground flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-1 shrink-0" />
                    {u.address}
                  </p>
                )}
                {u.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {u.phone}
                  </p>
                )}
                {u.city && u.state && (
                  <p className="text-sm text-muted-foreground">
                    {u.city} - {u.state}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
