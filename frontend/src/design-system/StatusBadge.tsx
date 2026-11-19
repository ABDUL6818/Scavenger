import { memo, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface StatusBadgeProps {
  status: string
  variantMap?: Record<string, StatusVariant>
}

const DEFAULT_VARIANT_MAP: Record<string, StatusVariant> = {
  active: 'default',
  passed: 'secondary',
  rejected: 'destructive',
  vetoed: 'destructive',
  draft: 'outline',
  pending: 'outline',
  completed: 'secondary',
  failed: 'destructive',
}

function StatusBadgeComponent({ status, variantMap = DEFAULT_VARIANT_MAP }: StatusBadgeProps) {
  const variant = useMemo(
    () => variantMap[status.toLowerCase()] ?? 'outline',
    [variantMap, status],
  )

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}

export const StatusBadge = memo(StatusBadgeComponent)