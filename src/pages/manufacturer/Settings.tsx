import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'

export default function ManufacturerSettings() {
  const [brandSettings, setBrandSettings] = useState<any[]>([])

  useEffect(() => {
    loadBrandSettings()
  }, [])

  const loadBrandSettings = async () => {
    try {
      const records = await pb.collection('brand_settings').getFullList()
      const requiredKeys = ['welcome_message', 'brand_motto', 'about_us']
      const existingKeys = records.map((r) => r.key)

      let allSettings = [...records]

      for (const key of requiredKeys) {
        if (!existingKeys.includes(key)) {
          const newSetting = await pb.collection('brand_settings').create({
            name: key.replace('_', ' ').toUpperCase(),
            key: key,
            value_text: '',
          })
          allSettings.push(newSetting)
        }
      }
      setBrandSettings(allSettings)
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateSetting = async (id: string, value_text: string) => {
    try {
      await pb.collection('brand_settings').update(id, { value_text })
      toast.success('Setting updated successfully')
    } catch (error) {
      toast.error('Error updating setting')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Brand Customization Center</h2>
        <p className="text-muted-foreground">
          Manage your brand identity, messaging, and core settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Messaging & Settings</CardTitle>
          <CardDescription>
            Update your brand's texts like welcome messages and mottos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {brandSettings.length === 0 && (
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            )}
            {brandSettings.map((bs) => (
              <div key={bs.id} className="space-y-2">
                <Label className="capitalize font-semibold">
                  {bs.name || bs.key.replace('_', ' ')}
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    defaultValue={bs.value_text}
                    placeholder={`Enter ${bs.key}...`}
                    className="min-h-[80px]"
                    onBlur={(e) => {
                      if (e.target.value !== bs.value_text) {
                        handleUpdateSetting(bs.id, e.target.value)
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Key: {bs.key}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
