import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatUnifiedOrderNumber } from "@/lib/orderSequence";
import { FEATURED_PRODUCTS } from "@/data/storeData";
import { syncOrderStockOnStatusChange, isStatusActive } from "@/lib/stockManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET all orders for admin
export async function GET() {
  try {
    const { data: rawOrders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("order_number", { ascending: false });

    if (error) {
      console.error("Error fetching admin orders:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: dbProducts } = await supabaseAdmin
      .from("products")
      .select("id, title, images");

    const formatted = (rawOrders || []).map((o: any) => {
      const resolvedItems = (o.order_items || []).map((it: any) => {
        let itemImg = it.selected_variant?.image || null;
        const rawTitle = (it.product_title || "").trim();
        const normTitle = rawTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 1. Try match featured products first
        if (!itemImg) {
          const matchFeatured = FEATURED_PRODUCTS.find((p) => {
            const pNorm = p.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return pNorm === normTitle || normTitle.includes(pNorm) || pNorm.includes(normTitle);
          });
          if (matchFeatured?.image) {
            itemImg = matchFeatured.image;
          }
        }

        // 2. Try match Supabase products
        if (!itemImg) {
          const matchDb = dbProducts?.find((p: any) => {
            const pNorm = (p.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return pNorm === normTitle || normTitle.includes(pNorm) || pNorm.includes(normTitle);
          });
          if (matchDb && matchDb.images && matchDb.images.length > 0) {
            itemImg = matchDb.images[0];
          }
        }

        // 3. Fallback to high quality watch photo
        if (!itemImg) {
          itemImg = "/images/hk-womens-watch.jpg";
        }

        return {
          id: it.id,
          product_title: it.product_title,
          quantity: it.quantity,
          unit_price: Number(it.unit_price),
          selected_variant: it.selected_variant,
          image: itemImg,
        };
      });

      const itemsSummary = resolvedItems
        .map((it: any) => `${it.product_title} x${it.quantity}`)
        .join(", ");

      const dateStr = new Date(o.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: o.id,
        orderNumber: formatUnifiedOrderNumber(o.order_number),
        numericNumber: o.order_number,
        date: dateStr,
        clientName: o.customer_name,
        phone: o.customer_phone,
        items: itemsSummary || "Article HK Store",
        productPriceDzd: Number(o.subtotal ?? (resolvedItems[0]?.unit_price || o.total_amount)),
        shippingCostDzd: Number(o.shipping_cost || 0),
        totalDzd: Number(o.total_amount),
        wilayaCode: o.wilaya_code,
        wilayaName: o.wilaya_name,
        baladiya: o.commune_name,
        deliveryType: o.delivery_type === "stopdesk" ? "Stopdesk Yalidine" : "À Domicile",
        status: o.status,
        trackingNumber: o.yalidine_tracking_code || "",
        created_at: o.created_at,
        order_items: resolvedItems,
      };
    });

    return NextResponse.json({ success: true, orders: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update order status & automatically sync stock
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId et status requis" }, { status: 400 });
    }

    // 1. Fetch current order to determine oldStatus
    const { data: currentOrder } = await supabaseAdmin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    const oldStatus = currentOrder?.status || "nouveau";

    // 2. Automatically restore or deduct stock if changing to/from annule or retour
    const stockSync = await syncOrderStockOnStatusChange(orderId, oldStatus, status);

    // 3. Update order status in DB
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: data,
      stockSync,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete order (restores stock if order was active)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "ID requis pour supprimer" }, { status: 400 });
    }

    // 1. Check if the order was in an active state; if so, restore items to stock before deletion
    const { data: currentOrder } = await supabaseAdmin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (currentOrder && isStatusActive(currentOrder.status)) {
      await syncOrderStockOnStatusChange(orderId, currentOrder.status, "annule");
    }

    const { error } = await supabaseAdmin.from("orders").delete().eq("id", orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, restored: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
