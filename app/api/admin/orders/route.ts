import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET all orders for admin
export async function GET() {
  try {
    const { data: rawOrders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin orders:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = (rawOrders || []).map((o: any) => {
      const itemsSummary = (o.order_items || [])
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
        orderNumber: `#HK-${o.order_number}`,
        numericNumber: o.order_number,
        date: dateStr,
        clientName: o.customer_name,
        phone: o.customer_phone,
        items: itemsSummary || "Article HK Store",
        totalDzd: Number(o.total_amount),
        wilayaCode: o.wilaya_code,
        wilayaName: o.wilaya_name,
        baladiya: o.commune_name,
        deliveryType: o.delivery_type === "stopdesk" ? "Stopdesk Yalidine" : "À Domicile",
        status: o.status,
        trackingNumber: o.yalidine_tracking_code || "",
        created_at: o.created_at,
        order_items: o.order_items || [],
      };
    });

    return NextResponse.json({ success: true, orders: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update order status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId et status requis" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete order
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "ID requis pour supprimer" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("orders").delete().eq("id", orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
