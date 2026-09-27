# 🎨 HK-STORE Design System & UI/UX Architecture

> **Project:** HK STORE Chlef (`HK-STORE.dz`)  
> **Google Stitch Project ID:** `projects/9558010600970973450`  
> **Design Theme:** Atelier Chlef Horizon (Inspired by MVMT.com Minimalist Luxury)  
> **Tech Stack Alignment:** Next.js 15 (App Router) + Tailwind CSS + TypeScript + Supabase  

---

## 🚫 Critical Negative Constraint: ZERO Emojis Policy
- **STRICT RULE:** Absolutely **ZERO** Unicode emojis anywhere across the user-facing storefront, checkout flows, badges, product titles, descriptions, and admin dashboard.
- **Iconography Standard:** Exclusively clean, razor-sharp **1.5px stroke monochrome vector SVG line icons** (Lucide / Feather icon style).

---

## 🎨 Color Palette & Design Tokens

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Dark** | `#0A0A0C` | Pitch Obsidian Black for navigation headers, footers, primary conversion CTAs, and bold titles. |
| **Surface Light** | `#FFFFFF` | Crisp Studio White for isolated product photography and card backgrounds. |
| **Secondary Surface** | `#F7F7F8` | Subtle off-white tinted slate for rhythmic section alternating backgrounds and tables. |
| **Accent Luxury** | `#C5A880` | Warm Champagne Gold for VIP gift badges, subtle divider lines, and review stars. |
| **Conversion CTA** | `#0F172A` | Deep bold black button with white uppercase tracked text and smooth hover inversion. |
| **Urgency / Promo** | `#DC2626` | Vivid Crimson for promotional discount tags (`-30%`, `-25%`) and critical low-stock alerts. |
| **Text Primary** | `#111827` | Deep slate for editorial narrative body text and tables. |
| **Text Muted** | `#6B7280` | Neutral gray for specifications, struck-through prices, and secondary breadcrumbs. |
| **Border Hairline** | `#E5E7EB` | 1px clean mechanical dividers with razor-sharp 0px/2px border radii. |

---

## ✍️ Typography Hierarchy

* **Headlines & Structural Labels:** `Montserrat` (Bold 700 / ExtraBold 800)
  * Tracking: `letter-spacing: 0.04em` to `0.12em`
  * Transform: `text-transform: uppercase` (MVMT horology editorial feel).
* **Arabic Accents & Calligraphy:** `Cairo` / `Alexandria` (Bold 700 / Black 900)
* **Body, Narrative & Pricing:** `Plus Jakarta Sans` / `Readex Pro`
  * Tabular numeric figures for DZD prices (e.g. `5,800 DZD`, `4,500 DZD`).

---

## 🗂️ Official Store Taxonomy (8 Independent Departments)

1. **MONTRES (قسم الساعات)**
   * Montres Hommes
   * Montres Femmes
2. **COFFRETS CADEAUX (أطقم الهدايا والكوفريات)**
   * Coffrets Hommes VIP
   * Coffrets Femmes Luxe
3. **LUNETTES (قسم النظارات)**
   * Lunettes Solaires Hommes
   * Lunettes Solaires Femmes
4. **MAROQUINERIE & SACS (قسم الحقائب والمحافظ)**
   * Sacoches Hommes
   * Portefeuilles & Porte-cartes
   * Sacs Femmes
   * Ceintures en Cuir Hommes
5. **VÊTEMENTS (قسم الملابس)**
   * Sous-vêtements Hommes
   * Ensembles de Prière Femmes
6. **HAUTE PARFUMERIE (قسم العطور)**
   * Parfums Hommes
   * Parfums Femmes
   * Mini Cadeaux & Favors (التوزيعات)
   * Brumes Corporelles
7. **DÉCORATIONS (قسم الديكورات)**
   * Objets de décoration d'intérieur et cadeaux déco
8. **ACCESSOIRES (قسم الإكسسوارات)**
   * Bagues
   * Colliers & Pendentifs
   * Gourmettes & Bracelets
   * Boucles d'oreilles

---

## 🖥️ Generated UI/UX Screens on Google Stitch

### 1. Desktop Storefront & Mega-Menu
* **Screen ID:** `9ca413f005ad44a194cf5e06aa9a5e26`
* **Features:** Top notification bar (58 wilayas COD guarantee, customer phone line, FR/AR toggle), sticky blur header with HK STORE wordmark, 8 departments navigation with luxury dropdown, full-bleed hero banner with dual CTAs, 4-category bento grid, 4-column product grid with DZD prices, and 4-pillar Algerian reassurance strip.

### 2. Mobile Experience Storefront
* **Screen ID:** `a2186381cca7403f96aef9f44ae80961`
* **Features:** Touch-optimized mobile layout, slide-out drawer with accordion sub-categories, horizontal scrolling department pills, 2-column product feed with direct COD triggers, and sticky bottom conversion bar (`[ 4,500 DZD | COMMANDER MAINTENANT ]`).

### 3. Product Detail Page & 1-Click COD Quick Checkout Modal
* **Screen ID:** `c29183e1e65f460bb2825b3260e294bc`
* **Features:** 4:5 luxury multi-angle image gallery, watch finish swatches (Noir Onyx, Argent Chrome, Or Rose), real-time stock alert ("Stock Limité: Il reste seulement 3 pièces à Chlef"), and an **open 1-Click COD modal drawer** (Name, Phone 05/06/07, 58 Wilayas dropdown, Commune, Domicile vs Stopdesk Yalidine selector, automated total DZD calculation, and direct confirmation button).

### 4. Admin Dashboard & Yalidine Logistics Management
* **Screen ID:** `3ab1ae30f20d4653afbc398d1d3426f1`
* **Features:** SaaS-grade dark sidebar, real-time KPI metrics (Daily Revenue DZD, Pending Confirmations, Yalidine Transit, Stock Alerts), Algerian COD orders data table with status pills (Nouveau, Confirmé, Expédié, Livré, Retour), 1-click Yalidine label printing, and Chlef boutique stock reorder actions.
