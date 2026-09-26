-- ==============================================================================
-- HK-STORE E-COMMERCE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Market: Algeria (58 Wilayas, COD, Yalidine/ZR Express Ready, In-Store POS & Caisse)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    image_url TEXT,
    subcategories JSONB DEFAULT '[]'::jsonb,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle_ar TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2), -- Prix avant réduction
    cost_price NUMERIC(10, 2),       -- Prix d'achat pour calcul de marge nette
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    gender VARCHAR(20) DEFAULT 'unisex', -- 'homme', 'femme', 'unisex'
    images TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INT DEFAULT 20,
    is_available BOOLEAN DEFAULT true,
    badge VARCHAR(50),               -- 'Promo', 'Nouveau', 'Top Vente'
    sku VARCHAR(100) UNIQUE,         -- Barcode / Référence interne POS
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 25,
    variants JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_phone_secondary VARCHAR(20),
    wilaya_code INT NOT NULL, -- 1 to 58
    wilaya_name VARCHAR(100) NOT NULL,
    commune_name VARCHAR(100) NOT NULL,
    delivery_address TEXT,
    delivery_type VARCHAR(20) NOT NULL DEFAULT 'domicile', -- 'domicile' OR 'stopdesk'
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 600,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'nouveau', -- nouveau, confirme, expedie, livre, annule, retourne
    yalidine_tracking_code VARCHAR(100),
    yalidine_label_url TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    selected_variant JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. SHIPPING RATES (58 WILAYAS OF ALGERIA)
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    wilaya_code INT PRIMARY KEY,
    wilaya_name VARCHAR(100) NOT NULL,
    stopdesk_price NUMERIC(10, 2) NOT NULL DEFAULT 400,
    domicile_price NUMERIC(10, 2) NOT NULL DEFAULT 700,
    is_active BOOLEAN DEFAULT true
);

-- 6. POS SALES (MAGASIN PHYSIQUE HK STORE CHLEF)
CREATE TABLE IF NOT EXISTS public.pos_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. HK-01, HK-02
    total_dzd NUMERIC(10, 2) NOT NULL,
    cash_given NUMERIC(10, 2) NOT NULL,
    change_returned NUMERIC(10, 2) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. CAISSE & EXPENSES (GESTION DU FOND DE CAISSE ET CHARGES)
CREATE TABLE IF NOT EXISTS public.caisse_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'depense', 'retrait', 'fond_initial', 'entree'
    amount NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    created_by VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. SUPPLIERS (FOURNISSEURS)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. AUDIT LOGS (JOURNAL D'ACTIVITÉ ADMIN)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'commande', 'stock', 'caisse', 'fournisseur'
    details TEXT,
    amount NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — ALWAYS ON & ENFORCED
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caisse_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active categories, available products, active shipping rates
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_available = true);
CREATE POLICY "Public shipping_rates read" ON public.shipping_rates FOR SELECT USING (is_active = true);

-- Public can place orders and order items (COD Checkout)
CREATE POLICY "Public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public create order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Service Role (Backend & Admin) has full access to everything
CREATE POLICY "Service role full access categories" ON public.categories USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access products" ON public.products USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access orders" ON public.orders USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access order_items" ON public.order_items USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access shipping_rates" ON public.shipping_rates USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access pos_sales" ON public.pos_sales USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access caisse_transactions" ON public.caisse_transactions USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access suppliers" ON public.suppliers USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access audit_logs" ON public.audit_logs USING (auth.jwt() ->> 'role' = 'service_role');
