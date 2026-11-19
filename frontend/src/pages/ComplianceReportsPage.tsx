import { useState, useMemo, useCallback } from 'react'
import {
  FileText,
  FileBarChart,
  Eye,
  Download,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Settings,
  History,
  ClipboardList,
  Printer,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAppTitle } from '@/hooks/useAppTitle'
import { cacheKeys } from '@/lib/cacheKeys'
import { useTranslation } from '@/i18n'

// ── Types ───────────────────────────────────────────────────────────────────

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  fields: { key: string; label: string; type: 'string' | 'number' | 'date' | 'select' }[]
}

interface ScheduledReport {
  id: string
  name: string
  templateId: string
  schedule: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  active: boolean
  nextRun: string
  lastRun: string | null
}

interface ReportHistory {
  id: string
  name: string
  template: string
  format: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
  fileUrl?: string
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'waste-compliance',
    name: 'Waste Compliance Report',
    description: 'Detailed waste collection and processing compliance data',
    category: 'Compliance',
    fields: [
      { key: 'wasteType', label: 'Waste Type', type: 'select' },
      { key: 'quantity', label: 'Quantity (kg)', type: 'number' },
      { key: 'processor', label: 'Processing Facility', type: 'string' },
      { key: 'disposalMethod', label: 'Disposal Method', type: 'select' },
    ],
  },
  {
    id: 'participant-audit',
    name: 'Participant Audit Report',
    description: 'Participant compliance and activity audit trail',
    category: 'Audit',
    fields: [
      { key: 'participantId', label: 'Participant ID', type: 'string' },
      { key: 'role', label: 'Role', type: 'select' },
      { key: 'activityCount', label: 'Activity Count', type: 'number' },
      { key: 'lastActive', label: 'Last Active Date', type: 'date' },
    ],
  },
  {
    id: 'rewards-distribution',
    name: 'Rewards Distribution Report',
    description: 'Token rewards distribution and compliance summary',
    category: 'Financial',
    fields: [
      { key: 'participantId', label: 'Participant ID', type: 'string' },
      { key: 'rewardsEarned', label: 'Rewards Earned', type: 'number' },
      { key: 'period', label: 'Reporting Period', type: 'date' },
    ],
  },
  {
    id: 'carbon-footprint',
    name: 'Carbon Footprint Report',
    description: 'Carbon credit tracking and environmental impact assessment',
    category: 'Environmental',
    fields: [
      { key: 'wasteType', label: 'Waste Type', type: 'select' },
      { key: 'weight', label: 'Weight (kg)', type: 'number' },
      { key: 'carbonCredits', label: 'Carbon Credits', type: 'number' },
    ],
  },
]

const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'sched-1',
    name: 'Weekly Compliance Summary',
    templateId: 'waste-compliance',
    schedule: 'weekly',
    recipients: ['admin@scavngr.io', 'compliance@scavngr.io'],
    active: true,
    nextRun: '2026-07-02T08:00:00Z',
    lastRun: '2026-06-25T08:00:00Z',
  },
  {
    id: 'sched-2',
    name: 'Monthly Participant Audit',
    templateId: 'participant-audit',
    schedule: 'monthly',
    recipients: ['audit@scavngr.io'],
    active: true,
    nextRun: '2026-07-01T00:00:00Z',
    lastRun: '2026-06-01T00:00:00Z',
  },
]

const REPORT_HISTORY: ReportHistory[] = [
  { id: 'rpt-1', name: 'Q2 Waste Compliance', template: 'waste-compliance', format: 'pdf', status: 'completed', createdAt: '2026-06-25T10:00:00Z', fileUrl: '#' },
  { id: 'rpt-2', name: 'June Participant Audit', template: 'participant-audit', format: 'pdf', status: 'completed', createdAt: '2026-06-24T14:00:00Z', fileUrl: '#' },
  { id: 'rpt-3', name: 'May Rewards Summary', template: 'rewards-distribution', format: 'csv', status: 'failed', createdAt: '2026-06-01T09:00:00Z' },
  { id: 'rpt-4', name: 'Carbon Footprint Q2', template: 'carbon-footprint', format: 'pdf', status: 'pending', createdAt: '2026-06-25T12:00:00Z' },
]

function useReportTemplates() {
  return useQuery<ReportTemplate[]>({
    queryKey: cacheKeys.reportTemplates(),
    queryFn: async () => REPORT_TEMPLATES,
    staleTime: 300_000,
  })
}

function useReportHistory() {
  return useQuery<ReportHistory[]>({
    queryKey: cacheKeys.reportHistory(),
    queryFn: async () => REPORT_HISTORY,
    staleTime: 60_000,
  })
}

function useScheduledReports() {
  return useQuery<ScheduledReport[]>({
    queryKey: cacheKeys.scheduledReports(),
    queryFn: async () => SCHEDULED_REPORTS,
    staleTime: 60_000,
  })
}

type Tab = 'builder' | 'history' | 'scheduling'

// ── Report Builder Tab ──────────────────────────────────────────────────────

const WASTE_TYPES = ['Paper', 'PET Plastic', 'Plastic', 'Metal', 'Glass', 'Organic', 'Electronic']
const DISPOSAL_METHODS = ['Recycling', 'Composting', 'Incineration', 'Landfill', 'Chemical Treatment']
const PARTICIPANT_ROLES = ['Recycler', 'Collector', 'Manufacturer', 'All']

function ReportBuilderTab() {
  const { t } = useTranslation()
  const { data: templates } = useReportTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  })
  const [participantFilter, setParticipantFilter] = useState('')
  const [reportFormat, setReportFormat] = useState('pdf')
  const [showPreview, setShowPreview] = useState(false)

  const template = templates?.find(t => t.id === selectedTemplate)

  const handleGenerate = useCallback(() => {
    setShowPreview(true)
  }, [])

  const handleExport = useCallback(() => {
    const content = `${t('complianceReports.export.reportLabel')}: ${template?.name ?? t('complianceReports.export.customReport')}
${t('complianceReports.export.dateRangeLabel')}: ${dateRange.start} ${t('complianceReports.export.to')} ${dateRange.end}
${t('complianceReports.export.formatLabel')}: ${reportFormat.toUpperCase()}
${t('complianceReports.export.generatedLabel')}: ${new Date().toLocaleString()}

${t('complianceReports.export.footer')}`
    const blob = new Blob([content], { type: reportFormat === 'pdf' ? 'application/pdf' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${Date.now()}.${reportFormat}`
    a.click()
    URL.revokeObjectURL(url)
  }, [template, dateRange, reportFormat, t])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Builder form */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                {t('complianceReports.builder.title')}
              </CardTitle>
              <CardDescription>{t('complianceReports.builder.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('complianceReports.builder.templateLabel')}</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger aria-label={t('complianceReports.builder.templateAriaLabel')}>
                    <SelectValue placeholder={t('complianceReports.builder.templatePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {template && (
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                )}
              </div>

              {/* Date range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('complianceReports.builder.dateRangeLabel')}</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">{t('complianceReports.builder.startLabel')}</label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      aria-label={t('complianceReports.builder.startAriaLabel')}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">{t('complianceReports.builder.endLabel')}</label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      aria-label={t('complianceReports.builder.endAriaLabel')}
                    />
                  </div>
                </div>
              </div>

              {/* Participant filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('complianceReports.builder.participantFilterLabel')}</label>
                <Input
                  placeholder={t('complianceReports.builder.participantFilterPlaceholder')}
                  value={participantFilter}
                  onChange={e => setParticipantFilter(e.target.value)}
                  aria-label={t('complianceReports.builder.participantFilterAriaLabel')}
                />
              </div>

              {/* Format selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('complianceReports.builder.exportFormatLabel')}</label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger aria-label={t('complianceReports.builder.exportFormatAriaLabel')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">{t('complianceReports.builder.formatPdf')}</SelectItem>
                    <SelectItem value="csv">{t('complianceReports.builder.formatCsv')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Template fields */}
              {template && template.fields.length > 0 && (
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">{t('complianceReports.builder.templateFields')}</p>
                  {template.fields.map(field => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs text-muted-foreground">{field.label}</label>
                      {field.type === 'select' ? (
                        <Select>
                          <SelectTrigger aria-label={field.label}>
                            <SelectValue placeholder={t('complianceReports.builder.selectFieldPlaceholder', { field: field.label })} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.key === 'wasteType' || field.key === 'waste_type'
                              ? WASTE_TYPES
                              : field.key === 'role'
                              ? PARTICIPANT_ROLES
                              : field.key === 'disposalMethod'
                              ? DISPOSAL_METHODS
                              : []
                            ).map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'number' ? (
                        <Input type="number" placeholder={t('complianceReports.builder.enterFieldPlaceholder', { field: field.label })} aria-label={field.label} />
                      ) : field.type === 'date' ? (
                        <Input type="date" aria-label={field.label} />
                      ) : (
                        <Input placeholder={t('complianceReports.builder.enterFieldPlaceholder', { field: field.label })} aria-label={field.label} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleGenerate} disabled={!selectedTemplate}>
                  <Eye className="h-4 w-4 mr-1" />
                  {t('complianceReports.builder.previewButton')}
                </Button>
                <Button onClick={handleExport} variant="outline" disabled={!showPreview}>
                  <Download className="h-4 w-4 mr-1" />
                  {t('complianceReports.builder.exportButton', { format: reportFormat.toUpperCase() })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview panel */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4" />
                {t('complianceReports.preview.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPreview || !template ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <FileBarChart className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {t('complianceReports.preview.emptyDescription')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('complianceReports.preview.period', { start: dateRange.start, end: dateRange.end })}
                    </p>
                    {participantFilter && (
                      <p className="text-xs text-muted-foreground">
                        {t('complianceReports.preview.filter', { filter: participantFilter })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">{t('complianceReports.preview.totalRecords')}</span>
                      <span className="font-medium tabular-nums">1,247</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">{t('complianceReports.preview.complianceRate')}</span>
                      <span className="font-medium text-green-600 tabular-nums">98.3%</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">{t('complianceReports.preview.pendingItems')}</span>
                      <span className="font-medium text-yellow-600 tabular-nums">23</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-muted-foreground">{t('complianceReports.preview.violations')}</span>
                      <span className="font-medium text-red-600 tabular-nums">4</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={handleExport}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {t('complianceReports.preview.export')}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Printer className="h-3.5 w-3.5 mr-1" />
                      {t('complianceReports.preview.print')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── History Tab ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const { t } = useTranslation()
  const { data: history, isLoading } = useReportHistory()
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    if (!history) return []
    return history.filter(h =>
      !filter || h.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [history, filter])

  return (
    <div className="space-y-4">
      <Input
        placeholder={t('complianceReports.history.searchPlaceholder')}
        value={filter}
        onChange={e => setFilter(e.target.value)}
        aria-label={t('complianceReports.history.searchAriaLabel')}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title={t('complianceReports.history.emptyTitle')}
          description={t('complianceReports.history.emptyDescription')}
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border">
          {filtered.map(report => (
            <div key={report.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{report.name}</p>
                  <Badge
                    variant="outline"
                    className={
                      report.status === 'completed'
                        ? 'text-green-600 border-green-200 bg-green-50'
                        : report.status === 'failed'
                        ? 'text-red-600 border-red-200 bg-red-50'
                        : 'text-yellow-600 border-yellow-200 bg-yellow-50'
                    }
                  >
                    {report.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {report.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {report.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {t(`complianceReports.status.${report.status}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {report.template} · {report.format.toUpperCase()} · {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 ml-3">
                {report.fileUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={report.fileUrl} download>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Scheduling Tab ──────────────────────────────────────────────────────────

const SCHEDULE_OPTIONS = [
  { value: 'daily', labelKey: 'complianceReports.frequency.daily' },
  { value: 'weekly', labelKey: 'complianceReports.frequency.weekly' },
  { value: 'monthly', labelKey: 'complianceReports.frequency.monthly' },
]

function SchedulingTab() {
  const { t } = useTranslation()
  const { data: scheduled } = useScheduledReports()
  const { data: templates } = useReportTemplates()
  const [showForm, setShowForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    templateId: '',
    schedule: 'weekly' as string,
    recipients: '',
  })

  const handleAdd = useCallback(() => {
    setShowForm(true)
  }, [])

  const handleSave = useCallback(() => {
    setShowForm(false)
    setNewSchedule({ name: '', templateId: '', schedule: 'weekly', recipients: '' })
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('complianceReports.scheduling.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('complianceReports.scheduling.description')}</p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {t('complianceReports.scheduling.addSchedule')}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('complianceReports.scheduling.formTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('complianceReports.scheduling.reportNameLabel')}</label>
              <Input
                placeholder={t('complianceReports.scheduling.reportNamePlaceholder')}
                value={newSchedule.name}
                onChange={e => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                aria-label={t('complianceReports.scheduling.reportNameAriaLabel')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('complianceReports.scheduling.templateLabel')}</label>
              <Select
                value={newSchedule.templateId}
                onValueChange={v => setNewSchedule(prev => ({ ...prev, templateId: v }))}
              >
                <SelectTrigger aria-label={t('complianceReports.scheduling.templateAriaLabel')}>
                  <SelectValue placeholder={t('complianceReports.scheduling.templatePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('complianceReports.scheduling.frequencyLabel')}</label>
              <Select
                value={newSchedule.schedule}
                onValueChange={v => setNewSchedule(prev => ({ ...prev, schedule: v }))}
              >
                <SelectTrigger aria-label={t('complianceReports.scheduling.frequencyAriaLabel')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('complianceReports.scheduling.recipientsLabel')}</label>
              <Input
                placeholder={t('complianceReports.scheduling.recipientsPlaceholder')}
                value={newSchedule.recipients}
                onChange={e => setNewSchedule(prev => ({ ...prev, recipients: e.target.value }))}
                aria-label={t('complianceReports.scheduling.recipientsAriaLabel')}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {t('common.save')}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" size="sm">
                {t('common.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {scheduled && scheduled.length > 0 ? (
        <div className="divide-y divide-border rounded-lg border">
          {scheduled.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.name}</p>
                  <Badge variant={item.active ? 'default' : 'outline'}>
                    {item.active ? t('complianceReports.scheduling.active') : t('complianceReports.scheduling.paused')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('complianceReports.scheduling.itemSummary', {
                    frequency: t(`complianceReports.frequency.${item.schedule}`),
                    nextRun: new Date(item.nextRun).toLocaleString(),
                    count: item.recipients.length,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Button variant="ghost" size="sm">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title={t('complianceReports.scheduling.emptyTitle')}
          description={t('complianceReports.scheduling.emptyDescription')}
          action={{ label: t('complianceReports.scheduling.addSchedule'), onClick: handleAdd }}
        />
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export function ComplianceReportsPage() {
  const { t } = useTranslation()
  useAppTitle(t('complianceReports.pageTitle'))
  const [activeTab, setActiveTab] = useState<Tab>('builder')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'builder', label: t('complianceReports.tabs.builder'), icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'history', label: t('complianceReports.tabs.history'), icon: <History className="h-4 w-4" /> },
    { id: 'scheduling', label: t('complianceReports.tabs.scheduling'), icon: <Clock className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6 px-4 py-6 sm:space-y-8 sm:py-8">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{t('complianceReports.pageTitle')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('complianceReports.pageDescription')}
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label={t('complianceReports.tabsAriaLabel')}
        className="flex flex-wrap gap-1 rounded-lg border bg-muted p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'builder' && <ReportBuilderTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'scheduling' && <SchedulingTab />}
      </div>
    </div>
  )
}
