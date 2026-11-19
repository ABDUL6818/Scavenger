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

  return (
    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
        <div key={d} className="py-1 font-medium">
          {d}
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
