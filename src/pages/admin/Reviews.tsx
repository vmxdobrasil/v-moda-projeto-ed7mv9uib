import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Review {
  id: number
  productName: string
  user: string
  rating: number
  date: string
  comment: string
  isVisible: boolean
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    productName: 'Vestido de Seda Minimalista',
    user: 'Maria Silva',
    rating: 5,
    date: '12/10/2026',
    comment: 'Peça perfeita! O caimento é impecável e a qualidade do tecido me surpreendeu.',
    isVisible: true,
  },
  {
    id: 2,
    productName: 'Vestido de Seda Minimalista',
    user: 'Ana Costa',
    rating: 4,
    date: '05/11/2026',
    comment:
      'Muito bonito, mas achei o tamanho um pouco maior do que o esperado. Recomendo pegar um número menor.',
    isVisible: true,
  },
  {
    id: 3,
    productName: 'Blazer Estruturado em Lã',
    user: 'Carlos Souza',
    rating: 2,
    date: '10/12/2026',
    comment:
      'Chegou com um pequeno defeito na costura. Pedi troca, mas o processo foi um pouco lento.',
    isVisible: false,
  },
]

export default function AdminReviews() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)

  const toggleVisibility = (id: number) => {
    setReviews(
      reviews.map((r) => {
        if (r.id === id) {
          const newVis = !r.isVisible
          toast({
            title: newVis ? 'Avaliação Aprovada' : 'Avaliação Ocultada',
            description: `A avaliação de ${r.user} foi ${newVis ? 'aprovada para exibição' : 'ocultada'}.`,
          })
          return { ...r, isVisible: newVis }
        }
        return r
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Avaliações dos Clientes</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Monitore e gerencie o feedback dos clientes sobre os produtos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todas as Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente / Produto</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Comentário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-center w-[120px]">Visível no Site?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="font-medium">{review.user}</div>
                      <div className="text-xs text-muted-foreground">{review.productName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex text-accent">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-4 h-4',
                              star <= review.rating ? 'fill-accent' : 'text-muted-foreground/30',
                            )}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-[300px] truncate" title={review.comment}>
                        {review.comment}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{review.date}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={review.isVisible}
                          onCheckedChange={() => toggleVisibility(review.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
