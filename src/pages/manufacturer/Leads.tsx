import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Calendar, Phone, Mail, MapPin, Truck, Save, FileText } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

const STATUSES = [
  { id: 'new', label: 'New', color: 'border-blue-200 bg-blue-50' },
  { id: 'interested', label: 'Interested', color: 'border-yellow-200 bg-yellow-50' },
  { id: 'negotiating', label: 'Negotiating', color: 'border-orange-200 bg-orange-50' },
  { id: 'converted', label: 'Converted', color: 'border-green-200 bg-green-50' },
  { id: 'inactive', label: 'Inactive', color: 'border-gray-200 bg-gray-50' },
]

export default function ManufacturerCRM() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const [notes, setNotes] = useState('')
  const [logisticsNotes, setLogisticsNotes] = useState('')
  const [logisticsStatus, setLogisticsStatus] = useState('')
  const [logisticsFile, setLogisticsFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    try {
      if (!user) return
      const records = await pb
        .collection('customers')
        .getFullList({ filter: `manufacturer = "${user.id}"`, sort: '-created' })
      setLeads(records)
    } catch (error) {
      console.error('Error loading leads', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-next-line react-hooks/exhaustive-deps
  }, [user])

  useRealtime('customers', () => {
    loadData()
  })

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await pb.collection('customers').update(leadId, { status: newStatus })
      toast.success('Status updated')
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const openLeadDetails = (lead: any) => {
    setSelectedLead(lead)
    setNotes(lead.notes || '')
    setLogisticsNotes(lead.logistics_notes || '')
    setLogisticsStatus(lead.logistics_status || 'Aguardando Ônibus')
    setLogisticsFile(null)
    setIsSheetOpen(true)
  }

  const handleSaveDetails = async () => {
    if (!selectedLead) return
    setIsSaving(true)
    try {
      const data = new FormData()
      data.append('notes', notes)
      data.append('logistics_notes', logisticsNotes)
      data.append('logistics_status', logisticsStatus)
      if (logisticsFile) {
        data.append('logistics_file', logisticsFile)
      }

      const updated = await pb.collection('customers').update(selectedLead.id, data)
      toast.success('Customer details updated')
      setSelectedLead(updated)
      loadData()
    } catch (error) {
      toast.error('Failed to save details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId)
      if (lead && lead.status !== statusId) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: statusId } : l)))
        await handleStatusChange(leadId, statusId)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading CRM...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">CRM Pipeline</h2>
        <p className="text-muted-foreground">
          Manage your sales pipeline and customer relationships.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-[calc(100vh-220px)]">
          {STATUSES.map((status) => {
            const columnLeads = leads.filter((l) => (l.status || 'new') === status.id)
            return (
              <div
                key={status.id}
                className={`w-80 flex flex-col rounded-lg border bg-muted/30 ${status.color.replace('bg-', 'bg-opacity-50 ')}`}
                onDrop={(e) => handleDrop(e, status.id)}
                onDragOver={handleDragOver}
              >
                <div className="p-3 font-semibold border-b bg-background/50 backdrop-blur-sm flex justify-between items-center rounded-t-lg">
                  {status.label}
                  <span className="bg-background text-xs px-2 py-1 rounded-full border">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                  {columnLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="cursor-pointer hover:border-primary transition-colors shadow-sm"
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => openLeadDetails(lead)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="font-medium text-sm line-clamp-1">{lead.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" /> {lead.phone || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {lead.notes || 'No notes yet.'}
                        </div>
                        <div className="pt-2 mt-2 border-t flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground max-w-[100px] truncate">
                            {lead.logistics_status || 'Pending Logistic'}
                          </span>
                          <Select
                            value={lead.status || 'new'}
                            onValueChange={(val) => {
                              setLeads((prev) =>
                                prev.map((l) => (l.id === lead.id ? { ...l, status: val } : l)),
                              )
                              handleStatusChange(lead.id, val)
                            }}
                          >
                            <SelectTrigger
                              className="h-6 w-24 text-[10px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed rounded-lg py-8">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription>
              Comprehensive view of contact history and logistics.
            </SheetDescription>
          </SheetHeader>

          {selectedLead && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedLead.name}</h3>
                  <div className="text-sm text-muted-foreground flex gap-2 items-center">
                    <Calendar className="w-3 h-3" />
                    Last Contact:{' '}
                    {selectedLead.last_contacted_at
                      ? format(new Date(selectedLead.last_contacted_at), 'PPP')
                      : 'Never'}
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-muted/30 p-4 rounded-lg border text-sm">
                <div className="flex gap-2 items-center">
                  <Phone className="w-4 h-4 text-muted-foreground" />{' '}
                  {selectedLead.phone || 'No phone'}
                </div>
                <div className="flex gap-2 items-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />{' '}
                  {selectedLead.email || 'No email'}
                </div>
                <div className="flex gap-2 items-center">
                  <MapPin className="w-4 h-4 text-muted-foreground" />{' '}
                  {selectedLead.city
                    ? `${selectedLead.city}, ${selectedLead.state}`
                    : 'Location unknown'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea
                    placeholder="Add notes about customer preferences..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Logistics Integration
                  </h4>

                  <div className="space-y-2 mt-2">
                    <Label>Logistics Status</Label>
                    <Select value={logisticsStatus} onValueChange={setLogisticsStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aguardando Ônibus">Aguardando Ônibus</SelectItem>
                        <SelectItem value="Em Trânsito no Ônibus">Em Trânsito no Ônibus</SelectItem>
                        <SelectItem value="Entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Logistics Notes</Label>
                    <Textarea
                      placeholder="Seat number, route info, special instructions..."
                      value={logisticsNotes}
                      onChange={(e) => setLogisticsNotes(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logistics File (Receipt / Ticket)</Label>
                    {selectedLead.logistics_file && (
                      <div className="flex items-center gap-2 mb-2 p-2 border rounded-md bg-muted/50">
                        <FileText className="w-4 h-4 text-primary" />
                        <a
                          href={pb.files.getUrl(selectedLead, selectedLead.logistics_file)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline flex-1 truncate"
                        >
                          View Current Document
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={(e) => setLogisticsFile(e.target.files?.[0] || null)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={handleSaveDetails} disabled={isSaving}>
                    {isSaving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                    onClick={() =>
                      (window.location.href = `/manufacturer/negotiation/${selectedLead.id}`)
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="m9 15 2 2 4-4" />
                    </svg>
                    Open Negotiation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
