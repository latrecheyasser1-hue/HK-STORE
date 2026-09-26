import { supabase } from "./supabaseClient";
import { supabaseAdmin } from "./supabaseAdmin";
import { Product, FEATURED_PRODUCTS, WILAYAS_DZ, DEPARTMENTS } from "@/data/storeData";

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_phone_secondary?: string;
  wilaya_code: number;
  wilaya_name: string;
  commune_name: string;
  delivery_address?: string;
  delivery_type: "domicile" | "stopdesk";
  items: {
    product_id?: string;
    product_title: string;
    quantity: number;
    unit_price: number;
    selected_variant?: any;
  }[];
}

/**
 * Fetch all available products from Supabase
 * Gracefully falls back to mock data if DB is empty or fails
 */
export async function getLiveProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return FEATURED_PRODUCTS;
    }

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      subtitleArabic: item.description || "",
      category: item.categories?.name || "Accessoires",
      categoryArabic: item.categories?.name || "",
      badge: item.badge || undefined,
      price: Number(item.price),
      originalPrice: item.compare_at_price ? Number(item.compare_at_price) : undefined,
      rating: 5,
      reviewsCount: 30 + Math.floor(Math.random() * 50),
      image: item.images && item.images.length > 0 ? item.images[0] : "/images/placeholder.jpg",
      hoverImage: item.images && item.images.length > 1 ? item.images[1] : item.images?.[0],
      stockQuantity: item.stock_quantity ?? 10,
      description: item.description || "",
      variants: Array.isArray(item.variants) ? item.variants : [],
    }));
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return FEATURED_PRODUCTS;
  }
}

/**
 * Fetch shipping rate for a wilaya
 */
export async function getShippingCost(wilayaCode: number, deliveryType: "domicile" | "stopdesk"): Promise<number> {
  try {
    const { data } = await supabase
      .from("shipping_rates")
      .select("stopdesk_price, domicile_price")
      .eq("wilaya_code", wilayaCode)
      .single();

    if (data) {
      return deliveryType === "domicile" ? Number(data.domicile_price) : Number(data.stopdesk_price);
    }
  } catch (e) {
    // fallback
  }

  const fallback = WILAYAS_DZ.find((w) => w.code === wilayaCode);
  if (!fallback) return deliveryType === "domicile" ? 700 : 400;
  return deliveryType === "domicile" ? fallback.domicilePrice : fallback.stopdeskPrice;
}
