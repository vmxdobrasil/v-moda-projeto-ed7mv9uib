import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">V MODA</CardTitle>
          <CardDescription>Painel Principal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-secondary/50 p-6 text-center shadow-inner">
            <p className="text-sm text-muted-foreground mb-1">Você está logado como:</p>
            <p className="text-lg font-medium">{user?.email}</p>
          </div>

          <Button onClick={signOut} variant="destructive" className="w-full font-medium">
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
