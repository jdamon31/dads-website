import { FulfillmentType } from '@/types'

const config: Record<FulfillmentType, { label: string; icon: string }> = {
  ship: { label: 'Ships', icon: '📦' },
  pickup: { label: 'Local Pickup', icon: '📍' },
  both: { label: 'Ship or Pickup', icon: '📦📍' },
}

export function FulfillmentBadge({ fulfillment }: { fulfillment: FulfillmentType }) {
  const { label, icon } = config[fulfillment]
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  )
}
