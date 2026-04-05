import { useState, useRef } from 'react'
import { Star, Loader2, ImagePlus, X } from 'lucide-react'
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
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => {
        const combined = [...prev, ...newFiles]
        return combined.slice(0, 5) // max 5
      })
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('brand', brandId)
      formData.append('user', userId)
      formData.append('rating', rating.toString())
      formData.append('comment', comment)

      images.forEach((img) => {
        formData.append('images', img)
      })

      if (existingReview) {
        await pb.collection('reviews').update(existingReview.id, formData)
        toast({ title: 'Avaliação atualizada!' })
      } else {
        await pb.collection('reviews').create(formData)
        toast({ title: 'Avaliação enviada com sucesso!' })
      }
      setOpen(false)
      setImages([])
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
        <div className="space-y-5 py-4">
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
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Adicionar Fotos (opcional, máx 5)</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-4 h-4 mr-2 text-muted-foreground" />
                Selecionar Imagens
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 rounded-md overflow-hidden border relative group"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-full h-full object-cover"
                      alt={`Preview ${idx}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {existingReview && existingReview.images && existingReview.images.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Você já possui {existingReview.images.length} foto(s) anexada(s). Novas fotos serão
                adicionadas.
              </p>
            )}
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-base mt-2">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {existingReview ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
