'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ShippingAddress } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Inner form that uses Stripe hooks ─────────────────────────────────────────
interface CheckoutFormData {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  fulfillmentType: 'ship' | 'pickup'
  shippingAddress: ShippingAddress
}

function StripeCheckoutForm({
  formData,
  clientSecret,
  productIds,
  totalCents,
  onSuccess,
}: {
  formData: CheckoutFormData
  clientSecret: string
  productIds: string[]
  totalCents: number
  onSuccess: (orderId: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    // Update PaymentIntent metadata before confirming
    await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalCents,
        cartItems: productIds.map((id) => ({ product: { id } })),
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        fulfillmentType: formData.fulfillmentType,
        shippingAddress:
          formData.fulfillmentType === 'ship'
            ? JSON.stringify(formData.shippingAddress)
            : null,
      }),
    })

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: formData.buyerName,
            email: formData.buyerEmail,
          },
        },
      }
    )

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg px-3 py-3">
        <CardElement
          options={{
            style: {
              base: { fontSize: '14px', color: '#111827', '::placeholder': { color: '#9ca3af' } },
            },
          }}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading || !stripe}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" /> Processing...
          </span>
        ) : (
          `Pay ${formatPrice(totalCents)}`
        )}
      </Button>
    </form>
  )
}

// ── Main checkout page ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const items = useCart((s) => s.items)
  const total = useCart((s) => s.total)
  const clearCart = useCart((s) => s.clearCart)

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [formData, setFormData] = useState<CheckoutFormData>({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    fulfillmentType: 'ship',
    shippingAddress: { line1: '', line2: '', city: '', state: '', zip: '' },
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const totalCents = total()
  const productIds = items.map((i) => i.product.id)

  // Redirect to home if cart is empty
  useEffect(() => {
    if (items.length === 0) router.push('/')
  }, [items.length, router])

  // Fetch Stripe client secret
  useEffect(() => {
    if (totalCents > 0) {
      fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalCents, cartItems: items }),
      })
        .then((r) => r.json())
        .then((d) => setClientSecret(d.clientSecret))
    }
  }, [totalCents]) // eslint-disable-line react-hooks/exhaustive-deps

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!formData.buyerName.trim()) e.buyerName = 'Name is required'
    if (!formData.buyerEmail.trim()) e.buyerEmail = 'Email is required'
    if (formData.fulfillmentType === 'ship') {
      if (!formData.shippingAddress.line1) e.line1 = 'Address is required'
      if (!formData.shippingAddress.city) e.city = 'City is required'
      if (!formData.shippingAddress.state) e.state = 'State is required'
      if (!formData.shippingAddress.zip) e.zip = 'ZIP is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSuccess(orderId: string) {
    clearCart()
    router.push(`/checkout/success?orderId=${orderId}`)
  }

  if (items.length === 0) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
            <Input
              label="Full Name"
              value={formData.buyerName}
              onChange={(e) => setFormData((f) => ({ ...f, buyerName: e.target.value }))}
              error={errors.buyerName}
              placeholder="Jane Smith"
            />
            <Input
              label="Email"
              type="email"
              value={formData.buyerEmail}
              onChange={(e) => setFormData((f) => ({ ...f, buyerEmail: e.target.value }))}
              error={errors.buyerEmail}
              placeholder="jane@example.com"
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={formData.buyerPhone}
              onChange={(e) => setFormData((f) => ({ ...f, buyerPhone: e.target.value }))}
              placeholder="(555) 000-0000"
            />
          </section>

          {/* Fulfillment */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Fulfillment</h2>
            <div className="flex gap-3">
              {(['ship', 'pickup'] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex-1 border-2 rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                    formData.fulfillmentType === opt
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    value={opt}
                    checked={formData.fulfillmentType === opt}
                    onChange={() => setFormData((f) => ({ ...f, fulfillmentType: opt }))}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium capitalize">
                    {opt === 'ship' ? '📦 Ship to me' : '📍 Local Pickup'}
                  </span>
                </label>
              ))}
            </div>

            {formData.fulfillmentType === 'ship' && (
              <div className="space-y-3 pt-1">
                <Input
                  label="Street Address"
                  value={formData.shippingAddress.line1}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      shippingAddress: { ...f.shippingAddress, line1: e.target.value },
                    }))
                  }
                  error={errors.line1}
                  placeholder="123 Main St"
                />
                <Input
                  label="Apt / Suite (optional)"
                  value={formData.shippingAddress.line2 ?? ''}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      shippingAddress: { ...f.shippingAddress, line2: e.target.value },
                    }))
                  }
                />
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Input
                      label="City"
                      value={formData.shippingAddress.city}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          shippingAddress: { ...f.shippingAddress, city: e.target.value },
                        }))
                      }
                      error={errors.city}
                    />
                  </div>
                  <Input
                    label="State"
                    value={formData.shippingAddress.state}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        shippingAddress: { ...f.shippingAddress, state: e.target.value },
                      }))
                    }
                    error={errors.state}
                    placeholder="CA"
                  />
                  <Input
                    label="ZIP"
                    value={formData.shippingAddress.zip}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        shippingAddress: { ...f.shippingAddress, zip: e.target.value },
                      }))
                    }
                    error={errors.zip}
                    placeholder="90210"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            <div className="flex gap-3">
              {(['stripe', 'paypal'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 border-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    paymentMethod === method
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method === 'stripe' ? '💳 Credit / Debit Card' : '🅿️ PayPal'}
                </button>
              ))}
            </div>

            {paymentMethod === 'stripe' && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm
                  formData={formData}
                  clientSecret={clientSecret}
                  productIds={productIds}
                  totalCents={totalCents}
                  onSuccess={handleSuccess}
                />
              </Elements>
            )}

            {paymentMethod === 'paypal' && (
              <PayPalScriptProvider
                options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}
              >
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect' }}
                  createOrder={async () => {
                    if (!validate()) throw new Error('Invalid form')
                    const res = await fetch('/api/paypal/create-order', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ totalCents }),
                    })
                    const data = await res.json()
                    return data.orderId
                  }}
                  onApprove={async (data) => {
                    const res = await fetch('/api/paypal/capture-order', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paypalOrderId: data.orderID,
                        buyerName: formData.buyerName,
                        buyerEmail: formData.buyerEmail,
                        buyerPhone: formData.buyerPhone || null,
                        fulfillmentType: formData.fulfillmentType,
                        shippingAddress:
                          formData.fulfillmentType === 'ship'
                            ? formData.shippingAddress
                            : null,
                        productIds,
                        totalCents,
                      }),
                    })
                    const result = await res.json()
                    if (result.orderId) handleSuccess(result.orderId)
                  }}
                />
              </PayPalScriptProvider>
            )}

            {paymentMethod === 'stripe' && !clientSecret && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
          </section>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-gray-50 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-3 divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between pt-3 first:pt-0 text-sm">
                  <span className="text-gray-700 pr-4 truncate">{item.product.title}</span>
                  <span className="text-gray-900 font-medium shrink-0">
                    {formatPrice(item.product.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-300 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
