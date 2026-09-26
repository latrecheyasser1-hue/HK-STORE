import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();

    if (!query) {
      return NextResponse.json({ error: "Numéro de commande ou de téléphone requis." }, { status: 400 });
    }

    const cleanDigits = query.replace(/\D/g, "");
    let queryBuilder = supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, wilaya_name, commune_name, delivery_type, total_amount, status, yalidine_tracking_code, created_at, order_items(product_title, quantity, unit_price)")
      .order("created_at", { ascending: false })
      .limit(1);

    // Search either by phone or order_number
    if (cleanDigits.length >= 9) {
      // Looks like phone
      queryBuilder = queryBuilder.eq("customer_phone", cleanDigits.startsWith("213") ? "0" + cleanDigits.slice(3) : cleanDigits);
    } else if (cleanDigits.length > 0) {
      // Search by numeric order_number
      queryBuilder = queryBuilder.eq("order_number", parseInt(cleanDigits, 10));
    } else {
      // Search by tracking code
      queryBuilder = queryBuilder.ilike("yalidine_tracking_code", `%${query}%`);
    }

    const { data: orders, error } = await queryBuilder;

    if (error || !orders || orders.length === 0) {
      return NextResponse.json({ found: false, message: "Aucune commande trouvée avec cette référence." }, { status: 404 });
    }

    const order = orders[0];
    const statusStepsMap: Record<string, number> = {
      nouveau: 1,
      confirme: 2,
      expedie: 3,
      livre: 4,
      annule: 0,
      retourne: 0,
    };

    const statusStep = statusStepsMap[order.status] ?? 1;

    return NextResponse.json({
      found: true,
      order: {
        orderId: `HK-${order.order_number}`,
        yalidineTracking: order.yalidine_tracking_code || `YAL-${order.order_number}DZ`,
        recipient: order.customer_name ? `${order.customer_name.slice(0, 3)}***` : "Client Vérifié",
        wilaya: order.wilaya_name,
        commune: order.commune_name,
        status: order.status,
        statusStep: statusStep,
        totalAmount: order.total_amount,
        deliveryType: order.delivery_type,
        date: new Date(order.created_at).toLocaleDateString("fr-FR"),
        items: order.order_items || [],
        timeline: [
          {
            title: "Commande Enregistrée",
            desc: "Votre commande est enregistrée dans le système HK STORE Chlef.",
            time: new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            completed: true,
          },
          {
            title: "Validation Téléphonique",
            desc: "Notre équipe vous appelle pour confirmation d'adresse.",
            time: statusStep >= 2 ? "Confirmé" : "En attente",
            completed: statusStep >= 2,
          },
          {
            title: "Expédié avec Yalidine Express",
            desc: "Colis remis au hub Yalidine vers votre commune/wilaya.",
            time: statusStep >= 3 ? "Expédié" : "En préparation",
            completed: statusStep >= 3,
          },
          {
            title: "Livraison & Droit d'Ouverture",
            desc: "Paiement en espèces à la livraison après avoir inspecté l'article.",
            time: statusStep >= 4 ? "Livré" : "En cours",
            completed: statusStep >= 4,
          },
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur interne" }, { status: 500 });
  }
}
