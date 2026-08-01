import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Camera,
  Search,
  Check,
  RefreshCw,
  Utensils,
  X,
  AlertTriangle,
  Clock,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { Ingredient, StorageLocation } from "../types";

interface PantryManagerProps {
  pantry: Ingredient[];
  onUpdatePantry: (newPantry: Ingredient[]) => void;
  onToast: (text: string, type?: "success" | "info" | "amber") => void;
}

export const PantryManager: React.FC<PantryManagerProps> = ({
  pantry,
  onUpdatePantry,
  onToast,
}) => {
  const [activeLocationFilter, setActiveLocationFilter] = useState<"All" | StorageLocation>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Item State
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemLoc, setItemLoc] = useState<StorageLocation>("Fridge");
  const [useSoon, setUseSoon] = useState(false);

  // Vision Scan State
  const [scanning, setScanning] = useState(false);
  const [scanItems, setScanItems] = useState<{ name: string; location: StorageLocation; quantity: string }[]>([]);
  const [showScanConfirm, setShowScanConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locations: StorageLocation[] = ["Fridge", "Pantry", "Freezer"];

  // Handle Manual Add
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      onToast("Please enter an item name (e.g., Milk or Eggs)", "amber");
      return;
    }

    const newItem: Ingredient = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: itemName.trim(),
      quantity: itemQty.trim() || "1 portion",
      location: itemLoc,
      useSoon: useSoon,
    };

    const updated = [newItem, ...pantry];
    onUpdatePantry(updated);

    setItemName("");
    setItemQty("");
    setUseSoon(false);
    onToast(`Added "${newItem.name}" to ${newItem.location}!`, "success");
  };

  const handleDeleteItem = (id: string, name: string) => {
    const updated = pantry.filter((i) => i.id !== id);
    onUpdatePantry(updated);
    onToast(`Removed "${name}"`, "info");
  };

  const handleToggleUseSoon = (id: string) => {
    const updated = pantry.map((i) => (i.id === id ? { ...i, useSoon: !i.useSoon } : i));
    onUpdatePantry(updated);
  };

  // Handle Vision AI Scan
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch("/api/ai/scan-pantry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Data, mimeType: file.type || "image/jpeg" }),
        });

        if (!res.ok) throw new Error("Vision scan error");
        const data = await res.json();

        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setScanItems(
            data.items.map((i: any) => ({
              name: i.name || "Ingredients",
              location: (["Fridge", "Pantry", "Freezer"].includes(i.location) ? i.location : "Fridge") as StorageLocation,
              quantity: i.quantity || "1 portion",
            }))
          );
          setShowScanConfirm(true);
          onToast(`Detected ${data.items.length} items from image!`, "info");
        } else {
          onToast("Could not recognize items clearly — try typing manually below.", "amber");
        }
      } catch (err) {
        onToast("Scan failed — please add items manually below.", "amber");
      } finally {
        setScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmScanAdd = () => {
    const newIngredients: Ingredient[] = scanItems.map((item, idx) => ({
      id: `ing-scan-${Date.now()}-${idx}`,
      name: item.name,
      location: item.location,
      quantity: item.quantity,
    }));

    onUpdatePantry([...newIngredients, ...pantry]);
    setShowScanConfirm(false);
    setScanItems([]);
    onToast(`Added ${newIngredients.length} item(s) to inventory!`, "success");
  };

  // Filtered Pantry Items
  const filteredPantry = pantry.filter((item) => {
    const matchesLoc = activeLocationFilter === "All" || item.location === activeLocationFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLoc && matchesSearch;
  });

  const countByLoc = {
    All: pantry.length,
    Fridge: pantry.filter((i) => i.location === "Fridge").length,
    Pantry: pantry.filter((i) => i.location === "Pantry").length,
    Freezer: pantry.filter((i) => i.location === "Freezer").length,
  };

  return (
    <div className="space-y-4 text-xs text-slate-900">
      {/* Top Banner & Scanner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Food & Storage Inventory</h3>
            <p className="text-[11px] text-slate-500">
              Track items in Fridge, Pantry & Freezer for zero-waste AI recipes
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all text-xs"
          >
            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>AI Photo Scan</span>
          </button>
        </div>

        {/* PROMINENT DIRECT ADD ITEM FORM */}
        <form onSubmit={handleAddItem} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
            + Quick Add Ingredient or Item
          </span>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Fresh Salmon, Oat Milk, Eggs..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
            <input
              type="text"
              placeholder="Qty (e.g. 6 pcs, 1L)"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
              className="w-full sm:w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>

          {/* Location & Options Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold">Store in:</span>
              {locations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setItemLoc(loc)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    itemLoc === loc
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {loc === "Fridge" ? "🧊 Fridge" : loc === "Pantry" ? "🥫 Pantry" : "❄️ Freezer"}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!itemName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold px-4 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-xs ml-auto"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </form>
      </div>

      {/* LOCATION TAB SWITCHER & SEARCH */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Location Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl flex-1 overflow-x-auto text-slate-700 font-bold">
            {(["All", "Fridge", "Pantry", "Freezer"] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocationFilter(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeLocationFilter === loc
                    ? "bg-white text-blue-600 shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                <span>{loc === "All" ? "📦 All" : loc === "Fridge" ? "🧊 Fridge" : loc === "Pantry" ? "🥫 Pantry" : "❄️ Freezer"}</span>
                <span className="text-[10px] opacity-80">({countByLoc[loc]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search stored items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ITEM CARDS LIST */}
      {filteredPantry.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">No items in {activeLocationFilter}</h4>
          <p className="text-[11px] text-slate-500">
            Use the Quick Add box above to add groceries or ingredients!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredPantry.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs transition-all ${
                item.useSoon
                  ? "border-amber-300 bg-amber-50/60"
                  : "border-slate-200 hover:border-blue-400"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-xs">
                  {item.location === "Fridge" ? "🧊" : item.location === "Pantry" ? "🥫" : "❄️"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs truncate">{item.name}</span>
                    {item.useSoon && (
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md shrink-0 shadow-2xs">
                        use soon
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {item.quantity} • {item.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggleUseSoon(item.id)}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    item.useSoon
                      ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600"
                  }`}
                  title="Toggle Use Soon"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCAN CONFIRM MODAL */}
      {showScanConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16204A] border border-[#3B82F6] rounded-2xl max-w-sm w-full p-4 space-y-3 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#24326B] pb-2">
              <h4 className="font-bold text-sm">Confirm Scanned Items</h4>
              <button onClick={() => setShowScanConfirm(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {scanItems.map((item, idx) => (
                <div key={idx} className="bg-[#0B1437] p-2 rounded-xl border border-[#24326B] flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...scanItems];
                      updated[idx].name = e.target.value;
                      setScanItems(updated);
                    }}
                    className="flex-1 bg-transparent text-xs text-white font-bold focus:outline-none"
                  />
                  <select
                    value={item.location}
                    onChange={(e) => {
                      const updated = [...scanItems];
                      updated[idx].location = e.target.value as StorageLocation;
                      setScanItems(updated);
                    }}
                    className="bg-[#16204A] text-[10px] text-white border border-[#24326B] rounded-md px-1.5 py-1"
                  >
                    <option value="Fridge">Fridge</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Freezer">Freezer</option>
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmScanAdd}
              className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] font-bold text-white rounded-xl text-xs"
            >
              Confirm & Save {scanItems.length} Items
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
