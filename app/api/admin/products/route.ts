import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FEATURED_PRODUCTS } from "@/data/storeData";
import { findMatchingProduct, adjustStock, MatchedProduct } from "@/lib/stockManager";

// GET: Fetch products with live inventory quantities
export async function GET() {
  try {
    const { data: dbProducts, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Merge with FEATURED_PRODUCTS so all UI fields, gender, images and branches are complete
    const merged = FEATURED_PRODUCTS.map((fp) => {
      const matchDb = findMatchingProduct((dbProducts || []) as MatchedProduct[], {
        product_id: fp.id,
        product_title: fp.title,
      });

      return {
        ...fp,
        dbId: matchDb?.id || null,
        stockQuantity: matchDb && typeof matchDb.stock_quantity === "number" ? matchDb.stock_quantity : fp.stockQuantity,
      };
    });

    return NextResponse.json({ success: true, products: merged, dbProducts: dbProducts || [] });
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
    } else if (typeof delta === "number") {
      const res = await adjustStock(matched.id, delta);
      finalStock = res.newStock ?? matched.stock_quantity;
    }

    return NextResponse.json({ success: true, productId: matched.id, stockQuantity: finalStock });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
