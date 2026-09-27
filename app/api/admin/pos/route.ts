import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getNextUnifiedSequence } from "@/lib/orderSequence";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const POS_FILE = path.join(process.cwd(), "data", "pos_sales.json");

function readPosSales(): any[] {
  try {
    if (!fs.existsSync(POS_FILE)) {
      fs.writeFileSync(POS_FILE, "[]", "utf-8");
      return [];
    }
    const data = fs.readFileSync(POS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writePosSales(sales: any[]) {
  fs.writeFileSync(POS_FILE, JSON.stringify(sales, null, 2), "utf-8");
}

export async function GET() {
  const sales = readPosSales();
  return NextResponse.json({ success: true, sales });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, totalDzd, cashGiven, changeReturned } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Panier vide" },
        { status: 400 }
      );
    }

    // Get the NEXT unified sequence number (continuous with site orders)
    const { seqNumber, formattedId } = await getNextUnifiedSequence();

    const now = new Date();
    const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const newSale = {
      id: formattedId,
      saleNumber: seqNumber,
      date: `Aujourd'hui (${dateStr})`,
      time: timeStr,
      items: items,
      totalDzd: Number(totalDzd || 0),
      cashGiven: Number(cashGiven || totalDzd || 0),
      changeReturned: Number(changeReturned || 0),
      createdAt: now.toISOString(),
    };

    // Save to pos_sales.json
    const sales = readPosSales();
    sales.unshift(newSale);
    writePosSales(sales);

    // Decrement stock in Supabase for each sold item
    for (const it of items) {
      const prodId = it.product?.id;
      const qty = Number(it.quantity || 1);
      if (prodId) {
        try {
          const { data: cur } = await supabaseAdmin
            .from("products")
            .select("stock_quantity")
            .eq("id", prodId)
            .single();

          if (cur && typeof cur.stock_quantity === "number") {
            const nextStock = Math.max(0, cur.stock_quantity - qty);
            await supabaseAdmin
              .from("products")
              .update({ stock_quantity: nextStock })
              .eq("id", prodId);
          }
        } catch (stockErr) {
          console.warn("Stock decrement warning:", stockErr);
        }
      }
    }

    return NextResponse.json({ success: true, sale: newSale });
  } catch (err: any) {
    console.error("Error creating POS sale:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur enregistrement vente" },
      { status: 500 }
    );
  }
}
