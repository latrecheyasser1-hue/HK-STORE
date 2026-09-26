import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const suppliersFilePath = path.join(process.cwd(), "data", "suppliers.json");

function getSuppliersData() {
  try {
    if (!fs.existsSync(suppliersFilePath)) {
      const defaultSuppliers = [
        { id: "sup-1", name: "Horlogerie Prestige Dubaï", phone: "+971 50 892 4110" },
        { id: "sup-2", name: "Parfumerie Grasse & Paris", phone: "+33 6 42 10 99 01" },
        { id: "sup-3", name: "Atelier Maroquinerie Cuir Chlef", phone: "0550 14 28 90" },
        { id: "sup-4", name: "Atelier Écrins & Packaging VIP Alger", phone: "0770 33 55 77" },
      ];
      fs.writeFileSync(suppliersFilePath, JSON.stringify(defaultSuppliers, null, 2), "utf8");
      return defaultSuppliers;
    }
    const raw = fs.readFileSync(suppliersFilePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading suppliers.json:", e);
    return [];
  }
}

function saveSuppliersData(data: any[]) {
  try {
    fs.writeFileSync(suppliersFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing suppliers.json:", e);
  }
}

// GET all suppliers
export async function GET() {
  const data = getSuppliersData();
  return NextResponse.json({ success: true, suppliers: data });
}

// POST: Add new supplier
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone } = body;
    if (!name || !phone) {
      return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 });
    }

    const current = getSuppliersData();
    const newSupplier = {
      id: "sup-" + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
    };

    current.push(newSupplier);
    saveSuppliersData(current);

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

// DELETE: Delete supplier by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requis pour suppression" }, { status: 400 });
    }

    let current = getSuppliersData();
    const updated = current.filter((s: any) => s.id !== id);
    saveSuppliersData(updated);

    return NextResponse.json({ success: true, remaining: updated.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
