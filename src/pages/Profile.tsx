import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { LogOut, User } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function Profile() {
  const { user, isAuthenticated, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (user) {
      form.reset({
        name: user.name,
        email: user.email,
      })
    }
  }, [isAuthenticated, navigate, user, form])

  function onSubmit(data: ProfileForm) {
    setIsLoading(true)

    setTimeout(() => {
      updateUser(data)
      setIsEditing(false)
      setIsLoading(false)

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
    }, 1000)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="container max-w-3xl mx-auto py-24 md:py-32">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-secondary/30 p-6 rounded-lg flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
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

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-serif">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações pessoais e de contato.
            </p>
          </div>

          <div className="bg-white border p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">Informações Pessoais</h3>
              {!isEditing && (
                <Button variant="ghost" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} className="rounded-none" />
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
                          <Input {...field} disabled={!isEditing} className="rounded-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="rounded-none h-11 uppercase tracking-widest px-8"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-none h-11 uppercase tracking-widest px-8"
                      onClick={() => {
                        setIsEditing(false)
                        form.reset()
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
