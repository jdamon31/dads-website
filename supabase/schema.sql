-- ============================================================
-- Dad's Store — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enums
CREATE TYPE condition_type AS ENUM ('excellent', 'good', 'fair', 'parts');
CREATE TYPE product_status AS ENUM ('active', 'sold', 'draft');
CREATE TYPE fulfillment_type AS ENUM ('ship', 'pickup', 'both');
CREATE TYPE payment_method_type AS ENUM ('stripe', 'paypal');
CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE order_status_type AS ENUM ('pending', 'processing', 'shipped', 'complete', 'cancelled');

-- ============================================================
-- Products
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL CHECK (price > 0),  -- stored in cents
  condition condition_type NOT NULL,
  category TEXT NOT NULL,
  status product_status NOT NULL DEFAULT 'draft',
  fulfillment fulfillment_type NOT NULL DEFAULT 'both',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);

-- ============================================================
-- Product Images
-- ============================================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ============================================================
-- Orders
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  fulfillment_type fulfillment_type NOT NULL,
  shipping_address JSONB,
  payment_method payment_method_type NOT NULL,
  payment_intent_id TEXT,
  payment_status payment_status_type NOT NULL DEFAULT 'pending',
  order_status order_status_type NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL CHECK (total_cents > 0)
);

CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================================
-- Order Items
-- ============================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  price_at_purchase_cents INTEGER NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================
-- Trigger: Mark product as sold when an order item is created
-- ============================================================
CREATE OR REPLACE FUNCTION mark_product_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET status = 'sold' WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_insert
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION mark_product_sold();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Products: anyone can read active/sold listings
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active and sold products"
  ON products FOR SELECT
  USING (status IN ('active', 'sold'));

-- Product images: public read
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product images"
  ON product_images FOR SELECT
  USING (true);

-- Orders: completely locked — all access via service role key in API routes
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Storage
-- ============================================================
-- In the Supabase dashboard, create a Storage bucket:
--   Name: product-images
--   Public: YES
--   File size limit: 10MB
--   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
