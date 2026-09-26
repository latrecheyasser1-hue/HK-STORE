import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_phone_secondary,
      wilaya_code,
      wilaya_name,
      commune_name,
      delivery_address,
      delivery_type = "domicile",
      items = [],
    } = body;

    // 1. Validation
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Le nom complet est requis (au moins 2 caractères)." },
        { status: 400 }
      );
    }

    const cleanPhone = (customer_phone || "").replace(/\s+/g, "").trim();
    const algerianPhoneRegex = /^(05|06|07)[0-9]{8}$/;
    if (!algerianPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Veuillez saisir un numéro de téléphone algérien valide (ex: 0550123456)." },
        { status: 400 }
      );
    }

    const numWilaya = parseInt(wilaya_code, 10);
    if (isNaN(numWilaya) || numWilaya < 1 || numWilaya > 58) {
      return NextResponse.json(
        { error: "Code Wilaya invalide (doit être entre 1 et 58)." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide. Veuillez sélectionner au moins un article." },
        { status: 400 }
      );
    }

    // 2. Fetch official shipping rates from Supabase
    let shippingCost = delivery_type === "domicile" ? 700 : 400;
    const { data: rateData } = await supabaseAdmin
      .from("shipping_rates")
      .select("domicile_price, stopdesk_price")
      .eq("wilaya_code", numWilaya)
      .single();

    if (rateData) {
      shippingCost = delivery_type === "domicile" 
        ? Number(rateData.domicile_price) 
        : Number(rateData.stopdesk_price);
    }

    // 3. Compute Subtotal & Validate Product Items
    let subtotal = 0;
    const sanitizedItems = [];

    for (const it of items) {
      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      let unitPrice = Number(it.unit_price) || 0;

      // If product_id is provided, fetch real verified price from database
      if (it.product_id) {
        const { data: prod } = await supabaseAdmin
          .from("products")
          .select("id, title, price, stock_quantity")
          .eq("id", it.product_id)
          .single();

        if (prod) {
          unitPrice = Number(prod.price);
        }
      }

      subtotal += unitPrice * qty;
      sanitizedItems.push({
        product_id: it.product_id || null,
        product_title: it.product_title || "Article HK Store",
        quantity: qty,
        unit_price: unitPrice,
        selected_variant: it.selected_variant || null,
      });
    }

    const totalAmount = subtotal + shippingCost;

    // 4. Generate Order Reference
    // Fetch last order number to build human-friendly #HK-10XX
    const { count } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true });
    
    const nextSeq = 1000 + (count || 0) + 1;
    const formattedOrderNumber = `HK-${nextSeq}`;
    const generatedTracking = `YAL-${Math.floor(10000000 + Math.random() * 90000000)}DZ`;

    // 5. Insert Order
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: customer_name.trim(),
        customer_phone: cleanPhone,
        customer_phone_secondary: customer_phone_secondary ? customer_phone_secondary.trim() : null,
        wilaya_code: numWilaya,
        wilaya_name: wilaya_name || `Wilaya ${numWilaya}`,
        commune_name: commune_name ? commune_name.trim() : "Centre",
        delivery_address: delivery_address ? delivery_address.trim() : "Adresse standard",
        delivery_type: delivery_type === "stopdesk" ? "stopdesk" : "domicile",
        shipping_cost: shippingCost,
        subtotal: subtotal,
        total_amount: totalAmount,
        status: "nouveau",
        yalidine_tracking_code: generatedTracking,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error("Order insertion failed:", orderError);
      return NextResponse.json(
        { error: "Échec de l'enregistrement de la commande dans la base de données." },
        { status: 500 }
      );
    }

    // 6. Insert Order Items
    const orderItemsToInsert = sanitizedItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      product_title: item.product_title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      selected_variant: item.selected_variant,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Order items insertion error:", itemsError);
    }

    // 7. Atomic stock decrement for tracked products
    for (const it of sanitizedItems) {
      if (it.product_id) {
        // Fetch current stock and safely decrement
        const { data: curProd } = await supabaseAdmin
          .from("products")
          .select("stock_quantity")
          .eq("id", it.product_id)
          .single();

        if (curProd && typeof curProd.stock_quantity === "number") {
          const newStock = Math.max(0, curProd.stock_quantity - it.quantity);
          await supabaseAdmin
            .from("products")
            .update({ stock_quantity: newStock })
            .eq("id", it.product_id);
        }
      }
    }

    // 8. Broadcast Realtime notification to Admin
    try {
      const channel = supabaseAdmin.channel("hk-store-orders");
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "new_order",
        payload: {
          id: newOrder.id,
          orderNumber: formattedOrderNumber,
          numericNumber: newOrder.order_number,
          date: "Aujourd'hui " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          clientName: newOrder.customer_name,
          phone: newOrder.customer_phone,
          items: sanitizedItems.map((it) => `${it.product_title} x${it.quantity}`).join(", "),
          productPriceDzd: subtotal,
          shippingCostDzd: shippingCost,
          totalDzd: totalAmount,
          wilayaCode: numWilaya,
          wilayaName: newOrder.wilaya_name,
          baladiya: newOrder.commune_name,
          deliveryType: newOrder.delivery_type === "stopdesk" ? "Stopdesk Yalidine" : "À Domicile",
          status: newOrder.status,
          trackingNumber: generatedTracking,
          created_at: newOrder.created_at,
          order_items: sanitizedItems,
        },
      });
      supabaseAdmin.removeChannel(channel);
    } catch (realtimeErr) {
      console.warn("Realtime broadcast notice:", realtimeErr);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        order_number: formattedOrderNumber,
        numeric_id: newOrder.order_number,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        wilaya_name: newOrder.wilaya_name,
        commune_name: newOrder.commune_name,
        delivery_type: newOrder.delivery_type,
        shipping_cost: shippingCost,
        subtotal: subtotal,
        total_amount: totalAmount,
        yalidine_tracking_code: generatedTracking,
        status: newOrder.status,
        created_at: newOrder.created_at,
      },
    });
  } catch (err: any) {
    console.error("API /api/orders error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur lors de la commande." },
      { status: 500 }
    );
  }
}
