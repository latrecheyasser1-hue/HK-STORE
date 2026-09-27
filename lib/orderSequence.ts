import fs from "fs";
import path from "path";
import { supabaseAdmin } from "./supabaseAdmin";

const POS_FILE = path.join(process.cwd(), "data", "pos_sales.json");

export function formatUnifiedOrderNumber(num: number): string {
  return "HK-" + String(num).padStart(2, "0");
}

export async function getNextUnifiedSequence(): Promise<{
  seqNumber: number;
  formattedId: string;
}> {
  let highestOrderNum = 0;
  let highestPosNum = 0;

  // 1. Get highest order number from Supabase
  try {
    const { data: latestOrder } = await supabaseAdmin
      .from("orders")
      .select("order_number")
      .order("order_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestOrder && typeof latestOrder.order_number === "number") {
      highestOrderNum = latestOrder.order_number;
    }
  } catch (err) {
    console.error("Failed to query highest order number:", err);
  }

  // 2. Get highest sale number from POS sales file
  try {
    if (fs.existsSync(POS_FILE)) {
      const content = fs.readFileSync(POS_FILE, "utf-8");
      const sales = JSON.parse(content);
      if (Array.isArray(sales)) {
        for (const s of sales) {
          const num = Number(s.saleNumber || (s.id ? String(s.id).replace(/\D/g, "") : 0));
          if (num > highestPosNum) {
            highestPosNum = num;
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to read POS sales file for sequence:", err);
  }

  const currentMax = Math.max(highestOrderNum, highestPosNum);
  const nextSeq = currentMax + 1;

  return {
    seqNumber: nextSeq,
    formattedId: formatUnifiedOrderNumber(nextSeq),
  };
}
