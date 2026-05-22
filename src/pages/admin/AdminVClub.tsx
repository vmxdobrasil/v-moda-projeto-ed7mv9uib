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
import { CreditCard, CheckCircle } from 'lucide-react'

export default function AdminVClub() {
  const [settings, setSettings] = useState<any[]>([])
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [sets, mfs] = await Promise.all([
        pb.collection('v_club_settings').getFullList({ expand: 'store' }),
        pb.collection('users').getFullList({ filter: 'role = "manufacturer"' }),
      ])
      setSettings(sets)
      setManufacturers(mfs)
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
        is_active: false,
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

      <Card>
        <CardHeader>
          <CardTitle>Lojas com V Club</CardTitle>
          <CardDescription>
            Ative a funcionalidade para fabricantes e configure a taxa da plataforma.
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
                          Ativar V Club
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
