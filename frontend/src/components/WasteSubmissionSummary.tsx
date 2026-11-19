import { Recycle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export interface WasteSubmissionSummaryProps {
  onDone: () => void
  title?: string
  description?: string
}

export const WASTE_SUBMISSION_SUMMARY_DEFAULT_TITLE = 'Waste Submitted Successfully'
export const WASTE_SUBMISSION_SUMMARY_DEFAULT_DESCRIPTION =
  'Your waste submission has been recorded.'

export function WasteSubmissionSummary({
  onDone,
  title,
  description,
}: WasteSubmissionSummaryProps) {
  const { t } = useTranslation()

  const resolvedTitle = title ?? t('waste.submissionSummary.title')
  const resolvedDescription = description ?? t('waste.submissionSummary.description')

  return (
    <Card>
      <CardContent className="py-12">
        <EmptyState
          icon={<Recycle className="h-8 w-8 text-green-600" />}
          iconClassName="rounded-full bg-green-100 p-3"
          title={resolvedTitle}
          description={resolvedDescription}
          action={
            <Button variant="outline" onClick={onDone}>
              {t('common.done')}
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}