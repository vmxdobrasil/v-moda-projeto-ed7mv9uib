import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { LogOut, User, Upload } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Label } from '@/components/ui/label'

const HUB_OPTIONS = [
  { id: '44_goiania', label: 'Região da 44 (Goiânia)' },
  { id: 'fama_goiania', label: 'Setor Fama (Goiânia)' },
  { id: 'bras_sp', label: 'Brás (São Paulo)' },
  { id: 'bom_retiro_sp', label: 'Bom Retiro (São Paulo)' },
  { id: 'outros', label: 'Outros Polos' },
]

const profileSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  is_transporter: z.boolean().optional(),
  operating_regions: z.string().optional(),
  fashion_hubs: z.array(z.string()).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function Profile() {
  const { user, isAuthenticated, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      is_transporter: user?.is_transporter || false,
      operating_regions: user?.operating_regions || '',
      fashion_hubs: user?.fashion_hubs || [],
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        is_transporter: user.is_transporter || false,
        operating_regions: user.operating_regions || '',
        fashion_hubs: user.fashion_hubs || [],
      })
      if (user.avatar) {
        setAvatarPreview(pb.files.getUrl(user, user.avatar))
      }
    }
  }, [isAuthenticated, navigate, user, form])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function onSubmit(data: ProfileForm) {
    if (!user) return
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)

      if (user.role === 'affiliate') {
        formData.append('is_transporter', data.is_transporter ? 'true' : 'false')
        formData.append('operating_regions', data.operating_regions || '')
        if (data.fashion_hubs && data.fashion_hubs.length > 0) {
          data.fashion_hubs.forEach((hub) => formData.append('fashion_hubs', hub))
        } else {
          formData.append('fashion_hubs', '')
        }
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const updatedRecord = await pb.collection('users').update(user.id, formData)
      updateUser(updatedRecord)

      setIsEditing(false)
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro ao salvar suas informações.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="container max-w-3xl mx-auto py-24 md:py-32">
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-secondary/30 p-6 rounded-lg flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>

            {isEditing && (
              <div className="w-full">
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer w-full flex items-center justify-center gap-2 bg-secondary/50 px-3 py-2 rounded text-sm hover:bg-secondary transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Foto (Máx 2MB)
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            )}

            {!isEditing && (
              <div>
                <h2 className="font-serif text-xl">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4 flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </Button>
          </div>
        </aside>

        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-serif">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações pessoais e de contato.
            </p>
          </div>

          <div className="bg-white border p-6 md:p-8 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">Informações Pessoais</h3>
              {!isEditing && (
                <Button variant="ghost" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} className="rounded-md" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} className="rounded-md" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user.role === 'affiliate' && (
                    <>
                      <div className="col-span-1 md:col-span-2 pt-4 mt-2 border-t">
                        <h3 className="text-lg font-medium mb-4">
                          Guia de Compras & Transportador
                        </h3>
                        <FormField
                          control={form.control}
                          name="is_transporter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Atuo como Guia de Compras / Transportador
                                </FormLabel>
                                <FormDescription>
                                  Ative se você organiza excursões e faz o transporte de mercadorias
                                  para as sacoleiras via Ônibus.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!isEditing}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch('is_transporter') && (
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="operating_regions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Regiões de Atuação (Origem)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditing}
                                    placeholder="Ex: Interior de SP, Sul de Minas..."
                                  />
                                </FormControl>
                                <FormDescription>
                                  De onde você traz suas sacoleiras?
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="fashion_hubs"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">
                                    Polos de Moda que Visita
                                  </FormLabel>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {HUB_OPTIONS.map((item) => (
                                    <FormField
                                      key={item.id}
                                      control={form.control}
                                      name="fashion_hubs"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([
                                                        ...(field.value || []),
                                                        item.id,
                                                      ])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== item.id,
                                                        ),
                                                      )
                                                }}
                                                disabled={!isEditing}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm leading-none">
                                              {item.label}
                                            </FormLabel>
                                          </FormItem>
                                        )
                                      }}
                                    />
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="rounded-md h-11 uppercase tracking-widest px-8"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-md h-11 uppercase tracking-widest px-8"
                      onClick={() => {
                        setIsEditing(false)
                        form.reset()
                        setAvatarFile(null)
                        if (user?.avatar) {
                          setAvatarPreview(pb.files.getUrl(user, user.avatar))
                        } else {
                          setAvatarPreview(null)
                        }
                      }}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
