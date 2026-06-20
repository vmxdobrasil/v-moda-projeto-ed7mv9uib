import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { RecordModel } from 'pocketbase'

export default function AdminTopBrands() {
  const [brands, setBrands] = useState<RecordModel[]>([])
  const { toast } = useToast()

  const loadBrands = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        filter: 'ranking_position > 0',
        sort: 'ranking_position',
      })
      setBrands(records)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  const updateBrand = async (id: string, data: any) => {
    try {
      await pb.collection('customers').update(id, data)
      toast({ title: 'Marca atualizada com sucesso' })
      loadBrands()
    } catch (error) {
      toast({ title: 'Erro ao atualizar marca', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Top 60 Marcas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Exclusiva</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={brand.ranking_category || ''}
                      onValueChange={(val) => updateBrand(brand.id, { ranking_category: val })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
                        <SelectItem value="jeans">Jeans</SelectItem>
                        <SelectItem value="moda_praia">Moda Praia</SelectItem>
                        <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="w-20"
                      defaultValue={brand.ranking_position}
                      onBlur={(e) =>
                        updateBrand(brand.id, { ranking_position: parseInt(e.target.value) })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={brand.is_exclusive}
                      onCheckedChange={(checked) =>
                        updateBrand(brand.id, { is_exclusive: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateBrand(brand.id, { ranking_position: 0 })}
                    >
                      Remover do Top
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
