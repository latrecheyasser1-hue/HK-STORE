import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface ExpenseItem {
  id: string;
  title: string;
  category: "electricite" | "loyer" | "restauration" | "packaging" | "publicite" | "transport" | "autre";
  amount: number;
  date: string;
  time: string;
  notes?: string;
  createdAt: string;
}

const EXPENSES_FILE = path.join(process.cwd(), "data", "expenses.json");

function readExpenses(): ExpenseItem[] {
  try {
    if (!fs.existsSync(EXPENSES_FILE)) {
      // Default initial representative expenses
      const defaults: ExpenseItem[] = [
        {
          id: "exp-1",
          title: "Loyer Showroom Chlef Centre (Mois en cours)",
          category: "loyer",
          amount: 45000,
          date: "01/09/2026",
          time: "10:00",
          notes: "Règlement loyer boutique Boulevard Mokdad",
          createdAt: new Date().toISOString(),
        },
        {
          id: "exp-2",
          title: "Facture Électricité & Climatisation Sonelgaz",
          category: "electricite",
          amount: 12500,
          date: "10/09/2026",
          time: "14:30",
          notes: "Éclairage vitrines showroom",
          createdAt: new Date().toISOString(),
        },
        {
          id: "exp-3",
          title: "Achat Sachets Kraft & Rubans Cadeaux VIP",
          category: "packaging",
          amount: 8500,
          date: "15/09/2026",
          time: "11:20",
          notes: "Packaging luxe pour coffrets",
          createdAt: new Date().toISOString(),
        },
        {
          id: "exp-4",
          title: "Déjeuner & Restauration Équipe Showroom",
          category: "restauration",
          amount: 3200,
          date: "25/09/2026",
          time: "13:00",
          notes: "Repas midi équipe vente",
          createdAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(EXPENSES_FILE, JSON.stringify(defaults, null, 2), "utf-8");
      return defaults;
    }
    const data = fs.readFileSync(EXPENSES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeExpenses(expenses: ExpenseItem[]) {
  const dir = path.dirname(EXPENSES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2), "utf-8");
}

export async function GET() {
  const expenses = readExpenses();
  return NextResponse.json(
    { success: true, expenses },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, amount, notes, date } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Titre de la dépense requis" }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: "Montant invalide" }, { status: 400 });
    }

    const expenses = readExpenses();
    const now = new Date();
    const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const dateStr = date || now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const newExpense: ExpenseItem = {
      id: "exp-" + Date.now(),
      title: title.trim(),
      category: category || "autre",
      amount: numAmount,
      date: dateStr,
      time: timeStr,
      notes: notes ? notes.trim() : "",
      createdAt: now.toISOString(),
    };

    const updated = [newExpense, ...expenses];
    writeExpenses(updated);

    return NextResponse.json({ success: true, expense: newExpense, expenses: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requis" }, { status: 400 });
    }

    const expenses = readExpenses();
    const filtered = expenses.filter((e) => e.id !== id);
    writeExpenses(filtered);

    return NextResponse.json({ success: true, expenses: filtered });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
