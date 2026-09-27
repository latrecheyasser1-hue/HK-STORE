"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FEATURED_PRODUCTS, Product } from "@/data/storeData";
import { normalizeText } from "@/lib/textUtils";

export function useLiveProducts() {
  const [products, setProducts] = useState<Product[]>(FEATURED_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const updateProductStock = useCallback(
    (targetId: string, targetTitle: string, newStock: number) => {
      setProducts((prev) =>
        prev.map((p) => {
          const pNorm = normalizeText(p.title);
          const itemNorm = normalizeText(targetTitle || "");
          const isMatch =
            p.id === targetId ||
            (p as any).dbId === targetId ||
            (itemNorm &&
              (pNorm === itemNorm ||
                pNorm.includes(itemNorm) ||
                itemNorm.includes(pNorm)));

          if (isMatch) {
            return {
              ...p,
              stockQuantity: Math.max(0, Number(newStock) || 0),
            };
          }
          return p;
        })
      );
    },
    []
  );

  const fetchLiveStock = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts((prev) => {
          return prev.map((localP) => {
            const remoteP = data.products.find(
              (p: Product) =>
                p.id === localP.id ||
                (p as any).dbId === localP.id ||
                ((localP as any).dbId && (p as any).dbId === (localP as any).dbId) ||
                normalizeText(p.title) === normalizeText(localP.title) ||
                normalizeText(p.title).includes(normalizeText(localP.title)) ||
                normalizeText(localP.title).includes(normalizeText(p.title))
            );
            if (remoteP && typeof remoteP.stockQuantity === "number") {
              return {
                ...localP,
                ...remoteP,
                stockQuantity: remoteP.stockQuantity,
                salesCount: remoteP.salesCount ?? localP.salesCount,
              };
            }
            return localP;
          });
        });
      }
    } catch (err) {
      console.warn("Could not sync live stock from server:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial fetch
    fetchLiveStock();

    // 2. High-speed Instant Local BroadcastChannel (0ms latency cross-tab)
    let localBc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        localBc = new BroadcastChannel("hk_stock_channel");
        localBc.onmessage = (event) => {
          const item = event.data;
          if (item) {
            updateProductStock(item.productId, item.title, item.stockQuantity);
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel not supported", e);
      }
    }

    // 3. Storage Event Listener (Instant cross-tab fallback)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "hk_stock_sync" && e.newValue) {
        try {
          const item = JSON.parse(e.newValue);
          if (item) {
            updateProductStock(item.productId, item.title, item.stockQuantity);
          }
        } catch (err) {}
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    // 4. Supabase Realtime WebSocket Listener (Cross-device & Internet-wide)
    const channel = supabase
      .channel("hk-store-stock")
      .on("broadcast", { event: "stock_update" }, (payload: any) => {
        const item = payload?.payload;
        if (item) {
          updateProductStock(item.productId, item.title, item.stockQuantity);
        }
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (!row) return;
          if (payload.new && typeof payload.new.stock_quantity === "number") {
            updateProductStock(row.id, row.title || "", payload.new.stock_quantity);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchLiveStock();
        }
      )
      .subscribe();

    // 5. Short Interval Heartbeat (Every 3 seconds ensures 100% self-healing)
    const heartbeat = setInterval(() => {
      fetchLiveStock();
    }, 3000);

    return () => {
      if (localBc) {
        localBc.close();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
      supabase.removeChannel(channel);
      clearInterval(heartbeat);
    };
  }, [fetchLiveStock, updateProductStock]);

  const getProduct = useCallback(
    (id: string): Product | undefined => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  return {
    products,
    loading,
    refresh: fetchLiveStock,
    getProduct,
  };
}
