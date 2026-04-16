const PAYPAL_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token
}

export async function createPayPalOrder(totalCents: number): Promise<string> {
  const accessToken = await getAccessToken()
  const totalDollars = (totalCents / 100).toFixed(2)

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: totalDollars,
          },
        },
      ],
    }),
  })

  const data = await res.json()
  return data.id
}

export async function capturePayPalOrder(
  paypalOrderId: string
): Promise<{ status: string; captureId: string }> {
  const accessToken = await getAccessToken()

  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await res.json()
  const captureId =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId

  return { status: data.status, captureId }
}
