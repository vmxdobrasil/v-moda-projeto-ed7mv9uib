import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { CreditCard, Store } from 'lucide-react'

export default function AdminVClub() {
  const [manufacturers] = useState([
    { id: '1', name: 'Marca A', isActive: true, commission: 0.5 },
    { id: '2', name: 'Marca B', isActive: false, commission: 0.025 },
  ])

  const handleSave = () => {
    toast.success('Configurações do V CLUB atualizadas com sucesso.')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão V CLUB CARD</h1>
        <p className="text-muted-foreground mt-2">
          Ative o Private Label para fabricantes e defina comissões exclusivas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle>Fabricantes e Taxas (0.025% a 1%)</CardTitle>
          </div>
          <CardDescription>
            Controle quem tem acesso ao cartão da marca e o markup da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fabricante</TableHead>
                <TableHead>Status Private Label</TableHead>
                <TableHead>Comissão Específica (%)</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manufacturers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked={m.isActive} />
                      <Label>{m.isActive ? 'Ativo' : 'Inativo'}</Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={m.commission}
                      step="0.001"
                      min="0.025"
                      max="1"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      Salvar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Visão Geral de Cartões Emitidos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="text-4xl font-bold text-primary">342</div>
              <div className="text-sm text-muted-foreground mt-1">Cartões Virtuais (Ativos)</div>
            </div>
            <div className="flex-1 rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="text-4xl font-bold">89</div>
              <div className="text-sm text-muted-foreground mt-1">Cartões Físicos (Enviados)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
