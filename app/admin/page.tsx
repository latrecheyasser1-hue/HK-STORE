"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Package,
  Boxes,
  Users,
  TrendingUp,
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Phone,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LogOut,
  Store,
  MapPin,
  X,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  DollarSign,
  Upload,
  ImagePlus,
  Tag,
  Percent,
  History,
  Pencil,
  Bell
} from "lucide-react";
import { FEATURED_PRODUCTS, Product, WILAYAS_DZ, DEPARTMENTS } from "@/data/storeData";
import { supabase } from "@/lib/supabaseClient";

// Security Passcode as requested by the user
const ADMIN_PASSCODE = "765483";

// Mapping: Far3 (Branch/Sub-category) -> Parent Category
// Built from DEPARTMENTS data so admin picks a branch and category auto-derives
const BRANCH_MAP: { branch: string; category: string; categoryArabic: string }[] = DEPARTMENTS.flatMap(
  (dept) =>
    dept.subcategories.map((sub) => ({
      branch: sub.nameFr,
      category: dept.nameFr,
      categoryArabic: sub.nameAr,
    }))
);

interface OrderItemDetail {
  id?: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  image?: string;
  selected_variant?: any;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  clientName: string;
  phone: string;
  items: string;
  totalDzd: number;
  productPriceDzd?: number;
  shippingCostDzd?: number;
  wilayaCode: number;
  wilayaName: string;
  baladiya: string;
  deliveryType: "À Domicile" | "Stopdesk Yalidine";
  status: "nouveau" | "confirme" | "expedie" | "livre" | "annule" | "retour";
  trackingNumber: string;
  order_items?: OrderItemDetail[];
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  type: "commande" | "stock" | "caisse" | "fournisseur";
  details: string;
  amount?: number;
}

interface POSCartItem {
  product: Product;
  quantity: number;
}

interface POSSale {
  id: string; // HK-01, HK-02 ...
  saleNumber: number;
  date: string;
  time: string;
  items: POSCartItem[];
  totalDzd: number;
  cashGiven: number;
  changeReturned: number;
}

const formatPosTicketId = (num: number) => {
  return "HK-" + String(num).padStart(2, "0");
};

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Navigation State (6 tabs)
  const [activeTab, setActiveTab] = useState<
    "orders" | "stock" | "suppliers" | "analytics" | "pos" | "pos_history"
  >("orders");

  // Orders State (Live Realtime from Supabase)
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<AdminOrder | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<AdminOrder | null>(null);

  // Products & Stock State (Can increase and decrease stock)
  const [inventory, setInventory] = useState<Product[]>(FEATURED_PRODUCTS);
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductData, setNewProductData] = useState({
    title: "",
    branch: BRANCH_MAP.length > 0 ? BRANCH_MAP[0].branch : "",
    costPrice: 0,
    sellingPrice: 0,
    genre: "homme" as "homme" | "femme" | "unisex",
    stockQuantity: 1,
    supplierId: "",
    hasDiscount: false,
  });
  const [newProductImages, setNewProductImages] = useState<File[]>([]);

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductBranch, setEditProductBranch] = useState<string>("");
  const [editProductCostPrice, setEditProductCostPrice] = useState<number>(0);
  const [editProductSupplierId, setEditProductSupplierId] = useState<string>("");
  const [editProductImages, setEditProductImages] = useState<File[]>([]);

  // Suppliers State (Nom + Numéro uniquement)
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "sup-1",
      name: "Horlogerie Prestige Dubaï",
      phone: "+971 50 892 4110",
    },
    {
      id: "sup-2",
      name: "Parfumerie Grasse & Paris",
      phone: "+33 6 42 10 99 01",
    },
    {
      id: "sup-3",
      name: "Atelier Maroquinerie Cuir Chlef",
      phone: "0550 14 28 90",
    },
    {
      id: "sup-4",
      name: "Atelier Écrins & Packaging VIP Alger",
      phone: "0770 33 55 77",
    },
  ]);

  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
  });

  // History Log State
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>([
    {
      id: "hist-1",
      timestamp: "Aujourd'hui 15:40",
      action: "Nouvelle Commande COD Enregistrée",
      type: "commande",
      details: "Commande #HK-1085 pour Karim Boukhalfa (Chlef) - 6,300 DZD",
      amount: 6300,
    },
    {
      id: "hist-2",
      timestamp: "Aujourd'hui 14:15",
      action: "Commande Confirmée par Téléphone",
      type: "commande",
      details: "Client #HK-1084 (Amina Zerrouki) confirmée pour expédition Yalidine",
    },
    {
      id: "hist-3",
      timestamp: "Aujourd'hui 12:30",
      action: "Réapprovisionnement Stock Showroom",
      type: "stock",
      details: "Stock augmenté (+6) sur 'Montre Femme Élégance Nacre & Or Rose'",
    },
    {
      id: "hist-4",
      timestamp: "Aujourd'hui 11:45",
      action: "Vente Comptoir Caisse (POS)",
      type: "caisse",
      details: "Vente Showroom Chlef : 1x Coffret Royal Black - Encaissé en Espèces",
      amount: 5800,
    },
    {
      id: "hist-5",
      timestamp: "Hier 18:30",
      action: "Versement Yalidine COD Reçu",
      type: "commande",
      details: "Commande #HK-1082 livrée et encaissée à Constantine - 4,950 DZD",
      amount: 4950,
    },
    {
      id: "hist-6",
      timestamp: "Hier 14:00",
      action: "Paiement Acompte Fournisseur",
      type: "fournisseur",
      details: "Versement acompte pour Atelier Maroquinerie Chlef - 50,000 DZD",
      amount: -50000,
    }
  ]);

  // POS / Cashier State (Point de Vente Showroom Chlef)
  const [posCart, setPosCart] = useState<POSCartItem[]>([]);
  const [posCashGiven, setPosCashGiven] = useState<string>("");
  const [posHistorySearch, setPosHistorySearch] = useState<string>("");
  const [posSales, setPosSales] = useState<POSSale[]>([]);
  const [posSuccessReceipt, setPosSuccessReceipt] = useState<{
    items: POSCartItem[];
    total: number;
    cash: number;
    change: number;
    date: string;
    ticketId: string;
  } | null>(null);

  // Play notification chime using Web Audio API (Zero external MP3 dependency)
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("Audio chime prevented:", e);
    }
  };

  const fetchRealOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error loading real orders from Supabase:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Check Session & load Suppliers and Orders with Realtime on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("hk_admin_session");
      if (stored === "authenticated") {
        setIsAuthenticated(true);
      }

      // 1. Instant load suppliers from localStorage
      const cachedSuppliers = localStorage.getItem("hk_admin_suppliers");
      if (cachedSuppliers !== null) {
        try {
          setSuppliers(JSON.parse(cachedSuppliers));
        } catch (e) {}
      }

      // 2. Sync suppliers with persistent server API
      fetch("/api/admin/suppliers")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.suppliers)) {
            setSuppliers(data.suppliers);
            localStorage.setItem("hk_admin_suppliers", JSON.stringify(data.suppliers));
          }
        })
        .catch((err) => console.error("Failed to sync suppliers from server", err));

      // 3. Load persistent POS sales
      fetch("/api/admin/pos")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.sales)) {
            setPosSales(data.sales);
          }
        })
        .catch((err) => console.error("Failed to load POS sales:", err));

      // 4. Load initial real orders from Supabase
      fetchRealOrders();

      // 4. Supabase Realtime Channel - Listen for live incoming orders
      const channel = supabase
        .channel("hk-store-orders")
        .on("broadcast", { event: "new_order" }, (payload: any) => {
          const newOrd = payload?.payload;
          if (!newOrd) return;
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrd.id)) return prev;
            return [newOrd, ...prev];
          });
          playOrderChime();
          setRealtimeNotification(`Nouvelle Commande Directe : ${newOrd.orderNumber} - ${newOrd.clientName} (${Number(newOrd.totalDzd).toLocaleString()} DZD)`);
          setTimeout(() => setRealtimeNotification(null), 9000);
        })
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          () => {
            fetchRealOrders();
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders" },
          () => {
            fetchRealOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Handle Passcode Unlock
  const handlePasscodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setPinError("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hk_admin_session", "authenticated");
      }
    } else {
      setPinError("Code d'accès incorrect. Veuillez saisir le code valide.");
      setPinInput("");
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pinInput.length < 6) {
      const newPin = pinInput + val;
      setPinInput(newPin);
      if (newPin.length === 6) {
        if (newPin === ADMIN_PASSCODE) {
          setIsAuthenticated(true);
          setPinError("");
          if (typeof window !== "undefined") {
            sessionStorage.setItem("hk_admin_session", "authenticated");
          }
        } else {
          setPinError("Code d'accès incorrect. Veuillez saisir le code valide.");
          setPinInput("");
        }
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hk_admin_session");
    }
  };

  // Stock adjustments
  const handleStockDelta = (productId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(0, item.stockQuantity + delta);
          // Add to history log
          setHistoryLog((h) => [
            {
              id: "hist-" + Date.now(),
              timestamp: "À l'instant",
              action: delta > 0 ? "Augmentation Stock (+)" : "Diminution Stock (-)",
              type: "stock",
              details: `Stock de '${item.title}' ajusté à ${newQty} pièces (${delta > 0 ? "+" + delta : delta})`,
            },
            ...h,
          ]);
          return { ...item, stockQuantity: newQty };
        }
        return item;
      })
    );
  };

  // Add product to stock
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.title) return;
    // Derive category from selected branch
    const branchInfo = BRANCH_MAP.find((b) => b.branch === newProductData.branch);
    const imageUrl =
      newProductImages.length > 0
        ? URL.createObjectURL(newProductImages[0])
        : "/images/hk-womens-watch.jpg";
    const newProd: Product = {
      id: "prod-" + Date.now(),
      title: newProductData.title,
      subtitleArabic: "منتج جديد تمت إضافته للمخزون",
      category: branchInfo?.category || "Montres",
      categoryArabic: branchInfo?.categoryArabic || "ساعات",
      price: Number(newProductData.sellingPrice || newProductData.costPrice),
      rating: 5,
      reviewsCount: 0,
      image: imageUrl,
      stockQuantity: Number(newProductData.stockQuantity),
      description: "Nouveau produit ajouté via la console administrative.",
      gender: newProductData.genre,
    };
    setInventory([newProd, ...inventory]);
    setHistoryLog((h) => [
      {
        id: "hist-" + Date.now(),
        timestamp: "À l'instant",
        action: "Ajout Nouveau Produit",
        type: "stock",
        details: `Produit '${newProd.title}' ajouté avec ${newProd.stockQuantity} pièces (${branchInfo?.branch || "N/A"})`,
      },
      ...h,
    ]);
    setShowAddProductModal(false);
    setNewProductData({
      title: "",
      branch: BRANCH_MAP.length > 0 ? BRANCH_MAP[0].branch : "",
      costPrice: 0,
      sellingPrice: 0,
      genre: "homme",
      stockQuantity: 1,
      supplierId: "",
      hasDiscount: false,
    });
    setNewProductImages([]);
  };

  // Open edit modal for product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    const matchedBranch =
      BRANCH_MAP.find((b) => b.category === prod.category)?.branch ||
      (BRANCH_MAP[0]?.branch ?? "");
    setEditProductBranch(matchedBranch);
    setEditProductCostPrice(Math.round(prod.price * 0.7));
    setEditProductSupplierId("");
    setEditProductImages([]);
  };

  // Save edited product
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const branchInfo = BRANCH_MAP.find((b) => b.branch === editProductBranch);
    const updatedImage =
      editProductImages.length > 0
        ? URL.createObjectURL(editProductImages[0])
        : editingProduct.image;

    const updatedProd: Product = {
      ...editingProduct,
      category: branchInfo?.category || editingProduct.category,
      categoryArabic: branchInfo?.categoryArabic || editingProduct.categoryArabic,
      image: updatedImage,
      price: Number(editingProduct.price),
      stockQuantity: Number(editingProduct.stockQuantity),
      gender: editingProduct.gender,
    };

    setInventory((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );

    setHistoryLog((h) => [
      {
        id: "hist-" + Date.now(),
        timestamp: "À l'instant",
        action: "Modification Produit",
        type: "stock",
        details: `Produit '${updatedProd.title}' mis à jour (Prix: ${updatedProd.price.toLocaleString()} DZD, Stock: ${updatedProd.stockQuantity})`,
      },
      ...h,
    ]);

    setEditingProduct(null);
    setEditProductImages([]);
  };

  // Update order status - Synced to Supabase
  const handleUpdateOrderStatus = async (orderId: string, newStatus: AdminOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrderDetails((prev) =>
      prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
    );
    setHistoryLog((h) => [
      {
        id: "hist-" + Date.now(),
        timestamp: "À l'instant",
        action: "Statut Commande Modifié",
        type: "commande",
        details: `Commande ${orderId} passée au statut '${newStatus.toUpperCase()}'`,
      },
      ...h,
    ]);

    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update order status in DB:", e);
    }
  };

  // Delete Order - Synced to Supabase
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette commande ?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setSelectedOrderDetails((prev) => (prev && prev.id === orderId ? null : prev));
    try {
      await fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete order from DB:", e);
    }
  };

  // Add Supplier (Nom + Numéro) - Persistent across reloads
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim() || !newSupplier.phone.trim()) return;
    const supName = newSupplier.name.trim();
    const supPhone = newSupplier.phone.trim();
    const tempId = "sup-" + Date.now();

    const newSupItem: Supplier = {
      id: tempId,
      name: supName,
      phone: supPhone,
    };

    const updated = [...suppliers, newSupItem];
    setSuppliers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hk_admin_suppliers", JSON.stringify(updated));
    }

    setShowAddSupplierModal(false);
    setNewSupplier({ name: "", phone: "" });

    // Sync to backend
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: supName, phone: supPhone }),
      });
      const data = await res.json();
      if (data.success && data.supplier) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === tempId ? data.supplier : s))
        );
      }
    } catch (err) {
      console.error("Error saving supplier to backend:", err);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hk_admin_suppliers", JSON.stringify(updated));
    }

    // Sync deletion to backend
    try {
      await fetch(`/api/admin/suppliers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting supplier from backend:", err);
    }
  };

  // POS operations
  const addToPosCart = (prod: Product) => {
    setPosCart((prev) => {
      const exists = prev.find((item) => item.product.id === prod.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === prod.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const updatePosCartQty = (prodId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === prodId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const posTotal = posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const posCash = Number(posCashGiven) || 0;
  const posChange = posCash >= posTotal ? posCash - posTotal : 0;

  const handleValidatePosSale = async () => {
    if (posCart.length === 0) return;
    try {
      const res = await fetch("/api/admin/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: posCart,
          totalDzd: posTotal,
          cashGiven: posCash || posTotal,
          changeReturned: posChange,
        }),
      });
      const data = await res.json();
      if (data.success && data.sale) {
        const newSale = data.sale;
        setPosSales((prev) => [newSale, ...prev]);

        const ticket = {
          items: [...posCart],
          total: posTotal,
          cash: posCash || posTotal,
          change: posChange,
          date: `${newSale.date} ${newSale.time}`,
          ticketId: newSale.id,
        };
        setPosSuccessReceipt(ticket);
        posCart.forEach((cItem) => {
          handleStockDelta(cItem.product.id, -cItem.quantity);
        });
        setHistoryLog((h) => [
          {
            id: "hist-" + Date.now(),
            timestamp: "À l'instant",
            action: "Vente Caisse Showroom Chlef (POS)",
            type: "caisse",
            details: `Ticket ${newSale.id} : ${ticket.items.length} articles • Encaissé ${posTotal.toLocaleString()} DZD`,
            amount: posTotal,
          },
          ...h,
        ]);
        setPosCart([]);
        setPosCashGiven("");
      }
    } catch (e) {
      console.error("Failed to record POS sale:", e);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase();
    const matchesSearch =
      o.clientName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.wilayaName.toLowerCase().includes(q) ||
      o.baladiya.toLowerCase().includes(q) ||
      o.items.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filtered Stock
  const filteredStock = inventory.filter((p) => {
    const q = stockSearchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  // Filtered POS History
  const filteredPosSales = posSales.filter((sale) => {
    const q = posHistorySearch.toLowerCase();
    return (
      sale.id.toLowerCase().includes(q) ||
      sale.items.some((it) => it.product.title.toLowerCase().includes(q))
    );
  });

  // ==========================================
  // VIEW 1: PASSCODE LOCK SCREEN (PIN 765483)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-[#FFFFFF] flex flex-col items-center justify-center p-4 selection:bg-[#C5A880] selection:text-[#0A0A0C]">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-md bg-[#121316] border border-[#27272A] p-6 sm:p-8 shadow-2xl relative z-10">
          {/* Brand Logo & Security Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/images/hk-logo-dark.png"
              alt="HK Store Chlef"
              className="h-12 w-auto object-contain mb-3"
            />
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1F2128] border border-[#27272A] text-[#C5A880] text-[10px] font-heading font-extrabold uppercase tracking-widest mt-1">
              <Lock className="w-3.5 h-3.5" />
              <span>ESPACE DE GESTION ADMINISTRATIVE</span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-2 font-heading font-bold uppercase tracking-wider">
              SHOWROOM CHLEF • ACCÈS STRICTEMENT RÉSERVÉ
            </p>
          </div>

          {/* PIN Input Display */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <div className="flex justify-center items-center gap-3 my-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-9 h-11 border flex items-center justify-center font-mono font-bold text-lg transition-all ${
                      pinInput.length > i
                        ? "border-[#C5A880] bg-[#C5A880]/10 text-[#C5A880]"
                        : "border-[#27272A] bg-[#18191E] text-transparent"
                    }`}
                  >
                    {pinInput.length > i ? "•" : ""}
                  </div>
                ))}
              </div>

              {/* Direct Keyboard Input */}
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPinInput(val);
                  if (val.length === 6 && val === ADMIN_PASSCODE) {
                    setIsAuthenticated(true);
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem("hk_admin_session", "authenticated");
                    }
                  }
                }}
                placeholder="Entrez le code à 6 chiffres"
                autoFocus
                className="w-full h-11 px-3 bg-[#18191E] border border-[#27272A] text-center font-mono font-bold text-base text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none tracking-widest placeholder:text-[#52525B]"
              />
            </div>

            {pinError && (
              <div className="p-3 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* On-screen Luxury Keypad for PC & Touch */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(String(digit))}
                  className="h-11 bg-[#18191E] hover:bg-[#27272A] active:bg-[#C5A880] active:text-[#0A0A0C] border border-[#27272A] font-mono font-bold text-base text-[#FFFFFF] transition-colors"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinInput("")}
                className="h-11 bg-[#18191E] hover:bg-[#DC2626]/20 border border-[#27272A] font-heading font-bold text-xs uppercase text-[#EF4444] transition-colors"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="h-11 bg-[#18191E] hover:bg-[#27272A] border border-[#27272A] font-mono font-bold text-base text-[#FFFFFF] transition-colors"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPinInput((p) => p.slice(0, -1))}
                className="h-11 bg-[#18191E] hover:bg-[#27272A] border border-[#27272A] font-heading font-bold text-xs uppercase text-[#A1A1AA] transition-colors"
              >
                ←
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#C5A880] hover:bg-[#D4BA94] text-[#0A0A0C] font-heading font-extrabold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>DÉVERROUILLER LA CONSOLE</span>
            </button>
          </form>

          {/* Footer Hint */}
          <div className="mt-6 pt-4 border-t border-[#1F2128] text-center">
            <span className="text-[11px] text-[#71717A] font-sans">
              Code confidentiel Showroom Chlef (6 chiffres)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD (PC-OPTIMIZED)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0F1015] text-[#F4F4F5] flex flex-col font-sans selection:bg-[#C5A880] selection:text-[#0A0A0C]">
      {/* Realtime Live Floating Notification */}
      {realtimeNotification && (
        <div className="fixed top-5 right-5 z-[999] bg-[#0A0A0C] border-2 border-[#10B981] text-[#FFFFFF] px-5 py-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-bounce max-w-md">
          <div className="w-3.5 h-3.5 rounded-full bg-[#10B981] animate-ping shrink-0" />
          <div className="flex-1">
            <span className="font-heading font-extrabold text-[11px] text-[#10B981] uppercase tracking-wider block">
              🔔 NOUVELLE COMMANDE REÇUE
            </span>
            <p className="text-xs font-mono text-[#FFFFFF] mt-0.5">{realtimeNotification}</p>
          </div>
          <button
            onClick={() => setRealtimeNotification(null)}
            className="text-[#71717A] hover:text-[#FFFFFF] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout: Desktop Sidebar + Dynamic Tab View */}
      <div className="flex-1 flex overflow-hidden min-h-screen">
        {/* Sleek Sidebar Navigation */}
        <aside className="w-64 bg-[#0A0A0C] border-r border-[#1E2028] flex flex-col justify-between shrink-0 p-3 select-none">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-heading font-black uppercase tracking-[0.25em] text-[#71717A]">
              MODULES DE GESTION
            </div>

            {/* 1. Commandes */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                activeTab === "orders"
                  ? "bg-[#18191E] text-[#FFFFFF] border-[#C5A880] shadow-sm"
                  : "bg-transparent text-[#A1A1AA] border-transparent hover:bg-[#121316] hover:text-[#FFFFFF]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className={`w-4 h-4 ${activeTab === "orders" ? "text-[#C5A880]" : "text-[#71717A]"}`} />
                <span>Commandes</span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#C5A880] text-[#0A0A0C] font-mono font-bold text-[10px]">
                {orders.length}
              </span>
            </button>

            {/* 2. Stock */}
            <button
              onClick={() => setActiveTab("stock")}
              className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                activeTab === "stock"
                  ? "bg-[#18191E] text-[#FFFFFF] border-[#C5A880] shadow-sm"
                  : "bg-transparent text-[#A1A1AA] border-transparent hover:bg-[#121316] hover:text-[#FFFFFF]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Boxes className={`w-4 h-4 ${activeTab === "stock" ? "text-[#C5A880]" : "text-[#71717A]"}`} />
                <span>Stock</span>
              </div>
              <span className="font-mono text-[11px] text-[#A1A1AA]">
                {inventory.length} réf.
              </span>
            </button>

            {/* 3. Fournisseurs */}
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                activeTab === "suppliers"
                  ? "bg-[#18191E] text-[#FFFFFF] border-[#C5A880] shadow-sm"
                  : "bg-transparent text-[#A1A1AA] border-transparent hover:bg-[#121316] hover:text-[#FFFFFF]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-4 h-4 ${activeTab === "suppliers" ? "text-[#C5A880]" : "text-[#71717A]"}`} />
                <span>Fournisseurs</span>
              </div>
              <span className="font-mono text-[11px] text-[#A1A1AA]">
                {suppliers.length}
              </span>
            </button>

            {/* 4. Analytique */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                activeTab === "analytics"
                  ? "bg-[#18191E] text-[#FFFFFF] border-[#C5A880] shadow-sm"
                  : "bg-transparent text-[#A1A1AA] border-transparent hover:bg-[#121316] hover:text-[#FFFFFF]"
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className={`w-4 h-4 ${activeTab === "analytics" ? "text-[#C5A880]" : "text-[#71717A]"}`} />
                <span>Analytique</span>
              </div>
            </button>

            {/* 5. POS & Historique Showroom Chlef */}
            <div className="pt-3">
              <div className="px-3 py-1.5 text-[10px] font-heading font-black uppercase tracking-[0.25em] text-[#C5A880]">
                VENTE AU SHOWROOM
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => setActiveTab("pos")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                    activeTab === "pos"
                      ? "bg-[#C5A880] text-[#0A0A0C] border-[#C5A880] font-black shadow-md"
                      : "bg-[#18191E] text-[#FFFFFF] border-[#27272A] hover:border-[#C5A880]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Receipt className={`w-4 h-4 ${activeTab === "pos" ? "text-[#0A0A0C]" : "text-[#C5A880]"}`} />
                    <span>Caisse POS</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest">CHLEF</span>
                </button>

                <button
                  onClick={() => setActiveTab("pos_history")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border transition-all ${
                    activeTab === "pos_history"
                      ? "bg-[#18191E] text-[#FFFFFF] border-[#C5A880] shadow-sm"
                      : "bg-transparent text-[#A1A1AA] border-transparent hover:bg-[#121316] hover:text-[#FFFFFF]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <History className={`w-4 h-4 ${activeTab === "pos_history" ? "text-[#C5A880]" : "text-[#71717A]"}`} />
                    <span>Historique POS</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#27272A] text-[#C5A880] font-mono font-bold text-[10px]">
                    {posSales.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Store Profile Box */}
          <div className="p-3 bg-[#121316] border border-[#1E2028] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1F2128] border border-[#27272A] flex items-center justify-center font-heading font-bold text-xs text-[#C5A880] shrink-0">
                HK
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-heading font-bold uppercase text-[#FFFFFF] truncate">
                  Gérant Showroom
                </span>
                <span className="block text-[10px] text-[#71717A] truncate font-mono">
                  Code: 765483 • Chlef
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#71717A] hover:text-[#EF4444] hover:bg-[#DC2626]/10 rounded transition-colors shrink-0"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0F1015]">
          
          {/* ======================================================= */}
          {/* TAB 1: COMMANDES (TABLE WITH EXACT REQUESTED COLUMNS) */}
          {/* ======================================================= */}
          {activeTab === "orders" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22242B]">
                <div>
                  <h1 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-[#FFFFFF]">
                    Gestion des Commandes & Expéditions
                  </h1>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
                    Suivi en temps r&eacute;el des commandes clients, exp&eacute;ditions Yalidine et livraisons.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchRealOrders}
                    disabled={isLoadingOrders}
                    className="h-8 px-3 bg-[#18191E] border border-[#27272A] hover:border-[#C5A880] text-xs text-[#A1A1AA] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin text-[#C5A880]" : ""}`} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs & Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121316] p-4 border border-[#22242B]">
                {/* Status Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: "all", label: "Toutes", count: orders.length },
                    { id: "nouveau", label: "Nouvelles", count: orders.filter((o) => o.status === "nouveau").length },
                    { id: "confirme", label: "Confirmées", count: orders.filter((o) => o.status === "confirme").length },
                    { id: "expedie", label: "Expédiées", count: orders.filter((o) => o.status === "expedie").length },
                    { id: "livre", label: "Livrées", count: orders.filter((o) => o.status === "livre").length },
                    { id: "retour", label: "Retours", count: orders.filter((o) => o.status === "retour").length },
                    { id: "annule", label: "Annulées", count: orders.filter((o) => o.status === "annule").length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      className={`h-8 px-3 text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${
                        orderStatusFilter === tab.id
                          ? "bg-[#C5A880] text-[#0A0A0C] border-[#C5A880]"
                          : "bg-[#18191E] text-[#A1A1AA] border-[#27272A] hover:text-[#FFFFFF]"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Chercher client, tél, wilaya..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-[#18191E] border border-[#27272A] text-xs font-sans text-[#FFFFFF] placeholder:text-[#52525B] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              {/* Exact Table Requested by User */}
              <div className="bg-[#121316] border border-[#22242B] overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0A0C] text-[#C5A880] uppercase tracking-wider font-heading font-extrabold border-b border-[#22242B] text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Commande</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Numéro</th>
                      <th className="py-3 px-4">Articles</th>
                      <th className="py-3 px-4">Wilaya</th>
                      <th className="py-3 px-4">Baladiya</th>
                      <th className="py-3 px-4">Naw3 Tawssiil</th>
                      <th className="py-3 px-4 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2128]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-14 text-center text-[#71717A]">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <span className="font-heading font-extrabold text-xs text-[#A1A1AA] uppercase tracking-wider">
                              AUCUNE COMMANDE POUR LE MOMENT
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="hover:bg-[#18191E] transition-colors cursor-pointer group"
                        >
                          {/* 1. N° Commande */}
                          <td className="py-3 px-4 font-mono font-bold text-[#FFFFFF] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#C5A880] group-hover:text-[#F3E8D0] group-hover:underline transition-colors">
                                #{ord.orderNumber}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#71717A] font-sans font-normal block">
                              {ord.date}
                            </span>
                          </td>

                          {/* 2. Nom Client */}
                          <td className="py-3 px-4 font-heading font-bold text-[#FFFFFF] whitespace-nowrap">
                            {ord.clientName}
                          </td>

                          {/* 3. Numéro */}
                          <td
                            className="py-3 px-4 font-mono text-[#C5A880] whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={`tel:${ord.phone.replace(/\s+/g, "")}`}
                              className="inline-flex items-center gap-1.5 hover:underline"
                            >
                              <Phone className="w-3 h-3 text-[#10B981]" />
                              <span>{ord.phone}</span>
                            </a>
                          </td>

                          {/* 4. Articles */}
                          <td className="py-3 px-4 min-w-[200px]">
                            <div className="font-sans font-medium text-[#E4E4E7]">
                              {ord.items}
                            </div>
                            <span className="font-mono font-bold text-[#C5A880] text-[11px] block mt-0.5">
                              {(ord.productPriceDzd || (ord.totalDzd > 600 ? ord.totalDzd - 500 : ord.totalDzd)).toLocaleString()} DZD
                            </span>
                          </td>

                          {/* 5. Wilaya */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-[#1F2128] border border-[#27272A] font-heading font-bold text-[#E4E4E7]">
                              {String(ord.wilayaCode).padStart(2, "0")} - {ord.wilayaName}
                            </span>
                          </td>

                          {/* 6. Baladiya */}
                          <td className="py-3 px-4 font-sans text-[#D4D4D8] whitespace-nowrap">
                            {ord.baladiya}
                          </td>

                          {/* 7. Naw3 Tawssiil */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider border ${
                                ord.deliveryType === "À Domicile"
                                    ? "bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/30"
                                    : "bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/30"
                              }`}
                            >
                              {ord.deliveryType}
                            </span>
                          </td>

                          {/* 8. Statut & Actions */}
                          <td
                            className="py-3 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(ord.id, e.target.value as AdminOrder["status"])
                                }
                                className={`h-7 px-2 border text-[10px] font-heading font-bold uppercase tracking-wider focus:outline-none bg-[#18191E] ${
                                  ord.status === "nouveau"
                                    ? "text-[#F59E0B] border-[#F59E0B]/40"
                                    : ord.status === "confirme"
                                    ? "text-[#3B82F6] border-[#3B82F6]/40"
                                    : ord.status === "expedie"
                                    ? "text-[#8B5CF6] border-[#8B5CF6]/40"
                                    : ord.status === "livre"
                                    ? "text-[#10B981] border-[#10B981]/40"
                                    : ord.status === "retour"
                                    ? "text-[#F43F5E] border-[#F43F5E]/40"
                                    : "text-[#EF4444] border-[#EF4444]/40"
                                }`}
                              >
                                <option value="nouveau">Nouveau</option>
                                <option value="confirme">Confirmé</option>
                                <option value="expedie">Expédié Yalidine</option>
                                <option value="livre">Livré (Encaissé)</option>
                                <option value="retour">Retour</option>
                                <option value="annule">Annulé</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(ord.id)}
                                className="p-1.5 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/30 text-[#EF4444] transition-colors cursor-pointer"
                                title="Supprimer la commande"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: STOCK (AUGMENTER ET DIMINUER LES PRODUITS) */}
          {/* ======================================================= */}
          {activeTab === "stock" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22242B]">
                <div>
                  <h1 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-[#FFFFFF]">
                    Gestion du Stock & Inventaire
                  </h1>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
                    Gestion des quantit&eacute;s, entr&eacute;es en stock et r&eacute;f&eacute;rencement catalogue.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="h-9 px-4 bg-[#C5A880] hover:bg-[#D4BA94] text-[#0A0A0C] font-heading font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Ajouter un Produit</span>
                  </button>
                </div>
              </div>

              {/* Stock KPI summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Total Références
                  </span>
                  <span className="font-heading font-black text-2xl text-[#FFFFFF] mt-1 block">
                    {inventory.length}
                  </span>
                </div>
                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Pièces en Stock
                  </span>
                  <span className="font-heading font-black text-2xl text-[#10B981] mt-1 block">
                    {inventory.reduce((sum, p) => sum + p.stockQuantity, 0)}
                  </span>
                </div>
                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Valeur Marchande (DZD)
                  </span>
                  <span className="font-mono font-bold text-xl text-[#C5A880] mt-1 block">
                    {inventory
                      .reduce((sum, p) => sum + p.price * p.stockQuantity, 0)
                      .toLocaleString()}{" "}
                    DZD
                  </span>
                </div>
                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Stock Faible (&lt; 4 pièces)
                  </span>
                  <span className="font-heading font-black text-2xl text-[#F59E0B] mt-1 block">
                    {inventory.filter((p) => p.stockQuantity < 4).length}
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-[#121316] p-4 border border-[#22242B] flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Chercher produit ou catégorie..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-[#18191E] border border-[#27272A] text-xs font-sans text-[#FFFFFF] placeholder:text-[#52525B] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
                <span className="text-xs font-mono text-[#71717A]">
                  {filteredStock.length} articles listés
                </span>
              </div>

              {/* Stock Table */}
              <div className="bg-[#121316] border border-[#22242B] overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0A0C] text-[#C5A880] uppercase tracking-wider font-heading font-extrabold border-b border-[#22242B] text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">Prix Public</th>
                      <th className="py-3 px-4">État Stock</th>
                      <th className="py-3 px-4 text-center">Quantité & Ajustement (+/-)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2128]">
                    {filteredStock.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#18191E] transition-colors">
                        {/* Article with image */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#18191E] border border-[#27272A] shrink-0 overflow-hidden">
                              <img
                                src={prod.image}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-heading font-bold text-xs text-[#FFFFFF] block truncate max-w-xs">
                                {prod.title}
                              </span>
                              <span className="font-mono text-[10px] text-[#71717A] uppercase">
                                Réf: {prod.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Catégorie */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs text-[#D4D4D8] font-heading uppercase">
                            {prod.category}
                          </span>
                        </td>

                        {/* Prix */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-[#C5A880]">
                          {prod.price.toLocaleString()} DZD
                        </td>

                        {/* État */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {prod.stockQuantity > 5 ? (
                            <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30 text-[10px] font-heading font-bold uppercase tracking-wider">
                              En Stock
                            </span>
                          ) : prod.stockQuantity > 0 ? (
                            <span className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/30 text-[10px] font-heading font-bold uppercase tracking-wider">
                              Stock Limité ({prod.stockQuantity})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/30 text-[10px] font-heading font-bold uppercase tracking-wider">
                              Rupture
                            </span>
                          )}
                        </td>

                        {/* Direct Stock +/- Controls (User requirement: yziid oo ynaa9es) */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <div className="inline-flex items-center border border-[#27272A] bg-[#18191E] p-0.5">
                            <button
                              type="button"
                              onClick={() => handleStockDelta(prod.id, -1)}
                              className="w-8 h-7 flex items-center justify-center text-[#EF4444] hover:bg-[#27272A] font-bold text-sm transition-colors"
                              title="Diminuer de 1 (-)"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-mono font-black text-sm text-[#FFFFFF]">
                              {prod.stockQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStockDelta(prod.id, 1)}
                              className="w-8 h-7 flex items-center justify-center text-[#10B981] hover:bg-[#27272A] font-bold text-sm transition-colors"
                              title="Augmenter de 1 (+)"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 bg-[#18191E] hover:bg-[#C5A880]/20 border border-[#27272A] hover:border-[#C5A880] text-[#C5A880] inline-flex items-center transition-colors mr-2 cursor-pointer"
                            title="Modifier le produit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/product/${prod.id}`}
                            target="_blank"
                            className="p-1.5 bg-[#18191E] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF] inline-flex items-center transition-colors mr-2"
                            title="Voir sur le site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Confirmez-vous la suppression de ${prod.title} ?`)) {
                                setInventory(inventory.filter((p) => p.id !== prod.id));
                              }
                            }}
                            className="p-1.5 bg-[#18191E] hover:bg-[#DC2626]/20 border border-[#27272A] text-[#EF4444] inline-flex items-center transition-colors"
                            title="Supprimer la référence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: LES FOURNISSEURS */}
          {/* ======================================================= */}
          {activeTab === "suppliers" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22242B]">
                <div>
                  <h1 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-[#FFFFFF]">
                    Répertoire des Fournisseurs
                  </h1>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
                    Gestion des contacts directs avec les partenaires et grossistes.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddSupplierModal(true)}
                  className="h-9 px-4 bg-[#C5A880] hover:bg-[#D4BA94] text-[#0A0A0C] font-heading font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nouveau Fournisseur</span>
                </button>
              </div>

              <div className="bg-[#121316] border border-[#22242B] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0A0C] border-b border-[#22242B] text-[10px] font-heading font-black uppercase tracking-wider text-[#71717A]">
                      <tr>
                        <th className="px-6 py-3.5 w-16">#</th>
                        <th className="px-6 py-3.5">Nom du Fournisseur</th>
                        <th className="px-6 py-3.5">Num&eacute;ro de T&eacute;l&eacute;phone</th>
                        <th className="px-6 py-3.5 text-right w-64">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2128]">
                      {suppliers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-xs text-[#71717A]">
                            Aucun fournisseur enregistré pour le moment.
                          </td>
                        </tr>
                      ) : (
                        suppliers.map((sup, idx) => (
                          <tr key={sup.id} className="hover:bg-[#18191E] transition-colors">
                            <td className="px-6 py-4 font-mono text-[#71717A] text-xs">
                              {String(idx + 1).padStart(2, "0")}
                            </td>
                            <td className="px-6 py-4 font-heading font-bold text-sm text-[#FFFFFF] uppercase tracking-wide">
                              {sup.name}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-sm text-[#C5A880]">
                              {sup.phone}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`tel:${sup.phone.replace(/[^0-9+]/g, "")}`}
                                  className="px-3 py-1.5 bg-[#18191E] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-[#FFFFFF] flex items-center gap-1.5 transition-colors"
                                  title="Appeler"
                                >
                                  <Phone className="w-3.5 h-3.5 text-[#10B981]" />
                                  <span>Appeler</span>
                                </a>
                                <a
                                  href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 text-xs font-heading font-bold uppercase text-[#34D399] flex items-center gap-1.5 transition-colors"
                                  title="WhatsApp"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSupplier(sup.id)}
                                  className="p-1.5 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/30 text-[#EF4444] transition-colors cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: ANALYTIQUE (CHIFFRE D'AFFAIRES & STATS) */}
          {/* ======================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="pb-4 border-b border-[#22242B]">
                <h1 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-[#FFFFFF]">
                  Tableau de Bord Analytique & Performances
                </h1>
                <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
                  Indicateurs cl&eacute;s de performance, chiffre d&apos;affaires et volume des ventes.
                </p>
              </div>

              {/* Main Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121316] border border-[#22242B] p-5">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Chiffre d'Affaires Réalisé
                  </span>
                  <span className="font-heading font-black text-2xl text-[#C5A880] mt-1 block">
                    1,480,000 DZD
                  </span>
                  <span className="text-[11px] text-[#10B981] font-sans block mt-1">
                    ↑ +22.4% vs mois dernier
                  </span>
                </div>

                <div className="bg-[#121316] border border-[#22242B] p-5">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Commandes Confirmées
                  </span>
                  <span className="font-heading font-black text-2xl text-[#FFFFFF] mt-1 block">
                    284 Colis
                  </span>
                  <span className="text-[11px] text-[#10B981] font-sans block mt-1">
                    Taux confirmation: 96.8%
                  </span>
                </div>

                <div className="bg-[#121316] border border-[#22242B] p-5">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Panier Moyen (AOV)
                  </span>
                  <span className="font-heading font-black text-2xl text-[#FFFFFF] mt-1 block">
                    5,210 DZD
                  </span>
                  <span className="text-[11px] text-[#A1A1AA] font-sans block mt-1">
                    Coffrets & Montres en tête
                  </span>
                </div>

                <div className="bg-[#121316] border border-[#22242B] p-5">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Taux Livraison Yalidine
                  </span>
                  <span className="font-heading font-black text-2xl text-[#10B981] mt-1 block">
                    94.2%
                  </span>
                  <span className="text-[11px] text-[#71717A] font-sans block mt-1">
                    Retours maîtrisés &lt; 5.8%
                  </span>
                </div>
              </div>

              {/* Geographical & Category breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Wilayas */}
                <div className="bg-[#121316] border border-[#22242B] p-5">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#FFFFFF] pb-3 border-b border-[#1F2128]">
                    Top Wilayas les Plus Rentables
                  </h3>
                  <div className="mt-4 space-y-3">
                    {[
                      { wilaya: "02 - Chlef (Boutique & Showroom)", percent: 85, amount: "480,000 DZD" },
                      { wilaya: "16 - Alger (Livraison Express)", percent: 70, amount: "390,000 DZD" },
                      { wilaya: "31 - Oran (Ouest)", percent: 55, amount: "280,000 DZD" },
                      { wilaya: "25 - Constantine & Sétif", percent: 40, amount: "190,000 DZD" },
                      { wilaya: "09 - Blida & Tipaza", percent: 30, amount: "140,000 DZD" },
                    ].map((item) => (
                      <div key={item.wilaya}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#E4E4E7] font-semibold">{item.wilaya}</span>
                          <span className="font-mono text-[#C5A880] font-bold">{item.amount}</span>
                        </div>
                        <div className="w-full bg-[#18191E] h-2">
                          <div
                            className="bg-[#C5A880] h-2 transition-all duration-500"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories distribution */}
                <div className="bg-[#121316] border border-[#22242B] p-5">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#FFFFFF] pb-3 border-b border-[#1F2128]">
                    Répartition par Univers
                  </h3>
                  <div className="mt-4 space-y-3">
                    {[
                      { name: "Coffrets Cadeaux VIP", pct: "38%", volume: "108 ventes" },
                      { name: "Montres Hommes & Femmes", pct: "32%", volume: "91 ventes" },
                      { name: "Haute Parfumerie & Extraits", pct: "16%", volume: "45 ventes" },
                      { name: "Maroquinerie & Sacs Cuir", pct: "9%", volume: "25 ventes" },
                      { name: "Lunettes Polarisées", pct: "5%", volume: "15 ventes" },
                    ].map((cat) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between p-2.5 bg-[#18191E] border border-[#27272A] text-xs"
                      >
                        <span className="font-heading font-bold uppercase text-[#FFFFFF]">{cat.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#71717A] text-[11px]">{cat.volume}</span>
                          <span className="font-mono font-bold text-[#C5A880]">{cat.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 5: POS (CAISSE POINT DE VENTE SHOWROOM CHLEF) */}
          {/* ======================================================= */}
          {activeTab === "pos" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="pb-4 border-b border-[#22242B] flex items-center justify-between">
                <div>
                  <h1 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-[#FFFFFF] flex items-center gap-2">
                    <Store className="w-6 h-6 text-[#C5A880]" />
                    <span>Caisse Point de Vente (POS) • Showroom Chlef</span>
                  </h1>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
                    Terminal d&apos;encaissement showroom, gestion du panier et &eacute;mission des re&ccedil;us.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("pos_history")}
                  className="h-9 px-3.5 bg-[#18191E] hover:bg-[#27272A] border border-[#27272A] text-xs font-heading font-bold uppercase tracking-wider text-[#C5A880] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  <span>Historique POS ({posSales.length})</span>
                </button>
              </div>

              {/* POS Interface: 2 Columns (Catalog Grid on Left + Live Register on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 cols: Fast catalog selector */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-[#121316] p-3 border border-[#22242B] flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#71717A]" />
                    <input
                      type="text"
                      placeholder="Scanner ou taper le nom de l'article..."
                      className="w-full bg-transparent text-xs text-[#FFFFFF] placeholder:text-[#52525B] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                    {inventory.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => addToPosCart(prod)}
                        className="bg-[#121316] hover:bg-[#18191E] border border-[#22242B] hover:border-[#C5A880] p-3 text-left transition-all flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="aspect-square w-full bg-[#18191E] border border-[#27272A] overflow-hidden mb-2">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <span className="font-heading text-[9px] uppercase tracking-wider text-[#C5A880] block">
                            {prod.category}
                          </span>
                          <h4 className="font-heading font-bold text-xs text-[#FFFFFF] line-clamp-1 mt-0.5">
                            {prod.title}
                          </h4>
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1F2128]">
                            <span className="font-mono font-black text-xs text-[#FFFFFF]">
                              {prod.price.toLocaleString()} DZD
                            </span>
                            <span className="text-[10px] font-mono text-[#71717A]">
                              Qté: {prod.stockQuantity}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right 5 cols: Active Register Ticket */}
                <div className="lg:col-span-5 bg-[#121316] border border-[#22242B] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#22242B]">
                      <span className="font-heading font-black text-sm uppercase text-[#FFFFFF]">
                        Ticket de Caisse Showroom
                      </span>
                      {posCart.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPosCart([])}
                          className="text-[10px] font-heading uppercase font-bold text-[#EF4444] hover:underline"
                        >
                          Vider le ticket
                        </button>
                      )}
                    </div>

                    {/* Cart Items List */}
                    <div className="divide-y divide-[#1F2128] my-4 max-h-72 overflow-y-auto">
                      {posCart.length === 0 ? (
                        <div className="py-12 text-center text-[#71717A] text-xs font-heading uppercase">
                          Aucun article sélectionné. Touchez un produit à gauche pour l'ajouter.
                        </div>
                      ) : (
                        posCart.map((item) => (
                          <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h5 className="font-heading font-bold text-xs text-[#FFFFFF] truncate">
                                {item.product.title}
                              </h5>
                              <span className="text-[10px] font-mono text-[#C5A880]">
                                {item.product.price.toLocaleString()} DZD x {item.quantity}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => updatePosCartQty(item.product.id, -1)}
                                className="w-6 h-6 bg-[#18191E] border border-[#27272A] text-[#EF4444] flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-mono font-bold text-xs text-[#FFFFFF]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updatePosCartQty(item.product.id, 1)}
                                className="w-6 h-6 bg-[#18191E] border border-[#27272A] text-[#10B981] flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>

                            <span className="w-20 text-right font-mono font-bold text-xs text-[#FFFFFF]">
                              {(item.product.price * item.quantity).toLocaleString()} DZD
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Payment & Cash Calculation */}
                  <div className="pt-4 border-t border-[#22242B] space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-heading font-extrabold uppercase text-[#71717A]">
                        TOTAL À PAYER:
                      </span>
                      <span className="font-mono font-black text-2xl text-[#C5A880]">
                        {posTotal.toLocaleString()} DZD
                      </span>
                    </div>

                    {/* Cash Given Input */}
                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                        Montant Reçu en Espèces (DZD) :
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 10000"
                        value={posCashGiven}
                        onChange={(e) => setPosCashGiven(e.target.value)}
                        className="w-full h-10 px-3 bg-[#18191E] border border-[#27272A] font-mono font-bold text-sm text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                      />
                    </div>

                    {/* Change Calculation */}
                    {posCash > 0 && (
                      <div className="p-3 bg-[#18191E] border border-[#27272A] flex justify-between items-center text-xs">
                        <span className="font-heading font-bold uppercase text-[#A1A1AA]">
                          Monnaie à Rendre :
                        </span>
                        <span
                          className={`font-mono font-extrabold text-lg ${
                            posCash >= posTotal ? "text-[#10B981]" : "text-[#EF4444]"
                          }`}
                        >
                          {posCash >= posTotal
                            ? `${posChange.toLocaleString()} DZD`
                            : `Manque ${(posTotal - posCash).toLocaleString()} DZD`}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={posCart.length === 0}
                      onClick={handleValidatePosSale}
                      className="w-full h-12 bg-[#C5A880] hover:bg-[#D4BA94] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0C] font-heading font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>ENCAISSER & IMPRIMER TICKET</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 6: HISTORIQUE POS (VENTES SHOWROOM UNIQUEMENT) */}
          {/* ======================================================= */}
          {activeTab === "pos_history" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22242B]">
                <div>
                  <h1 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-[#FFFFFF] flex items-center gap-2">
                    <History className="w-6 h-6 text-[#C5A880]" />
                    <span>Historique des Ventes POS • Showroom Chlef</span>
                  </h1>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
                    Registre des ventes en magasin : tickets num&eacute;rot&eacute;s de HK-01 &agrave; HK-99999999999.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("pos")}
                  className="h-9 px-4 bg-[#C5A880] hover:bg-[#D4BA94] text-[#0A0A0C] font-heading font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4 stroke-[2.5]" />
                  <span>Nouvelle Vente Caisse</span>
                </button>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Tickets &Eacute;mis (Total)
                  </span>
                  <span className="font-heading font-black text-2xl text-[#FFFFFF] mt-1 block">
                    {posSales.length}
                  </span>
                </div>

                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Recette Showroom POS
                  </span>
                  <span className="font-heading font-black text-2xl text-[#C5A880] mt-1 block">
                    {posSales.reduce((acc, s) => acc + s.totalDzd, 0).toLocaleString()} DZD
                  </span>
                </div>

                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Panier Moyen Caisse
                  </span>
                  <span className="font-heading font-black text-2xl text-[#FFFFFF] mt-1 block">
                    {posSales.length > 0
                      ? Math.round(
                          posSales.reduce((acc, s) => acc + s.totalDzd, 0) / posSales.length
                        ).toLocaleString()
                      : 0}{" "}
                    DZD
                  </span>
                </div>

                <div className="bg-[#121316] border border-[#22242B] p-4">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#71717A] block">
                    Dernier Ticket
                  </span>
                  <span className="font-mono font-black text-2xl text-[#C5A880] mt-1 block">
                    {posSales[0]?.id || "—"}
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121316] p-4 border border-[#22242B]">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher ticket (ex: HK-01), article..."
                    value={posHistorySearch}
                    onChange={(e) => setPosHistorySearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
                <div className="text-xs text-[#71717A] font-mono">
                  {filteredPosSales.length} ticket(s) enregistr&eacute;(s)
                </div>
              </div>

              {/* POS Sales Table */}
              <div className="bg-[#121316] border border-[#22242B] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0A0C] border-b border-[#22242B] text-[10px] font-heading font-black uppercase tracking-wider text-[#71717A]">
                      <tr>
                        <th className="px-6 py-3.5">N&deg; Ticket</th>
                        <th className="px-6 py-3.5">Date & Heure</th>
                        <th className="px-6 py-3.5">Articles Vendus</th>
                        <th className="px-6 py-3.5">Montant Total</th>
                        <th className="px-6 py-3.5">Paiement / Monnaie</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2128]">
                      {filteredPosSales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#71717A]">
                            Aucun ticket de caisse trouv&eacute; dans l&apos;historique.
                          </td>
                        </tr>
                      ) : (
                        filteredPosSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-[#18191E] transition-colors">
                            {/* N° Ticket */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono font-black text-sm text-[#C5A880] tracking-wider">
                                {sale.id}
                              </span>
                            </td>

                            {/* Date & Heure */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-xs text-[#FFFFFF]">{sale.date}</div>
                              <div className="font-mono text-[10px] text-[#71717A]">{sale.time}</div>
                            </td>

                            {/* Articles */}
                            <td className="px-6 py-4">
                              <div className="space-y-1 max-w-sm">
                                {sale.items.map((it, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-[#E4E4E7] flex items-center justify-between gap-4"
                                  >
                                    <span className="truncate">{it.product.title}</span>
                                    <span className="font-mono text-[#C5A880] font-bold shrink-0">
                                      x{it.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Montant Total */}
                            <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-sm text-[#FFFFFF]">
                              {sale.totalDzd.toLocaleString()} DZD
                            </td>

                            {/* Paiement */}
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                              <div className="text-[#A1A1AA]">
                                Re&ccedil;u: {sale.cashGiven.toLocaleString()} DZD
                              </div>
                              {sale.changeReturned > 0 ? (
                                <div className="text-[#10B981] font-semibold text-[11px]">
                                  Rendu: +{sale.changeReturned.toLocaleString()} DZD
                                </div>
                              ) : (
                                <div className="text-[#71717A] text-[10px]">Compte exact</div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() =>
                                  setPosSuccessReceipt({
                                    items: sale.items,
                                    total: sale.totalDzd,
                                    cash: sale.cashGiven,
                                    change: sale.changeReturned,
                                    date: `${sale.date} ${sale.time}`,
                                    ticketId: sale.id,
                                  })
                                }
                                className="px-3 py-1.5 bg-[#18191E] hover:bg-[#27272A] border border-[#27272A] hover:border-[#C5A880] text-xs font-heading font-bold uppercase tracking-wider text-[#C5A880] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Voir et R&eacute;imprimer le Ticket"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Ticket</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ======================================================= */}
      {/* MODAL: ADD PRODUCT TO STOCK */}
      {/* ======================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121316] border border-[#27272A] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-heading font-bold text-sm uppercase text-[#FFFFFF]">
                Ajouter un Produit au Stock
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddProductModal(false);
                  setNewProductImages([]);
                }}
                className="text-[#71717A] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-4 text-xs">
              {/* Nom du Produit */}
              <div>
                <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coffret VIP Black Edition"
                  value={newProductData.title}
                  onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                  className="w-full h-9 px-3 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              {/* Far3 (Branch) + Genre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Sous-Categorie *
                  </label>
                  <select
                    value={newProductData.branch}
                    onChange={(e) => setNewProductData({ ...newProductData, branch: e.target.value })}
                    className="w-full h-9 px-2 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                  >
                    {BRANCH_MAP.map((b) => (
                      <option key={b.branch} value={b.branch}>
                        {b.branch}
                      </option>
                    ))}
                  </select>
                  {/* Auto-derived category display */}
                  {newProductData.branch && (
                    <p className="text-[10px] text-[#C5A880] mt-1 font-medium">
                      Categorie : {BRANCH_MAP.find((b) => b.branch === newProductData.branch)?.category || "—"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Genre *
                  </label>
                  <div className="flex gap-1 mt-0.5">
                    {(["homme", "femme", "unisex"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setNewProductData({ ...newProductData, genre: g })}
                        className={`flex-1 h-9 text-[10px] font-heading font-bold uppercase tracking-wider border transition-colors ${
                          newProductData.genre === g
                            ? "bg-[#C5A880] text-[#0A0A0C] border-[#C5A880]"
                            : "bg-[#18191E] text-[#71717A] border-[#27272A] hover:text-[#FFFFFF] hover:border-[#3F3F46]"
                        }`}
                      >
                        {g === "homme" ? "Homme" : g === "femme" ? "Femme" : "Unisex"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prix de Revient & Prix de Vente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Prix de Revient (Gros) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="0"
                      value={newProductData.costPrice || ""}
                      onChange={(e) => setNewProductData({ ...newProductData, costPrice: Number(e.target.value) })}
                      className="w-full h-9 px-3 pr-12 bg-[#18191E] border border-[#27272A] text-xs font-mono text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#71717A] font-heading font-bold">DZD</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Prix de Vente (D&eacute;tail / Site) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="0"
                      value={newProductData.sellingPrice || ""}
                      onChange={(e) => setNewProductData({ ...newProductData, sellingPrice: Number(e.target.value) })}
                      className="w-full h-9 px-3 pr-12 bg-[#18191E] border border-[#27272A] text-xs font-mono text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#71717A] font-heading font-bold">DZD</span>
                  </div>
                  {newProductData.sellingPrice > 0 && newProductData.costPrice > 0 && (
                    <p className={`text-[10px] mt-1 font-mono font-medium ${
                      newProductData.sellingPrice >= newProductData.costPrice ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}>
                      {newProductData.sellingPrice >= newProductData.costPrice
                        ? `Marge b\u00e9n\u00e9ficiaire : +${(newProductData.sellingPrice - newProductData.costPrice).toLocaleString()} DZD`
                        : `D\u00e9ficit : ${(newProductData.sellingPrice - newProductData.costPrice).toLocaleString()} DZD`}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantite en Stock + Fournisseur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Quantite en Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProductData.stockQuantity}
                    onChange={(e) =>
                      setNewProductData({ ...newProductData, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full h-9 px-3 bg-[#18191E] border border-[#27272A] text-xs font-mono text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Fournisseur
                  </label>
                  <select
                    value={newProductData.supplierId}
                    onChange={(e) => setNewProductData({ ...newProductData, supplierId: e.target.value })}
                    className="w-full h-9 px-2 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                  >
                    <option value="">-- Aucun --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Promotion / Remise */}
              <div>
                <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                  Promotion / Remise
                </label>
                <button
                  type="button"
                  onClick={() => setNewProductData({ ...newProductData, hasDiscount: !newProductData.hasDiscount })}
                  className={`w-full h-9 flex items-center justify-center gap-2 text-[10px] font-heading font-bold uppercase tracking-wider border transition-colors ${
                    newProductData.hasDiscount
                      ? "bg-[#C5A880]/15 text-[#C5A880] border-[#C5A880]"
                      : "bg-[#18191E] text-[#71717A] border-[#27272A] hover:text-[#FFFFFF] hover:border-[#3F3F46]"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  {newProductData.hasDiscount ? "Promotion Active" : "Ajouter Promotion"}
                </button>
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                  Images du Produit *
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Preview uploaded images */}
                  {newProductImages.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 border border-[#27272A] bg-[#18191E] group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewProductImages((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#DC2626] text-[#FFFFFF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload button */}
                  <label className="w-20 h-20 border border-dashed border-[#3F3F46] bg-[#18191E] flex flex-col items-center justify-center cursor-pointer hover:border-[#C5A880] transition-colors">
                    <ImagePlus className="w-5 h-5 text-[#71717A]" />
                    <span className="text-[9px] text-[#71717A] mt-1 font-heading font-bold">UPLOAD</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          setNewProductImages((prev) => [...prev, ...Array.from(e.target.files!)]);
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[9px] text-[#52525B] mt-1">
                  Formats accept&eacute;s : JPG, PNG, WEBP
                </p>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#27272A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setNewProductImages([]);
                  }}
                  className="h-9 px-4 bg-[#18191E] text-[#A1A1AA] font-heading font-bold uppercase text-xs hover:text-[#FFFFFF] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-9 px-6 bg-[#C5A880] text-[#0A0A0C] font-heading font-bold uppercase text-xs cursor-pointer hover:bg-[#D4BA94] transition-colors"
                >
                  Enregistrer au Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: EDIT PRODUCT IN STOCK */}
      {/* ======================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121316] border border-[#27272A] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-heading font-bold text-sm uppercase text-[#FFFFFF]">
                  Modifier le Produit
                </h3>
                <span className="font-mono text-xs text-[#C5A880] font-bold">
                  ({editingProduct.id})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setEditProductImages([]);
                }}
                className="text-[#71717A] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="mt-4 space-y-4 text-xs">
              {/* Nom du Produit */}
              <div>
                <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, title: e.target.value })
                  }
                  className="w-full h-9 px-3 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              {/* Sous-Categorie + Genre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Sous-Cat&eacute;gorie *
                  </label>
                  <select
                    value={editProductBranch}
                    onChange={(e) => setEditProductBranch(e.target.value)}
                    className="w-full h-9 px-2 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                  >
                    {BRANCH_MAP.map((b) => (
                      <option key={b.branch} value={b.branch}>
                        {b.branch}
                      </option>
                    ))}
                  </select>
                  {editProductBranch && (
                    <p className="text-[10px] text-[#C5A880] mt-1 font-medium">
                      Cat&eacute;gorie : {BRANCH_MAP.find((b) => b.branch === editProductBranch)?.category || editingProduct.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Genre *
                  </label>
                  <div className="flex gap-1 mt-0.5">
                    {(["homme", "femme", "unisex"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          setEditingProduct({ ...editingProduct, gender: g })
                        }
                        className={`flex-1 h-9 text-[10px] font-heading font-bold uppercase tracking-wider border transition-colors ${
                          (editingProduct.gender || "homme") === g
                            ? "bg-[#C5A880] text-[#0A0A0C] border-[#C5A880]"
                            : "bg-[#18191E] text-[#71717A] border-[#27272A] hover:text-[#FFFFFF] hover:border-[#3F3F46]"
                        }`}
                      >
                        {g === "homme" ? "Homme" : g === "femme" ? "Femme" : "Unisex"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prix de Revient & Prix de Vente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Prix de Revient (Gros)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={editProductCostPrice || ""}
                      onChange={(e) => setEditProductCostPrice(Number(e.target.value))}
                      className="w-full h-9 px-3 pr-12 bg-[#18191E] border border-[#27272A] text-xs font-mono text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#71717A] font-heading font-bold">DZD</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Prix de Vente (D&eacute;tail / Site) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingProduct.price || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full h-9 px-3 pr-12 bg-[#18191E] border border-[#27272A] text-xs font-mono text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#71717A] font-heading font-bold">DZD</span>
                  </div>
                  {editingProduct.price > 0 && editProductCostPrice > 0 && (
                    <p className={`text-[10px] mt-1 font-mono font-medium ${
                      editingProduct.price >= editProductCostPrice ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}>
                      {editingProduct.price >= editProductCostPrice
                        ? `Marge estimée : +${(editingProduct.price - editProductCostPrice).toLocaleString()} DZD`
                        : `Déficit : ${(editingProduct.price - editProductCostPrice).toLocaleString()} DZD`}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantite en Stock + Fournisseur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Quantit&eacute; en Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 bg-[#18191E] border border-[#27272A] text-xs font-mono text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                    Fournisseur
                  </label>
                  <select
                    value={editProductSupplierId}
                    onChange={(e) => setEditProductSupplierId(e.target.value)}
                    className="w-full h-9 px-2 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                  >
                    <option value="">-- Aucun --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                  Image du Produit
                </label>
                <div className="flex items-center gap-3">
                  {/* Current image */}
                  <div className="relative w-20 h-20 border border-[#27272A] bg-[#18191E] overflow-hidden">
                    <img
                      src={
                        editProductImages.length > 0
                          ? URL.createObjectURL(editProductImages[0])
                          : editingProduct.image
                      }
                      alt={editingProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Upload replacement image */}
                  <label className="h-20 px-4 border border-dashed border-[#3F3F46] bg-[#18191E] flex flex-col items-center justify-center cursor-pointer hover:border-[#C5A880] transition-colors">
                    <Upload className="w-5 h-5 text-[#71717A]" />
                    <span className="text-[10px] text-[#71717A] mt-1 font-heading font-bold uppercase">
                      Changer l&apos;image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setEditProductImages([e.target.files[0]]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#27272A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setEditProductImages([]);
                  }}
                  className="h-9 px-4 bg-[#18191E] text-[#A1A1AA] font-heading font-bold uppercase text-xs hover:text-[#FFFFFF] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-9 px-6 bg-[#C5A880] text-[#0A0A0C] font-heading font-bold uppercase text-xs cursor-pointer hover:bg-[#D4BA94] transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: ADD SUPPLIER */}
      {/* ======================================================= */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121316] border border-[#27272A] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-heading font-bold text-sm uppercase text-[#FFFFFF]">
                Nouveau Fournisseur Partenaire
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="text-[#71717A] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                  Nom du Fournisseur *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manufacture Horlogère / Hadj Rachid"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full h-10 px-3 bg-[#18191E] border border-[#27272A] text-xs text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-heading uppercase text-[#A1A1AA] mb-1 font-bold">
                  Num&eacute;ro de T&eacute;l&eacute;phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0550 XX XX XX"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  className="w-full h-10 px-3 bg-[#18191E] border border-[#27272A] text-xs font-mono text-[#FFFFFF] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="h-9 px-4 bg-[#18191E] text-[#A1A1AA] font-heading font-bold uppercase text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#C5A880] hover:bg-[#D4BA94] text-[#0A0A0C] font-heading font-bold uppercase text-xs cursor-pointer transition-colors"
                >
                  Ajouter Fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: CARTE DÉTAILLÉE DE LA COMMANDE (AVEC PHOTOS) */}
      {/* ======================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-[#000000]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#121316] border border-[#27272A] rounded-2xl shadow-2xl p-5 sm:p-7 text-[#FFFFFF] relative my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-5 border-b border-[#22242B]">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-[#C5A880] tracking-wider">
                    #{selectedOrderDetails.orderNumber}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-heading font-bold uppercase tracking-wider rounded border ${
                      selectedOrderDetails.status === "nouveau"
                        ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                        : selectedOrderDetails.status === "confirme"
                        ? "bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/30"
                        : selectedOrderDetails.status === "expedie"
                        ? "bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/30"
                        : selectedOrderDetails.status === "livre"
                        ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                        : selectedOrderDetails.status === "retour"
                        ? "bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30"
                        : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                    }`}
                  >
                    {selectedOrderDetails.status === "nouveau"
                      ? "Nouveau (En attente confirmation)"
                      : selectedOrderDetails.status === "confirme"
                      ? "Confirmé par téléphone"
                      : selectedOrderDetails.status === "expedie"
                      ? "Expédié (En cours de livraison)"
                      : selectedOrderDetails.status === "livre"
                      ? "Livré & Encaissé"
                      : selectedOrderDetails.status === "retour"
                      ? "Colis Retourné"
                      : "Annulé"}
                  </span>
                </div>
                <p className="text-xs text-[#71717A] font-sans">
                  Enregistrée le {selectedOrderDetails.date}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="w-9 h-9 rounded-lg bg-[#1F2128] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#FFFFFF] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 2 Cols: Client & Expédition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
              {/* Client Card */}
              <div className="bg-[#18191E] border border-[#27272A] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Informations Client
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-heading font-bold text-[#FFFFFF]">
                    {selectedOrderDetails.clientName}
                  </p>
                  <p className="font-mono text-sm text-[#C5A880]">
                    {selectedOrderDetails.phone}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${selectedOrderDetails.phone.replace(/\s+/g, "")}`}
                    className="flex-1 h-9 px-3 bg-[#1F2128] hover:bg-[#27272A] border border-[#2E3039] rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 text-[#10B981] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appeler</span>
                  </a>
                  <a
                    href={`https://wa.me/213${selectedOrderDetails.phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                      `Salam Alaykoum ${selectedOrderDetails.clientName}, c'est HK STORE Chlef concernant votre commande #${selectedOrderDetails.orderNumber}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 h-9 px-3 bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 text-[#10B981] transition-colors"
                  >
                    <span>💬 WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Livraison Card */}
              <div className="bg-[#18191E] border border-[#27272A] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Destination & Expédition
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold border ${
                      selectedOrderDetails.deliveryType === "À Domicile"
                        ? "bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/20"
                        : "bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/20"
                    }`}
                  >
                    {selectedOrderDetails.deliveryType}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-sans font-medium text-[#FFFFFF] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>
                      {selectedOrderDetails.baladiya} ({String(selectedOrderDetails.wilayaCode).padStart(2, "0")} - {selectedOrderDetails.wilayaName})
                    </span>
                  </p>
                  <p className="text-xs text-[#71717A] pl-5 font-mono">
                    N° Suivi Yalidine : {selectedOrderDetails.trackingNumber}
                  </p>
                </div>
                <div className="pt-2">
                  <div className="p-2 bg-[#121316] border border-[#22242B] rounded-lg flex items-center justify-between text-xs">
                    <span className="text-[#A1A1AA]">Frais de livraison :</span>
                    <span className="font-mono font-bold text-[#E4E4E7]">
                      {(selectedOrderDetails.shippingCostDzd || 0).toLocaleString()} DZD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Details with PHOTOS */}
            <div className="my-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Contenu de la commande (Articles & Photos)
                </span>
                <span className="text-xs text-[#71717A] font-mono">
                  {selectedOrderDetails.order_items?.length || 1} article(s)
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedOrderDetails.order_items && selectedOrderDetails.order_items.length > 0 ? (
                  selectedOrderDetails.order_items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-[#18191E] border border-[#22242B] rounded-xl hover:border-[#2E3039] transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg bg-[#0A0A0C] border border-[#2E3039] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.product_title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Package className="w-7 h-7 text-[#71717A]" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-bold text-sm text-[#FFFFFF] truncate">
                          {item.product_title}
                        </h4>
                        {item.selected_variant && (
                          <p className="text-xs text-[#A1A1AA] mt-0.5 truncate">
                            Variante : {typeof item.selected_variant === "object" ? JSON.stringify(item.selected_variant) : String(item.selected_variant)}
                          </p>
                        )}
                        <p className="text-xs text-[#71717A] font-mono mt-1">
                          Quantité : <span className="text-[#FFFFFF] font-bold">x{item.quantity}</span> à{" "}
                          <span className="text-[#C5A880]">{item.unit_price?.toLocaleString()} DZD</span>
                        </p>
                      </div>

                      {/* Total line */}
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-base text-[#FFFFFF] block">
                          {((item.unit_price || 0) * (item.quantity || 1)).toLocaleString()} DZD
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-[#18191E] border border-[#22242B] rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#FFFFFF]">
                        {selectedOrderDetails.items}
                      </h4>
                      <p className="text-xs text-[#71717A]">
                        Prix produit : {(selectedOrderDetails.productPriceDzd || selectedOrderDetails.totalDzd).toLocaleString()} DZD
                      </p>
                    </div>
                    <span className="font-mono font-bold text-[#FFFFFF]">
                      {(selectedOrderDetails.productPriceDzd || selectedOrderDetails.totalDzd).toLocaleString()} DZD
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#0A0A0C] border border-[#22242B] rounded-xl space-y-2 my-5">
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Sous-total articles :</span>
                <span className="font-mono text-[#FFFFFF]">
                  {(
                    selectedOrderDetails.productPriceDzd ||
                    selectedOrderDetails.totalDzd - (selectedOrderDetails.shippingCostDzd || 0)
                  ).toLocaleString()}{" "}
                  DZD
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Livraison ({selectedOrderDetails.deliveryType}) :</span>
                <span className="font-mono text-[#FFFFFF]">
                  {(selectedOrderDetails.shippingCostDzd || 0).toLocaleString()} DZD
                </span>
              </div>
              <div className="pt-2 border-t border-[#22242B] flex justify-between items-center">
                <div>
                  <span className="font-heading font-black text-sm uppercase tracking-wide text-[#FFFFFF] block">
                    Total Net COD (Cash à la livraison)
                  </span>
                  <span className="text-[10px] text-[#10B981] font-sans font-medium">
                    Autorisation d'inspection avant paiement
                  </span>
                </div>
                <span className="font-mono font-black text-2xl text-[#C5A880]">
                  {selectedOrderDetails.totalDzd.toLocaleString()} DZD
                </span>
              </div>
            </div>

            {/* Quick Status Buttons & Actions */}
            <div className="pt-4 border-t border-[#22242B] space-y-3">
              <div>
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#71717A] block mb-2">
                  Changer rapidement l'état :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, "nouveau")}
                    className={`h-8 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      selectedOrderDetails.status === "nouveau"
                        ? "bg-[#F59E0B] text-[#000000] border-[#F59E0B]"
                        : "bg-[#18191E] text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/10"
                    }`}
                  >
                    Nouveau
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, "confirme")}
                    className={`h-8 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      selectedOrderDetails.status === "confirme"
                        ? "bg-[#3B82F6] text-[#FFFFFF] border-[#3B82F6]"
                        : "bg-[#18191E] text-[#60A5FA] border-[#3B82F6]/30 hover:bg-[#3B82F6]/10"
                    }`}
                  >
                    Confirmé
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, "expedie")}
                    className={`h-8 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      selectedOrderDetails.status === "expedie"
                        ? "bg-[#8B5CF6] text-[#FFFFFF] border-[#8B5CF6]"
                        : "bg-[#18191E] text-[#A78BFA] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10"
                    }`}
                  >
                    Expédié
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, "livre")}
                    className={`h-8 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      selectedOrderDetails.status === "livre"
                        ? "bg-[#10B981] text-[#000000] border-[#10B981]"
                        : "bg-[#18191E] text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/10"
                    }`}
                  >
                    Livré
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, "retour")}
                    className={`h-8 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      selectedOrderDetails.status === "retour"
                        ? "bg-[#F43F5E] text-[#FFFFFF] border-[#F43F5E]"
                        : "bg-[#18191E] text-[#F43F5E] border-[#F43F5E]/30 hover:bg-[#F43F5E]/10"
                    }`}
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, "annule")}
                    className={`h-8 px-2 rounded text-[11px] font-heading font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      selectedOrderDetails.status === "annule"
                        ? "bg-[#EF4444] text-[#FFFFFF] border-[#EF4444]"
                        : "bg-[#18191E] text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                    }`}
                  >
                    Annulé
                  </button>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#22242B]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="h-10 px-4 rounded-lg bg-[#1F2128] hover:bg-[#27272A] font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForInvoice(selectedOrderDetails);
                  }}
                  className="h-10 px-5 rounded-lg bg-[#C5A880] hover:bg-[#D4AF37] text-[#0A0A0C] font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer Bordereau Yalidine</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: YALIDINE SHIPPING SLIP & INVOICE */}
      {/* ======================================================= */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#FFFFFF] text-[#0A0A0C] p-6 shadow-2xl border-2 border-[#0A0A0C]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0A0A0C]">
              <div>
                <span className="font-heading font-black text-base uppercase">
                  BORDEREAU D'EXPÉDITION YALIDINE • HK STORE
                </span>
                <span className="block font-mono text-xs text-[#6B7280]">
                  Réf: {selectedOrderForInvoice.orderNumber} • {selectedOrderForInvoice.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-[#6B7280] hover:text-[#0A0A0C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 grid grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-3 bg-[#F4F4F5] border border-[#E4E4E7]">
                <span className="text-[10px] font-heading font-bold uppercase text-[#71717A] block">
                  EXPÉDITEUR:
                </span>
                <span className="font-heading font-bold text-xs block text-[#0A0A0C]">
                  HK STORE CHLEF
                </span>
                <span className="text-[#4B5563] text-[11px] block">
                  Marché Karkoud, Zenket Zwawa, Chlef
                </span>
                <span className="font-mono text-[#0A0A0C] font-bold block mt-1">
                  Tél: 0550 XX XX XX
                </span>
              </div>

              <div className="p-3 bg-[#F4F4F5] border border-[#E4E4E7]">
                <span className="text-[10px] font-heading font-bold uppercase text-[#71717A] block">
                  DESTINATAIRE:
                </span>
                <span className="font-heading font-bold text-xs block text-[#0A0A0C]">
                  {selectedOrderForInvoice.clientName}
                </span>
                <span className="text-[#4B5563] text-[11px] block">
                  {selectedOrderForInvoice.baladiya}, Wilaya {selectedOrderForInvoice.wilayaName} ({selectedOrderForInvoice.wilayaCode})
                </span>
                <span className="font-mono text-[#0A0A0C] font-bold block mt-1">
                  Tél: {selectedOrderForInvoice.phone}
                </span>
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-[#0A0A0C] my-4 text-center">
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#71717A] block">
                MONTANT CASH À RÉCUPÉRER (PAIEMENT COD) :
              </span>
              <span className="font-mono font-black text-2xl text-[#0A0A0C] block mt-1">
                {selectedOrderForInvoice.totalDzd.toLocaleString()} DZD
              </span>
              <span className="font-heading text-[10px] uppercase font-bold text-[#10B981] block mt-1">
                AUTORISATION OUVERTURE DU COLIS & INSPECTION AVANT PAIEMENT
              </span>
            </div>

            <div className="text-xs space-y-1 my-3">
              <span className="font-heading font-bold uppercase text-[10px] text-[#71717A]">
                Articles commandés :
              </span>
              <p className="font-semibold">{selectedOrderForInvoice.items}</p>
            </div>

            <div className="pt-3 border-t border-[#E4E4E7] flex justify-between items-center">
              <span className="font-mono text-xs text-[#71717A]">
                Code suivi : {selectedOrderForInvoice.trackingNumber}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-9 px-4 bg-[#0A0A0C] text-[#FFFFFF] font-heading font-bold uppercase text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer Bordereau</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: POS TICKET DE CAISSE SHOWROOM */}
      {/* ======================================================= */}
      {posSuccessReceipt && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FFFFFF] text-[#0A0A0C] p-6 shadow-2xl border-2 border-[#0A0A0C] font-mono text-xs">
            <div className="text-center pb-3 border-b-2 border-dashed border-[#0A0A0C]">
              <span className="font-heading font-black text-base uppercase block">
                HK STORE CHLEF
              </span>
              <span className="text-[10px] text-[#6B7280] uppercase block">
                Showroom Luxe & Horlogerie
              </span>
              <span className="text-[10px] text-[#6B7280] block">
                Zenket Zwawa, Chlef Centre
              </span>
              <span className="text-[10px] text-[#6B7280] block">
                Ticket: {posSuccessReceipt.ticketId} • {posSuccessReceipt.date}
              </span>
            </div>

            <div className="divide-y divide-dashed divide-[#E5E7EB] my-3">
              {posSuccessReceipt.items.map((it, i) => (
                <div key={i} className="py-1.5 flex justify-between">
                  <span className="truncate max-w-[180px]">{it.product.title} x{it.quantity}</span>
                  <span className="font-bold">{(it.product.price * it.quantity).toLocaleString()} DZD</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t-2 border-[#0A0A0C] space-y-1">
              <div className="flex justify-between font-black text-sm">
                <span>TOTAL:</span>
                <span>{posSuccessReceipt.total.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-xs text-[#6B7280]">
                <span>Espèces reçues:</span>
                <span>{posSuccessReceipt.cash.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#10B981]">
                <span>Monnaie rendue:</span>
                <span>{posSuccessReceipt.change.toLocaleString()} DZD</span>
              </div>
            </div>

            <div className="text-center pt-4 mt-3 border-t border-dashed border-[#0A0A0C] text-[10px] text-[#6B7280]">
              Merci pour votre achat chez HK STORE Chlef !
              <br />
              Garantie & Service après-vente au Showroom
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex justify-between">
              <button
                type="button"
                onClick={() => setPosSuccessReceipt(null)}
                className="px-3 py-1.5 bg-[#E5E7EB] font-bold text-xs"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#0A0A0C] text-[#FFFFFF] font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
