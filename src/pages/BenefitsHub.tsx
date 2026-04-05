import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useAuthStore from '@/stores/useAuthStore'
import { Navigate } from 'react-router-dom'
import { Users, BookOpen, GraduationCap, Video } from 'lucide-react'
import { MiniCRM } from '@/components/benefits/MiniCRM'
import { DigitalContent } from '@/components/benefits/DigitalContent'
import { DiscountMarketplace } from '@/components/benefits/DiscountMarketplace'
import { SocialGallery } from '@/components/benefits/SocialGallery'

export default function BenefitsHub() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const showCrm = user.role === 'retailer' || user.unlocked_benefits?.crm_enabled

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Hub de Benefícios & Recursos
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Portal exclusivo com ferramentas e conteúdos educacionais para impulsionar seu negócio de
          moda.
        </p>
      </div>

      <Tabs defaultValue={showCrm ? 'crm' : 'digital'} className="w-full">
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 h-auto p-1 gap-1 bg-muted/50 rounded-xl">
          {showCrm && (
            <TabsTrigger
              value="crm"
              className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <Users className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Mini</span> CRM
            </TabsTrigger>
          )}
          <TabsTrigger
            value="digital"
            className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Revista{' '}
            <span className="hidden md:inline">& Ebooks</span>
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Descontos{' '}
            <span className="hidden md:inline">Academy</span>
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <Video className="w-4 h-4 mr-2" /> Galeria{' '}
            <span className="hidden md:inline">Social</span>
          </TabsTrigger>
        </TabsList>

        {showCrm && (
          <TabsContent value="crm" className="mt-0 outline-none">
            <div className="bg-card border rounded-xl p-4 md:p-6 shadow-sm">
              <MiniCRM />
            </div>
          </TabsContent>
        )}

        <TabsContent value="digital" className="mt-0 outline-none">
          <DigitalContent />
        </TabsContent>

        <TabsContent value="courses" className="mt-0 outline-none">
          <DiscountMarketplace />
        </TabsContent>

        <TabsContent
          value="social"
          className="mt-0 outline-none bg-card border rounded-xl p-4 md:p-6 shadow-sm"
        >
          <SocialGallery />
        </TabsContent>
      </Tabs>
    </div>
  )
}
