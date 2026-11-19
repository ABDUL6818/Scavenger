import { memo, useMemo } from 'react'
import { cn } from '@/lib/cn'
import { buildCalendarCells, getTodayDayInMonth } from '@/lib/date'

interface Props {
  month: Date
  activeDay?: number
  onDayHover?: (day: number | null) => void
  renderDayContent?: (day: number) => React.ReactNode
  dayClassName?: string
}

function CalendarGridComponent({
  month,
  activeDay,
  onDayHover,
  renderDayContent,
  dayClassName,
}: Props) {
  const year = month.getFullYear()
  const monthIdx = month.getMonth()

  const { cells, todayDay } = useMemo(() => {
    const today = new Date()
    const todayDay = getTodayDayInMonth(year, monthIdx)
    return {
      cells: buildCalendarCells(year, monthIdx) as (number | null)[],
      todayDay: todayDay ?? -1,
    }
  }, [year, monthIdx])

  const monthLabel = month.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const weeks: (number | null)[][] = useMemo(() => {
    const rows: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7))
    }
    return rows
  }, [cells])

  return (
    <div
      role="grid"
      aria-label={`Calendar for ${monthLabel}`}
      className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground"
    >
      <span className="sr-only">{monthLabel}</span>
      <div role="row" className="contents">
        {weekdays.map((d) => (
          <div key={d} role="columnheader" className="py-1 font-medium">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} role="row" className="contents">
          {week.map((day, di) => {
            const isActive = day !== null && day === activeDay
            const isToday = day !== null && day === todayDay
            const interactive = day !== null && !!onDayHover
            return (
              <div
                key={di}
                role="gridcell"
                aria-selected={isActive || undefined}
                aria-current={isToday ? 'date' : undefined}
                aria-label={day !== null ? `${monthLabel} ${day}` : undefined}
                aria-hidden={day === null || undefined}
                tabIndex={interactive ? 0 : undefined}
                className={cn(
                  'relative flex h-8 w-full items-center justify-center rounded-md text-xs',
                  day === null && 'invisible',
                  isActive && 'bg-primary text-primary-foreground font-bold',
                  isToday && !isActive && 'bg-accent',
                  day !== null && !isActive && !isToday && 'hover:bg-muted cursor-pointer',
                  dayClassName
                )}
                onMouseEnter={() => onDayHover?.(day)}
                onMouseLeave={() => onDayHover?.(null)}
              >
                {day}
                {renderDayContent && day && renderDayContent(day)}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export const CalendarGrid = memo(CalendarGridComponent)
CalendarGrid.displayName = 'CalendarGrid'
