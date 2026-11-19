import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { getDaysInMonth, getFirstDayOfWeek, isInMonth } from '@/lib/date'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'

interface Props {
  month: Date
  activeDay?: number
  onDayHover?: (day: number | null) => void
  renderDayContent?: (day: number) => React.ReactNode
  dayClassName?: string
  loading?: boolean
}

function CalendarGridComponent({
  month,
  activeDay,
  onDayHover,
  renderDayContent,
  dayClassName,
  loading = false,
}: Props) {
  const { t } = useTranslation()
  const year = month.getFullYear()
  const monthIdx = month.getMonth()

  const { cells, todayDay, daysInMonth } = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, monthIdx)
    const firstDay = getFirstDayOfWeek(year, monthIdx)
    const today = new Date()
    const todayDay = isInMonth(today, year, monthIdx) ? today.getDate() : -1
    return {
      cells: [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ] as (number | null)[],
      todayDay,
      daysInMonth,
    }
  }, [year, monthIdx])

  const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  if (loading) {
    return <LoadingState label={t('calendar.loading')} />
  }

  if (daysInMonth === 0) {
    return <EmptyState title={t('calendar.empty.title')} description={t('calendar.empty.description')} />
  }

  return (
    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
      {weekdayKeys.map((d) => (
        <div key={d} className="py-1 font-medium">
          {t(`calendar.weekdays.${d}`)}
        </div>
      ))}
      {cells.map((day, i) => (
        <div
          key={i}
          className={cn(
            'relative flex h-8 w-full items-center justify-center rounded-md text-xs',
            day === null && 'invisible',
            day === activeDay && 'bg-primary text-primary-foreground font-bold',
            day === todayDay && day !== activeDay && 'bg-accent',
            day !== null && day !== activeDay && day !== todayDay && 'hover:bg-muted cursor-pointer',
            dayClassName
          )}
          onMouseEnter={() => onDayHover?.(day)}
          onMouseLeave={() => onDayHover?.(null)}
        >
          {day}
          {renderDayContent && day && renderDayContent(day)}
        </div>
      ))}
    </div>
  )
}

export const CalendarGrid = memo(CalendarGridComponent)
CalendarGrid.displayName = 'CalendarGrid'
