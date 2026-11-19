import { memo, useMemo } from 'react'
import { cn } from '@/lib/cn'
import { getDaysInMonth, getFirstDayOfWeek, isInMonth } from '@/lib/date'

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
    }
  }, [year, monthIdx])

  return (
    <div className="grid grid-cols-7 gap-0.5 xs:gap-1 tablet:gap-1.5 text-center text-[10px] xs:text-xs text-muted-foreground">
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
        <div key={d} className="py-0.5 xs:py-1 font-medium">
          {d}
        </div>
      ))}
      {cells.map((day, i) => (
        <div
          key={i}
          className={cn(
            'relative flex h-7 xs:h-8 tablet:h-9 w-full items-center justify-center rounded-md text-[10px] xs:text-xs',
            day === null && 'invisible',
            day === activeDay && 'bg-primary text-primary-foreground font-bold',
            day === todayDay && day !== activeDay && 'bg-accent text-accent-foreground',
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
