import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, CheckCircle, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react'
import { formatPrice } from '@/lib/data'

export default function AdminVClub() {
  const [settings, setSettings] = useState<any[]>([])
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [refunds, setRefunds] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCredit: 0,
    totalUsed: 0,
    totalCashback: 0,
    delinquencyScore: 1.2,
  })
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [sets, mfs, cards, cbs, refTxs] = await Promise.all([
        pb.collection('v_club_settings').getFullList({ expand: 'store' }),
        pb.collection('users').getFullList({ filter: 'role = "manufacturer"' }),
        pb.collection('v_club_cards').getFullList(),
        pb.collection('v_club_cashback').getFullList(),
        pb
          .collection('v_club_transactions')
          .getFullList({
            filter: "status = 'refunded'",
            expand: 'store,card.customer',
            sort: '-updated',
          }),
      ])

      setSettings(sets)
      setManufacturers(mfs)
      setRefunds(refTxs)

      const totalCredit = cards.reduce((acc, c) => acc + c.credit_limit, 0)
      const totalAvailable = cards.reduce((acc, c) => acc + c.available_limit, 0)
      const totalCashback = cbs.reduce((acc, c) => acc + c.balance, 0)

      setStats({
        totalCredit,
        totalUsed: totalCredit - totalAvailable,
        totalCashback,
        delinquencyScore: 1.2, // Simulated Global Delinquency Score
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSettings = async (storeId: string) => {
    const existing = settings.find((s) => s.store === storeId)
    if (existing) return

    const identifier = Math.floor(1000 + Math.random() * 9000).toString()

    try {
      await pb.collection('v_club_settings').create({
        store: storeId,
        is_active: true,
        platform_commission_rate: 1.0,
        store_cashback_rate: 0,
        store_identifier: identifier,
      })
      toast({ description: 'V Club ativado para a loja com sucesso.' })
      loadData()
    } catch (e) {
      toast({ description: 'Erro ao ativar V Club.', variant: 'destructive' })
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await pb.collection('v_club_settings').update(id, { is_active: !current })
      loadData()
    } catch (e) {
      toast({ description: 'Erro ao atualizar status.', variant: 'destructive' })
    }
  }

  const handleUpdateCommission = async (
    id: string,
    rate: string,
    storeId: string,
    previousRate: number,
  ) => {
    try {
      const num = parseFloat(rate)
      if (isNaN(num) || num < 0.025 || num > 1) {
        toast({ description: 'A taxa deve ser entre 0.025% e 1%', variant: 'destructive' })
        return
      }
      await pb.collection('v_club_settings').update(id, { platform_commission_rate: num })

      const adminId = pb.authStore.record?.id
      if (adminId && num !== previousRate) {
        await pb.collection('commission_audit_logs').create({
          admin_user: adminId,
          target_partner: storeId,
          previous_rate: previousRate,
          new_rate: num,
        })
      }

      toast({ description: 'Taxa da plataforma atualizada.' })
      loadData()
    } catch (e) {
      toast({ description: 'Erro ao atualizar taxa.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-primary" /> V Club Master Control
        </h2>
        <p className="text-muted-foreground">
          Gerencie as lojas autorizadas para emitir o Private Label V Club Card. (BIN Oficial:
          636943)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-primary" /> Total Crédito Concedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalCredit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4 text-amber-500" /> Crédito Utilizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatPrice(stats.totalUsed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" /> Cashback Acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.totalCashback)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Inadimplência Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.delinquencyScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auditoria de Estornos</CardTitle>
          <CardDescription>
            Acompanhe todos os estornos realizados pelas lojas na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transação (ID)</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data do Estorno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    Nenhum estorno registrado.
                  </TableCell>
                </TableRow>
              ) : (
                refunds.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                    <TableCell>{tx.expand?.store?.name || 'Desconhecida'}</TableCell>
                    <TableCell>
                      {tx.expand?.card?.expand?.customer?.name || 'Desconhecido'}
                    </TableCell>
                    <TableCell className="font-medium text-destructive">
                      {formatPrice(tx.amount)}
                    </TableCell>
                    <TableCell>{new Date(tx.updated).toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homologação de Lojas</CardTitle>
          <CardDescription>
            Ative a funcionalidade para fabricantes e configure a taxa da plataforma retida via
            Asaas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loja / Fabricante</TableHead>
                <TableHead>ID (4 dígitos)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comissão Plataforma (%)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manufacturers.map((mf) => {
                const setting = settings.find((s) => s.store === mf.id)
                return (
                  <TableRow key={mf.id}>
                    <TableCell className="font-medium">{mf.name}</TableCell>
                    <TableCell>
                      {setting ? (
                        <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                          {setting.store_identifier}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {setting ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={setting.is_active}
                            onCheckedChange={() =>
                              handleToggleActive(setting.id, setting.is_active)
                            }
                          />
                          <span className="text-sm">{setting.is_active ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Não Configurado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {setting ? (
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.025"
                            max="1"
                            defaultValue={setting.platform_commission_rate}
                            onBlur={(e) =>
                              handleUpdateCommission(
                                setting.id,
                                e.target.value,
                                mf.id,
                                setting.platform_commission_rate,
                              )
                            }
                          />
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!setting ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateSettings(mf.id)}
                        >
                          Aprovar V Club
                        </Button>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
