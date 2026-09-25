-- ==============================================================================
-- HK-STORE E-COMMERCE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Market: Algeria (58 Wilayas, COD, Yalidine/ZR Express Ready)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2), -- Original price before discount
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INT DEFAULT 20,
    is_available BOOLEAN DEFAULT true,
    badge VARCHAR(50), -- 'Promo', 'Nouveau', 'Top Vente'
    variants JSONB DEFAULT '[]'::jsonb, -- e.g. [{"name": "Couleur", "options": ["Noir", "Or", "Argent"]}]
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

-- 6. POPULATE INITIAL CATEGORIES FOR HK STORE
INSERT INTO public.categories (name, slug, icon, display_order)
VALUES 
    ('Montres & Horlogerie', 'montres', 'Watch', 1),
    ('Coffrets Cadeaux', 'coffrets', 'Gift', 2),
    ('Lunettes de Soleil', 'lunettes', 'Glasses', 3),
    ('Maroquinerie & Sacs', 'maroquinerie', 'Briefcase', 4),
    ('Vêtements & Prière', 'vetements', 'Sparkles', 5)
ON CONFLICT (slug) DO NOTHING;

-- 7. POPULATE ALGERIAN 58 WILAYAS WITH REALISTIC RATES
INSERT INTO public.shipping_rates (wilaya_code, wilaya_name, stopdesk_price, domicile_price) VALUES
(1, 'Adrar', 700, 1100),
(2, 'Chlef', 300, 500),
(3, 'Laghouat', 500, 850),
(4, 'Oum El Bouaghi', 450, 750),
(5, 'Batna', 450, 750),
(6, 'Béjaïa', 450, 750),
(7, 'Biskra', 500, 850),
(8, 'Béchar', 650, 1000),
(9, 'Blida', 400, 650),
(10, 'Bouira', 400, 650),
(11, 'Tamanrasset', 850, 1300),
(12, 'Tébessa', 450, 800),
(13, 'Tlemcen', 450, 750),
(14, 'Tiaret', 400, 700),
(15, 'Tizi Ouzou', 400, 700),
(16, 'Alger', 400, 600),
(17, 'Djelfa', 450, 750),
(18, 'Jijel', 450, 750),
(19, 'Sétif', 400, 700),
(20, 'Saïda', 450, 750),
(21, 'Skikda', 450, 750),
(22, 'Sidi Bel Abbès', 400, 700),
(23, 'Annaba', 450, 750),
(24, 'Guelma', 450, 800),
(25, 'Constantine', 400, 700),
(26, 'Médéa', 400, 650),
(27, 'Mostaganem', 400, 650),
(28, 'M''Sila', 450, 750),
(29, 'Mascara', 400, 700),
(30, 'Ouargla', 550, 900),
(31, 'Oran', 400, 650),
(32, 'El Bayadh', 550, 900),
(33, 'Illizi', 850, 1300),
(34, 'Bordj Bou Arréridj', 400, 700),
(35, 'Boumerdès', 400, 650),
(36, 'El Tarf', 450, 800),
(37, 'Tindouf', 850, 1300),
(38, 'Tissemsilt', 400, 700),
(39, 'El Oued', 550, 900),
(40, 'Khenchela', 450, 800),
(41, 'Souk Ahras', 450, 800),
(42, 'Tipaza', 400, 650),
(43, 'Mila', 400, 700),
(44, 'Aïn Defla', 350, 600),
(45, 'Naâma', 550, 900),
(46, 'Aïn Témouchent', 400, 700),
(47, 'Ghardaïa', 550, 900),
(48, 'Relizane', 350, 600),
(49, 'Timimoun', 750, 1150),
(50, 'Bordj Badji Mokhtar', 900, 1400),
(51, 'Ouled Djellal', 500, 850),
(52, 'Béni Abbès', 700, 1100),
(53, 'In Salah', 800, 1250),
(54, 'In Guezzam', 900, 1400),
(55, 'Touggourt', 550, 900),
(56, 'Djanet', 900, 1400),
(57, 'El M''Ghair', 550, 900),
(58, 'El Meniaa', 650, 1000)
ON CONFLICT (wilaya_code) DO NOTHING;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public can read categories, products, shipping rates
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_available = true);
CREATE POLICY "Public shipping_rates read" ON public.shipping_rates FOR SELECT USING (is_active = true);

-- Public can create orders (COD Checkout)
CREATE POLICY "Public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public create order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Service role full access categories" ON public.categories USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access products" ON public.products USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access orders" ON public.orders USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access order_items" ON public.order_items USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access shipping_rates" ON public.shipping_rates USING (auth.jwt() ->> 'role' = 'service_role');
