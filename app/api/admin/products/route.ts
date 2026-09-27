import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FEATURED_PRODUCTS } from "@/data/storeData";
import { findMatchingProduct, adjustStock, broadcastStockUpdate, MatchedProduct } from "@/lib/stockManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Fetch products with live inventory quantities and real sales counts
export async function GET() {
  try {
    const { data: dbProducts, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Fetch order items to compute real live sales count
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select("product_id, product_title, quantity");

    // Fetch POS sales to compute cashier sales
    let posSales: any[] = [];
    try {
      const posPath = path.join(process.cwd(), "data", "pos_sales.json");
      if (fs.existsSync(posPath)) {
        posSales = JSON.parse(fs.readFileSync(posPath, "utf-8"));
      }
    } catch (e) {}

    // Merge with FEATURED_PRODUCTS so all UI fields, gender, images and branches are complete
    const merged = FEATURED_PRODUCTS.map((fp) => {
      const matchDb = findMatchingProduct((dbProducts || []) as MatchedProduct[], {
        product_id: fp.id,
        product_title: fp.title,
      });

      // Compute dynamic sales: baseline + site orders + POS sales
      const baseUnits = Math.max(12, Math.floor((fp.reviewsCount || 10) * 1.5) + (fp.rating >= 4.8 ? 16 : 4));
      let totalSales = baseUnits;

      if (orderItems && Array.isArray(orderItems)) {
        for (const it of orderItems) {
          const matchId = it.product_id === fp.id || (matchDb?.id && it.product_id === matchDb.id);
          const matchTitle = it.product_title && it.product_title.toLowerCase() === fp.title.toLowerCase();
          if (matchId || matchTitle) {
            totalSales += Number(it.quantity) || 1;
          }
        }
      }

      if (Array.isArray(posSales)) {
        for (const sale of posSales) {
          if (Array.isArray(sale.items)) {
            for (const it of sale.items) {
              const matchId = it.product?.id === fp.id;
              const matchTitle = it.product?.title && it.product.title.toLowerCase() === fp.title.toLowerCase();
              if (matchId || matchTitle) {
                totalSales += Number(it.quantity) || 1;
              }
            }
          }
        }
      }

      return {
        ...fp,
        dbId: matchDb?.id || null,
        stockQuantity: matchDb && typeof matchDb.stock_quantity === "number" ? matchDb.stock_quantity : fp.stockQuantity,
        salesCount: totalSales,
      };
    });

    return NextResponse.json(
      { success: true, products: merged, dbProducts: dbProducts || [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Adjust or set stock quantity
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productTitle, delta, newStock } = body;

    const { data: dbProducts } = await supabaseAdmin
      .from("products")
      .select("id, title, stock_quantity");

    const matched = findMatchingProduct((dbProducts || []) as MatchedProduct[], {
      product_id: productId,
      product_title: productTitle,
    });

    if (!matched) {
      return NextResponse.json({ success: false, error: "Produit non trouvé" }, { status: 404 });
    }

    let finalStock = matched.stock_quantity;
    if (typeof newStock === "number") {
      finalStock = Math.max(0, newStock);
      await supabaseAdmin
        .from("products")
        .update({ stock_quantity: finalStock })
        .eq("id", matched.id);

      await broadcastStockUpdate({
        productId: matched.id,
        title: matched.title,
        stockQuantity: finalStock,
      });
    } else if (typeof delta === "number") {
      const res = await adjustStock(matched.id, delta);
      finalStock = res.newStock ?? matched.stock_quantity;
    }

    return NextResponse.json({ success: true, productId: matched.id, stockQuantity: finalStock });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
