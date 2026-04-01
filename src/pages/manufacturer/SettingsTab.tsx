import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useManufacturerStore } from '@/stores/useManufacturerStore'

export function SettingsTab({ manufacturerId }: { manufacturerId: string }) {
  const { manufacturers, updateVmp, updateMessage } = useManufacturerStore()
  const { toast } = useToast()

  const manufacturer = manufacturers.find((m) => m.id === manufacturerId)

  const [vmp, setVmp] = useState(manufacturer?.vmp?.toString() || '0')
  const [message, setMessage] = useState(manufacturer?.wholesaleMessage || '')

  useEffect(() => {
    if (manufacturer) {
      setVmp(manufacturer.vmp.toString())
      setMessage(manufacturer.wholesaleMessage || '')
    }
  }, [manufacturer])

  const handleSave = () => {
    const numVmp = parseInt(vmp, 10)
    if (isNaN(numVmp) || numVmp < 0) {
      toast({
        title: 'Valor inválido',
        description: 'Insira um VMP válido.',
        variant: 'destructive',
      })
      return
    }
    updateVmp(manufacturerId, numVmp)
    updateMessage(manufacturerId, message)
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações foram atualizadas com sucesso.',
    })
  }

  return (
    <Card className="animate-in fade-in zoom-in-95 duration-300">
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
            className="max-w-xs"
          />
          <p className="text-sm text-muted-foreground">
            Quantidade mínima de peças para finalizar pedido de atacado.
          </p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="message" className="text-base font-semibold">
            Mensagem de Atacado Personalizada
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Pedidos abaixo de 10 peças levam +2 dias para envio."
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Esta mensagem aparecerá no carrinho para os clientes lojistas.
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t px-6 py-4">
        <Button onClick={handleSave} className="ml-auto">
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  )
}
