import { useState, useEffect } from 'react'
import { Sparkles, Upload, Save, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function FashionistaProfile() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setCity(user.city || '')
      setState(user.state || '')
      if (user.avatar) {
        setAvatarPreview(
          `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`,
        )
      }
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data: Record<string, unknown> = {
        name,
        city,
        address: `${city}, ${state}`,
      }
      if (avatarFile) {
        const formData = new FormData()
        Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)))
        formData.append('avatar', avatarFile)
        await pb.collection('users').update(user.id, formData)
      } else {
        await pb.collection('users').update(user.id, data)
      }
      toast({ title: 'Perfil atualizado!', description: 'Suas informações foram salvas.' })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: err.message || 'Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-display font-bold">Meu Perfil</h1>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-muted border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-10 h-10 text-muted-foreground/40" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 cursor-pointer bg-primary text-white rounded-full p-2 shadow-soft hover:bg-primary/90 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Clique para alterar sua foto</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>

          {user?.email && (
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user.email} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-electric hover:bg-electric/90 text-white h-12 font-semibold gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
