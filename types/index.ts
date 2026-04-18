export type Condition = 'excellent' | 'good' | 'fair' | 'parts'
export type ProductStatus = 'active' | 'sold' | 'draft'
export type FulfillmentType = 'ship' | 'pickup' | 'both'
export type PaymentMethod = 'stripe' | 'paypal'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'complete' | 'cancelled'
export type RequestStatus = 'pending' | 'fulfilled' | 'dismissed'

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'parts', label: 'Parts Only' },
]

export interface Category {
  id: string
  name: string
  slug: string
  display_order: number
  created_at: string
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number // stored in cents (sale price)
  purchase_price: number | null // stored in cents (what was paid at auction)
  condition: Condition
  category: string
  status: ProductStatus
  fulfillment: FulfillmentType
  is_special: boolean
  quantity: number
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  display_order: number
  created_at: string
}

export interface ProductWithImages extends Product {
  images: ProductImage[]
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export interface Order {
  id: string
  created_at: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  fulfillment_type: FulfillmentType
  shipping_address: ShippingAddress | null
  payment_method: PaymentMethod
  payment_intent_id: string | null
  payment_status: PaymentStatus
  order_status: OrderStatus
  total_cents: number
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  price_at_purchase_cents: number
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product })[]
}

export interface CartItem {
  product: ProductWithImages
  addedAt: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}

export interface ItemRequest {
  id: string
  name: string
  email: string
  phone: string | null
  description: string
  status: RequestStatus
  created_at: string
}
