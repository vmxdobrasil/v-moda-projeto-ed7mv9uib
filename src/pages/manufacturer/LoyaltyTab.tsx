import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/data'
import { Crown, Save } from 'lucide-react'

interface Reseller {
  id: string
  name: string
  quantity: number
  revenue: number
  earlyAccess: boolean
  discount: number
}

const MOCK_RESELLERS: Reseller[] = [
  {
    id: 'r1',
    name: 'Boutique Elegance',
    quantity: 145,
    revenue: 25400,
    earlyAccess: true,
    discount: 10,
  },
  { id: 'r2', name: 'Studio Moda', quantity: 82, revenue: 12800, earlyAccess: false, discount: 5 },
  {
    id: 'r3',
    name: 'Concept Store Rio',
    quantity: 210,
    revenue: 42000,
    earlyAccess: true,
    discount: 15,
  },
]

export function LoyaltyTab() {
  const { toast } = useToast()
  const [resellers, setResellers] = useState<Reseller[]>(MOCK_RESELLERS)

  const handleToggleAccess = (id: string, checked: boolean) => {
    setResellers(resellers.map((r) => (r.id === id ? { ...r, earlyAccess: checked } : r)))
    toast({
      title: checked ? 'Acesso Concedido' : 'Acesso Revogado',
      description: 'Preferências de acesso antecipado atualizadas.',
    })
  }

  const handleDiscountChange = (id: string, value: string) => {
    setResellers(resellers.map((r) => (r.id === id ? { ...r, discount: parseInt(value) || 0 } : r)))
  }

  const handleSaveDiscount = (name: string) => {
    toast({
      title: 'Desconto Atualizado',
      description: `O desconto de fidelidade para ${name} foi salvo.`,
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-serif mb-1">Programa de Fidelidade</h2>
        <p className="text-muted-foreground text-sm">
          Gerencie benefícios e descontos para seus melhores revendedores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg bg-card flex flex-col gap-2">
          <Crown className="w-5 h-5 text-accent" />
          <p className="text-sm text-muted-foreground">Total Revendedores Top</p>
          <p className="text-2xl font-semibold">3</p>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Revendedor</TableHead>
              <TableHead className="text-center">Peças Compradas</TableHead>
              <TableHead className="text-right">Receita Gerada</TableHead>
              <TableHead className="text-center">Acesso Antecipado</TableHead>
              <TableHead className="w-[180px]">Desconto Fidelidade (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resellers.map((reseller) => (
              <TableRow key={reseller.id}>
                <TableCell className="font-medium">
                  {reseller.name}
                  {reseller.revenue > 30000 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 text-[10px] h-5 bg-accent/10 text-accent hover:bg-accent/20"
                    >
                      VIP
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">{reseller.quantity}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(reseller.revenue)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={reseller.earlyAccess}
                      onCheckedChange={(c) => handleToggleAccess(reseller.id, c)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={reseller.discount}
                      onChange={(e) => handleDiscountChange(reseller.id, e.target.value)}
                      className="h-8 w-16"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleSaveDiscount(reseller.name)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
