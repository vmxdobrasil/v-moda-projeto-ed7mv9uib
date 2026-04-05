import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function ReviewDialog({ brandId, userId, existingReview, onSuccess, children }: any) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(existingReview?.rating || 5)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!userId) return
    setLoading(true)
    try {
      if (existingReview) {
        await pb.collection('reviews').update(existingReview.id, { rating, comment })
        toast({ title: 'Avaliação atualizada!' })
      } else {
        await pb.collection('reviews').create({ brand: brandId, user: userId, rating, comment })
        toast({ title: 'Avaliação enviada com sucesso!' })
      }
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro ao enviar avaliação', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingReview ? 'Editar sua Avaliação' : 'Avaliar Marca'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2 flex flex-col items-center">
            <Label className="text-base">Sua nota</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-amber-500 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${rating >= star ? 'fill-amber-500' : 'fill-transparent'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comentário (opcional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência com os produtos e o atendimento..."
              rows={4}
              className="resize-none"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-base">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {existingReview ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
