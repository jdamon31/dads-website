import EasyPost from '@easypost/api'

const ORIGIN_ZIP = '89509'
const ORIGIN_STATE = 'CA'
const ORIGIN_CITY = 'Reno'
const MAX_WEIGHT_OZ = 1120 // 70 lbs

export interface ShippingItem {
  weight_oz: number | null
  length_in: number | null
  width_in: number | null
  height_in: number | null
}

export type ShippingResult =
  | { rateCents: number; carrier: string; service: string }
  | { needsQuote: true }
  | { tooHeavy: true }
  | { error: string }

export async function calculateShipping(
  items: ShippingItem[],
  toZip: string
): Promise<ShippingResult> {
  // If any item has no weight, we can't calculate — flag for manual quote
  if (items.some((i) => !i.weight_oz)) {
    return { needsQuote: true }
  }

  const totalWeightOz = items.reduce((sum, i) => sum + (i.weight_oz ?? 0), 0)

  if (totalWeightOz > MAX_WEIGHT_OZ) {
    return { tooHeavy: true }
  }

  // Box dimensions: largest L and W, sum of H (stacking approximation)
  // Fall back to 12×12×12 if no dims provided
  const lengths = items.map((i) => i.length_in ?? 12)
  const widths = items.map((i) => i.width_in ?? 12)
  const heights = items.map((i) => i.height_in ?? 4)

  const length = Math.max(...lengths)
  const width = Math.max(...widths)
  const height = heights.reduce((sum, h) => sum + h, 0)

  const apiKey = process.env.EASYPOST_API_KEY
  if (!apiKey) {
    return { error: 'Shipping service not configured' }
  }

  try {
    const client = new EasyPost(apiKey)

    const shipment = await client.Shipment.create({
      from_address: {
        zip: ORIGIN_ZIP,
        state: ORIGIN_STATE,
        city: ORIGIN_CITY,
        country: 'US',
      },
      to_address: {
        zip: toZip,
        country: 'US',
      },
      parcel: {
        weight: totalWeightOz,
        length,
        width,
        height,
      },
    })

    const rates: Array<{ rate: string; carrier: string; service: string }> =
      (shipment as { rates?: Array<{ rate: string; carrier: string; service: string }> }).rates ?? []

    if (!rates.length) {
      return { error: 'No rates available for this destination' }
    }

    // Pick the cheapest rate
    const sorted = [...rates].sort(
      (a, b) => parseFloat(a.rate) - parseFloat(b.rate)
    )
    const cheapest = sorted[0]

    return {
      rateCents: Math.round(parseFloat(cheapest.rate) * 100),
      carrier: cheapest.carrier,
      service: cheapest.service,
    }
  } catch (err) {
    console.error('EasyPost error:', err)
    return { error: 'Unable to calculate shipping' }
  }
}
