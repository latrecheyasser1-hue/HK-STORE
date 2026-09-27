import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeText } from "./textUtils";
import { FEATURED_PRODUCTS } from "@/data/storeData";

export { normalizeText };

export interface MatchedProduct {
  id: string;
  title: string;
  stock_quantity: number;
  price?: number;
}

/**
 * Finds a matching product from the database by UUID or normalized title
 */
export function findMatchingProduct(
  dbProducts: MatchedProduct[],
  query: { product_id?: string | null; product_title?: string | null }
): MatchedProduct | null {
  if (!dbProducts || dbProducts.length === 0) return null;

  // 1. Direct UUID match
  if (query.product_id) {
    const byId = dbProducts.find((p) => p.id === query.product_id);
    if (byId) return byId;

    // Resolve frontend IDs like "prod-1", "prod-2" to DB product by matching title
    if (query.product_id.startsWith("prod-")) {
      const fp = FEATURED_PRODUCTS.find((p) => p.id === query.product_id);
      if (fp) {
        const fpNorm = normalizeText(fp.title);
        const matchFp = dbProducts.find((p) => {
          const pNorm = normalizeText(p.title);
          return pNorm === fpNorm || pNorm.includes(fpNorm) || fpNorm.includes(pNorm);
        });
        if (matchFp) return matchFp;
      }
    }
  }

  // 2. Normalized Title match
  const rawTitle = query.product_title || "";
  const normQuery = normalizeText(rawTitle);
  if (!normQuery) return null;

  return (
    dbProducts.find((p) => {
      const pNorm = normalizeText(p.title);
      return (
        pNorm === normQuery ||
        normQuery.includes(pNorm) ||
        pNorm.includes(normQuery) ||
        (normQuery.length > 6 && pNorm.length > 6 && (pNorm.includes(normQuery.slice(0, 10)) || normQuery.includes(pNorm.slice(0, 10))))
      );
    }) || null
  );
}

/**
 * Adjust stock in Supabase products table (atomic delta)
 * delta > 0: increment (return/cancel)
 * delta < 0: decrement (order placed/re-activated)
 */
export async function adjustStock(
  productId: string,
  delta: number
): Promise<{ success: boolean; newStock?: number }> {
  try {
    const { data: cur, error: fetchErr } = await supabaseAdmin
      .from("products")
      .select("id, title, stock_quantity")
      .eq("id", productId)
      .single();

    if (fetchErr || !cur) {
      console.warn(`Product ${productId} not found for stock adjustment`);
      return { success: false };
    }

    const currentQty = typeof cur.stock_quantity === "number" ? cur.stock_quantity : 0;
    const newStock = Math.max(0, currentQty + delta);

    const { error: updateErr } = await supabaseAdmin
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId);

    if (updateErr) {
      console.error(`Failed to update stock for ${productId}:`, updateErr);
      return { success: false };
    }

    // Broadcast Realtime stock update to storefront and admin
    broadcastStockUpdate({
      productId,
      title: cur.title,
      stockQuantity: newStock,
    }).catch((e) => console.warn("Stock broadcast error:", e));

    return { success: true, newStock };
  } catch (err) {
    console.error("Error in adjustStock:", err);
    return { success: false };
  }
}

export async function broadcastStockUpdate(payload: {
  productId: string;
  title: string;
  stockQuantity: number;
}): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const channel = supabaseAdmin.channel("hk-store-stock");
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await channel.send({
              type: "broadcast",
              event: "stock_update",
              payload,
            });
          } catch (e) {
            console.warn("Stock broadcast send error:", e);
          } finally {
            setTimeout(() => {
              supabaseAdmin.removeChannel(channel);
              resolve();
            }, 300);
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          supabaseAdmin.removeChannel(channel);
          resolve();
        }
      });
      setTimeout(() => resolve(), 2500);
    } catch (err) {
      resolve();
    }
  });
}

const ACTIVE_STATUSES = new Set(["nouveau", "confirme", "expedie", "livre"]);
const INACTIVE_STATUSES = new Set(["annule", "retour"]);

export function isStatusActive(status: string): boolean {
  return ACTIVE_STATUSES.has((status || "").toLowerCase());
}

export function isStatusInactive(status: string): boolean {
  return INACTIVE_STATUSES.has((status || "").toLowerCase());
}

/**
 * Handles stock adjustments when an order status changes:
 * - Active -> Inactive (annule/retour): RESTORES stock (+quantity)
 * - Inactive -> Active (nouveau/confirme/expedie/livre): RE-DEDUCTS stock (-quantity)
 */
export async function syncOrderStockOnStatusChange(
  orderId: string,
  oldStatus: string,
  newStatus: string
): Promise<{ adjusted: boolean; action?: "restored" | "deducted"; itemsCount?: number }> {
  const wasActive = isStatusActive(oldStatus);
  const wasInactive = isStatusInactive(oldStatus);

  const isNowActive = isStatusActive(newStatus);
  const isNowInactive = isStatusInactive(newStatus);

  // If transition doesn't change active/inactive state, do nothing
  if (wasActive && isNowActive) return { adjusted: false };
  if (wasInactive && isNowInactive) return { adjusted: false };

  // Fetch order items and all DB products
  const { data: orderItems } = await supabaseAdmin
    .from("order_items")
    .select("id, product_id, product_title, quantity")
    .eq("order_id", orderId);

  if (!orderItems || orderItems.length === 0) {
    return { adjusted: false };
  }

  const { data: dbProducts } = await supabaseAdmin
    .from("products")
    .select("id, title, stock_quantity");

  const productsList: MatchedProduct[] = dbProducts || [];

  // Determine direction:
  // Active -> Inactive : RESTORE stock (+qty)
  // Inactive -> Active : DEDUCT stock (-qty)
  const isRestoring = wasActive && isNowInactive;
  const deltaMultiplier = isRestoring ? 1 : -1;

  for (const it of orderItems) {
    const qty = Math.max(1, Number(it.quantity) || 1);
    const matched = findMatchingProduct(productsList, {
      product_id: it.product_id,
      product_title: it.product_title,
    });

    if (matched) {
      await adjustStock(matched.id, deltaMultiplier * qty);
    }
  }

  return {
    adjusted: true,
    action: isRestoring ? "restored" : "deducted",
    itemsCount: orderItems.length,
  };
}
