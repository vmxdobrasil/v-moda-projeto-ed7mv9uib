import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Heart,
  ShoppingBag,
  Truck,
  MapPin,
  Search,
  Star,
  ShieldCheck,
  Tag,
  Package,
  RefreshCw,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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

import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { BrandCard } from '@/components/BrandCard'
import { Button } from '@/components/ui/button'
import useCartStore from '@/stores/useCartStore'
import { toast } from 'sonner'

// Mock Data
const MOCK_ORDERS = [
  {
    id: 'TRX-98231',
    created: new Date().toISOString(),
    amount: 2350.0,
    status: 'approved',
    logistics_status: 'Em Trânsito no Ônibus',
    shipping_method: 'caravana_onibus',
    tracking_code: 'ONIBUS-GO-SP-44',
    store_name: 'Glamour Moda Feminina',
    items: [
      {
        name: 'Vestido Longo Estampado',
        price: 120,
        quantity: 10,
        image: 'https://img.usecurling.com/p/200/200?q=floral%20dress',
      },
      {
        name: 'Conjunto Alfaiataria',
        price: 230,
        quantity: 5,
        image: 'https://img.usecurling.com/p/200/200?q=womens%20suit',
      },
    ],
  },
  {
    id: 'TRX-98230',
    created: new Date(Date.now() - 5 * 86400000).toISOString(),
    amount: 890.0,
    status: 'approved',
    logistics_status: 'Entregue',
    shipping_method: 'transportadora',
    tracking_code: 'BR987654321BR',
    store_name: 'Denim Premium',
    items: [
      {
        name: 'Calça Jeans Wide Leg',
        price: 89,
        quantity: 10,
        image: 'https://img.usecurling.com/p/200/200?q=jeans',
      },
    ],
  },
]

const MOCK_BRANDS = [
  {
    id: 'mock-1',
    name: 'Arezzo',
    ranking_category: 'moda_feminina',
    is_exclusive: false,
    city: 'Goiânia',
    state: 'GO',
    is_verified: true,
    price_level: '$$',
  },
  {
    id: 'mock-2',
    name: 'Colcci',
    ranking_category: 'jeans',
    is_exclusive: true,
    city: 'São Paulo',
    state: 'SP',
    is_verified: true,
    price_level: '$$$',
  },
  {
    id: 'mock-3',
    name: 'Morena Rosa',
    ranking_category: 'moda_feminina',
    is_exclusive: false,
    city: 'Maringá',
    state: 'PR',
    is_verified: true,
    price_level: '$$',
  },
]

export default function RevendaDashboard() {
  const { user } = useAuth()

  const [favoritesCount, setFavoritesCount] = useState(0)
  const [orders, setOrders] = useState<any[]>([])
  const [myCustomers, setMyCustomers] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [fashionHubFilter, setFashionHubFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  useEffect(() => {
    if (!user) return

    Promise.all([
      // Favorites Count
      pb
        .collection('favorites')
        .getList(1, 1, { filter: `user = "${user.id}"` })
        .then((res) => setFavoritesCount(res.totalItems))
        .catch(() => {}),

      // CRM Records for the Retailer (where email or phone matches)
      (async () => {
        const phoneFilter = user.phone ? `|| phone = "${user.phone}"` : ''
        try {
          const customers = await pb.collection('customers').getFullList({
            filter: `email = "${user.email}" ${phoneFilter}`,
            expand: 'manufacturer',
          })
          setMyCustomers(customers)
        } catch {
          /* intentionally ignored */
        }
      })(),

      // Fetch Brands Catalog
      pb
        .collection('customers')
        .getList(1, 50, {
          filter: 'ranking_position > 0 || is_verified = true',
          sort: 'ranking_position',
          expand: 'category_id',
        })
        .then((res) => {
          setBrands(res.items.length > 0 ? res.items : MOCK_BRANDS)
        })
        .catch(() => setBrands(MOCK_BRANDS)),

      // Fetch Transactions/Orders
      (async () => {
        try {
          const cards = await pb
            .collection('v_club_cards')
            .getFullList({ filter: `customer.email = "${user.email}"` })
          if (cards.length > 0) {
            const filterString = cards.map((c) => `card = "${c.id}"`).join(' || ')
            const trans = await pb.collection('v_club_transactions').getFullList({
              filter: filterString,
              expand: 'store,card',
            })
            if (trans.length > 0) {
              setOrders(trans)
              return
            }
          }
          setOrders(MOCK_ORDERS)
        } catch (e) {
          setOrders(MOCK_ORDERS)
        }
      })(),
    ]).finally(() => setLoading(false))
  }, [user])

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || b.ranking_category === categoryFilter
      const matchHub = fashionHubFilter === 'all' || b.fashion_hub === fashionHubFilter
      return matchSearch && matchCategory && matchHub
    })
  }, [brands, search, categoryFilter, fashionHubFilter])

  const exclusiveBrands = useMemo(() => {
    const fromCRM = myCustomers.filter((c) => c.is_exclusive)
    if (fromCRM.length > 0) return fromCRM
    return [
      {
        id: 'exc-1',
        expand: { manufacturer: { name: 'Premium Denim' } },
        exclusivity_zone: 'Goiânia - GO',
        is_exclusive: true,
      },
    ]
  }, [myCustomers])

  const totalSpent = useMemo(() => orders.reduce((acc, o) => acc + (o.amount || 0), 0), [orders])
  const deliveriesCount = useMemo(
    () => orders.filter((o) => o.logistics_status && o.logistics_status !== 'Entregue').length,
    [orders],
  )

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-serif text-primary">
          Portal do Lojista
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcas Favoritas</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoritesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos no Mês</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Comprado</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalSpent,
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas em Andamento</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveriesCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Catálogo de Marcas</TabsTrigger>
          <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
          <TabsTrigger value="exclusivity">Minhas Exclusividades</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-lg border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar marcas..."
                className="pl-8 bg-muted/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-muted/50">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
                <SelectItem value="jeans">Jeans</SelectItem>
                <SelectItem value="moda_praia">Moda Praia</SelectItem>
                <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
                <SelectItem value="plus_size">Plus Size</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fashionHubFilter} onValueChange={setFashionHubFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-muted/50">
                <SelectValue placeholder="Polo de Moda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Polos</SelectItem>
                <SelectItem value="44_goiania">44 Goiânia</SelectItem>
                <SelectItem value="fama_goiania">Fama Goiânia</SelectItem>
                <SelectItem value="bras_sp">Brás SP</SelectItem>
                <SelectItem value="bom_retiro_sp">Bom Retiro SP</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
            {filteredBrands.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                Nenhuma marca encontrada com os filtros atuais.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pedidos</CardTitle>
              <CardDescription>Acompanhe o status e detalhes das suas compras.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Logística</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow
                      key={idx}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell className="font-medium">
                        {order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {order.created ? format(new Date(order.created), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{order.store_name || order.expand?.store?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'approved' ? 'default' : 'secondary'}>
                          {order.status || 'Processando'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {order.logistics_status || 'Aguardando'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(order.amount || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exclusivity">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exclusiveBrands.map((exc, i) => (
              <Card
                key={i}
                className="overflow-hidden relative border-primary/20 bg-gradient-to-br from-background to-primary/5"
              >
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold rounded-bl-lg flex items-center gap-1 z-10 shadow-sm uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Direito Exclusivo
                </div>
                <CardContent className="p-6 pt-8">
                  <h3 className="font-serif text-xl font-bold mb-2 text-primary">
                    {exc.expand?.manufacturer?.name || exc.manufacturer_name || 'Marca Premium'}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-4 bg-background px-3 py-1.5 rounded border">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    Região:{' '}
                    <span className="font-medium text-foreground ml-1">
                      {exc.exclusivity_zone || 'Região não definida'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Você possui direitos exclusivos de venda desta marca na sua região delimitada.
                    Quaisquer novos leads desta região serão direcionados para o seu contato.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Pedido{' '}
              <span className="text-muted-foreground font-mono text-sm ml-2">
                #{selectedOrder?.id?.slice(0, 8).toUpperCase()}
              </span>
            </DialogTitle>
            <DialogDescription>
              Realizado em{' '}
              {selectedOrder?.created &&
                format(new Date(selectedOrder.created), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Fornecedor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 font-medium">
                  {selectedOrder?.store_name || selectedOrder?.expand?.store?.name || '-'}
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Status Logístico
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm">
                  <Badge variant="outline" className="bg-background">
                    {selectedOrder?.logistics_status || 'Aguardando'}
                  </Badge>
                  {selectedOrder?.tracking_code && (
                    <div className="mt-2 text-xs font-mono bg-background p-1.5 rounded border inline-flex items-center">
                      Rastreio: {selectedOrder.tracking_code}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Produtos
              </h4>
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                {selectedOrder?.items?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 border rounded-lg bg-background shadow-sm"
                  >
                    <img
                      src={
                        item.image || `https://img.usecurling.com/p/200/200?q=clothing&seed=${i}`
                      }
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover border"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name || 'Produto'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Tag className="w-3 h-3 inline mr-1" /> Qtd: {item.quantity || 1}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-semibold tabular-nums">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format((item.price || 0) * (item.quantity || 1))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 gap-1.5 border-electric/30 text-electric hover:bg-electric/10"
                        onClick={() => {
                          const cart = useCartStore.getState()
                          if (cart.addItem) {
                            cart.addItem({
                              product: {
                                id: item.id || `rebuy-${i}`,
                                name: item.name || 'Produto',
                                price: item.price || 0,
                              },
                              quantity: item.quantity || 1,
                            })
                            toast.success('Item adicionado para reposição!')
                          }
                        }}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reposição
                      </Button>
                    </div>
                  </div>
                ))}
                {(!selectedOrder?.items || selectedOrder.items.length === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                    Detalhes dos produtos não disponíveis.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-semibold text-muted-foreground">Total do Pedido</span>
              <span className="text-2xl font-bold tabular-nums text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  selectedOrder?.amount || 0,
                )}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
