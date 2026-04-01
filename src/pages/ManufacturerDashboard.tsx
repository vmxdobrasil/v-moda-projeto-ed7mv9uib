import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { useManufacturerStore } from '@/stores/useManufacturerStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Package } from 'lucide-react'

export default function ManufacturerDashboard() {
  const { user } = useAuthStore()
  const { manufacturers, updateVmp } = useManufacturerStore()
  const { toast } = useToast()

  // Fallback to 'm1' if manufacturerId is not set for demo purposes
  const mId = user?.manufacturerId || 'm1'
  const manufacturer = manufacturers.find((m) => m.id === mId)

  const [vmp, setVmp] = useState(manufacturer?.vmp?.toString() || '0')

  // Update local state if manufacturer data changes externally
  useEffect(() => {
    if (manufacturer) {
      setVmp(manufacturer.vmp.toString())
    }
  }, [manufacturer])

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect if not a manufacturer
  if (user.type !== 'Lojista Fabricante') {
    return <Navigate to="/" replace />
  }

  const handleSave = () => {
    const numVmp = parseInt(vmp, 10)

    if (isNaN(numVmp) || numVmp < 0) {
      toast({
        title: 'Valor inválido',
        description: 'Por favor, insira um número válido e positivo para o VMP.',
        variant: 'destructive',
      })
      return
    }

    updateVmp(mId, numVmp)

    toast({
      title: 'Configurações salvas',
      description: `O VMP para ${manufacturer?.name || 'sua loja'} foi atualizado para ${numVmp} peças com sucesso.`,
    })
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Fabricante</h1>
          <p className="text-muted-foreground">Gerencie as configurações da sua marca</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Atacado</CardTitle>
          <CardDescription>
            Defina as regras de negócio para compras no atacado dos seus produtos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="vmp" className="text-base font-semibold">
              Volume Mínimo de Peças (VMP)
            </Label>
            <Input
              id="vmp"
              type="number"
              min="1"
              value={vmp}
              onChange={(e) => setVmp(e.target.value)}
              placeholder="Ex: 12"
              className="max-w-xs text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Esta é a quantidade mínima de peças que um cliente lojista (Atacado) precisa adicionar
              ao carrinho dos produtos da sua marca para conseguir finalizar o pedido.
            </p>
          </div>

          {manufacturer && (
            <div className="bg-muted p-4 rounded-lg border">
              <p className="text-sm font-medium">Resumo Atual:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sua marca <strong>{manufacturer.name}</strong> está exigindo um mínimo de{' '}
                <strong>{manufacturer.vmp}</strong> peças por pedido de atacado.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 border-t px-6 py-4 mt-6">
          <Button onClick={handleSave} className="w-full sm:w-auto ml-auto">
            Salvar Configurações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
