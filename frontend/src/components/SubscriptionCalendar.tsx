import { useMemo } from 'react'
import { Subscription } from '@/lib/subscriptionStorage'
import { CalendarGrid } from '@/components/CalendarGrid'
import { getMonthLabel, isInMonth } from '@/lib/date'

interface Props {
  subscriptions: Subscription[]
  month?: Date
}

export function SubscriptionCalendar({ subscriptions, month = new Date() }: Props) {
  const year = month.getFullYear()
  const monthIdx = month.getMonth()

  const pickupsByDay = useMemo(() => {
    const map: Record<number, Subscription[]> = {}
    subscriptions
      .filter((s) => s.status === 'active')
      .forEach((s) => {
        const d = new Date(s.nextPickup)
        if (isInMonth(d, year, monthIdx)) {
          const day = d.getDate()
          map[day] = [...(map[day] ?? []), s]
        }
      })
    return map
  }, [subscriptions, year, monthIdx])

  const monthLabel = getMonthLabel(month)

  return (
    <div className="rounded-lg border p-2 xs:p-3 tablet:p-4">
      <h3 className="mb-2 text-xs font-semibold xs:mb-3 xs:text-sm tablet:text-base">
        {monthLabel}
      </h3>
      <CalendarGrid
        month={month}
        renderDayContent={(day) =>
          pickupsByDay[day] && (
            <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-success" />
          )
        }
      />
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground xs:mt-3 xs:gap-2 xs:text-xs">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-success" />
        <span className="truncate">Scheduled pickup</span>
      </div>
    </div>
  )
}