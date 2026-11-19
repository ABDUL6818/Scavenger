import { Badge } from '@/components/ui/Badge'
import { Status } from '@/lib/constants'

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface StatusBadgeProps {
  status: string
  variantMap?: Record<string, StatusVariant>
}

const DEFAULT_VARIANT_MAP: Record<string, StatusVariant> = {
  [Status.ACTIVE]: 'default',
  [Status.PASSED]: 'secondary',
  [Status.REJECTED]: 'destructive',
  [Status.VETOED]: 'destructive',
  [Status.DRAFT]: 'outline',
  [Status.PENDING]: 'outline',
  [Status.COMPLETED]: 'secondary',
  [Status.FAILED]: 'destructive',
}

export function StatusBadge({ status, variantMap = DEFAULT_VARIANT_MAP }: StatusBadgeProps) {
  const variant = variantMap[status.toLowerCase()] ?? 'outline'

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}