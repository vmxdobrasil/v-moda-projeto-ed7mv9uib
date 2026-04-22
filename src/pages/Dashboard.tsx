import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between rounded-xl bg-card p-6 shadow-sm border">
          <h1 className="text-2xl font-bold tracking-tight">V MODA - Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </header>

        <main className="rounded-xl bg-card p-6 shadow-sm border">
          <h2 className="mb-2 text-xl font-semibold">
            Bem-vindo, {user?.name || user?.email || 'Usuário'}
          </h2>
          <p className="text-muted-foreground">
            Você está conectado com sucesso e pronto para gerenciar suas operações.
          </p>
        </main>
      </div>
    </div>
  )
}
