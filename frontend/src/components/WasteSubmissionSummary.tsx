import { Recycle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export interface WasteSubmissionSummaryProps {
  onDone: () => void
  title?: string
  description?: string
}

export function WasteSubmissionSummary({
  onDone,
  title = 'Waste Submitted Successfully',
  description = 'Your waste submission has been recorded.',
}: WasteSubmissionSummaryProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 sm:py-10 md:py-12">
        <div className="rounded-full bg-success/10 p-3">
          <Recycle className="h-8 w-8 text-success" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold break-words sm:text-xl">{title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground break-words">{description}</p>
        <Button variant="outline" onClick={onDone} className="w-full sm:w-auto">
          Done
        </Button>
      </CardContent>
    </Card>
  )
}