import { Badge } from '@/components/ui/Badge'
import { Condition } from '@/types'

const conditionConfig: Record<Condition, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  excellent: { label: 'Excellent', variant: 'success' },
  good: { label: 'Good', variant: 'info' },
  fair: { label: 'Fair', variant: 'warning' },
  parts: { label: 'Parts Only', variant: 'danger' },
}

export function ConditionBadge({ condition }: { condition: Condition }) {
  const { label, variant } = conditionConfig[condition]
  return <Badge variant={variant}>{label}</Badge>
}
