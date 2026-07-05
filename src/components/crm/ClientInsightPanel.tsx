import { MessageCircle, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useCrmStore from '@/stores/useCrmStore'
import pb from '@/lib/pocketbase/client'

export function ClientInsightPanel() {
  const { selectedClient } = useCrmStore()

  const avatarUrl = selectedClient?.avatar
    ? pb.files.getURL(selectedClient, selectedClient.avatar)
    : null

  const whatsappLink = selectedClient?.phone
    ? `https://wa.me/55${selectedClient.phone.replace(/\D/g, '')}`
    : '#'
  const emailLink = selectedClient?.email ? `mailto:${selectedClient.email}` : '#'

  return (
    <aside className="crm-panel w-[320px] shrink-0 flex flex-col p-6 gap-4 overflow-y-auto crm-content-scroll">
      <p className="text-xs font-display uppercase tracking-widest text-primary text-center">
        Perfil do Cliente
      </p>

      <div className="text-center">
        {selectedClient ? (
          <>
            <div className="inline-block mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={selectedClient.name}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-primary/30 cta-glow"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-navy to-primary/30 flex items-center justify-center border-2 border-primary/30">
                  <span className="text-2xl font-bold text-white font-display">
                    {selectedClient.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-white font-display">{selectedClient.name}</h3>
            <p className="text-sm text-white/50 flex items-center justify-center gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5" />
              {selectedClient.bio || selectedClient.brand_name || selectedClient.city || '—'}
            </p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-white/20 text-3xl">?</span>
            </div>
            <h3 className="text-lg font-bold text-white/40 font-display">
              Nenhum cliente selecionado
            </h3>
            <p className="text-sm text-white/30 mt-1">Selecione um lead para ver detalhes</p>
          </>
        )}
      </div>

      {selectedClient && (
        <>
          <div className="space-y-2.5 text-sm border-t border-white/5 pt-4">
            {selectedClient.phone && (
              <div className="flex items-center gap-2 text-white/60">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{selectedClient.phone}</span>
              </div>
            )}
            {selectedClient.email && (
              <div className="flex items-center gap-2 text-white/60">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{selectedClient.email}</span>
              </div>
            )}
            {selectedClient.city && (
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {selectedClient.city}
                  {selectedClient.state ? `, ${selectedClient.state}` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/5">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full rounded-2xl bg-primary hover:bg-electric text-white font-display cta-glow transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </a>
            <a href={emailLink}>
              <Button
                variant="outline"
                className="w-full rounded-2xl border-primary/30 text-primary hover:bg-primary/10 font-display transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4 mr-2" />
                E-mail
              </Button>
            </a>
          </div>
        </>
      )}
    </aside>
  )
}
