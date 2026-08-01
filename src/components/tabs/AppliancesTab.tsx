import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Wifi,
  WifiOff,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Zap,
  Sliders,
  AlertTriangle,
  Layers,
  Utensils,
  Coffee,
  Wind,
  Shirt,
  Sparkles,
  HeartPulse,
  Info,
  ExternalLink,
  Activity,
} from "lucide-react";
import { Appliance, Category } from "../../types";
import { AVAILABLE_CATALOG_MODELS } from "../../data/seedData";
import { AIChip } from "../AIChip";
import { ConfirmModal } from "../ConfirmModal";
import { EnergyTrendsChart } from "../EnergyTrendsChart";
import { ApplianceDeepDiveModal } from "../ApplianceDeepDiveModal";

interface AppliancesTabProps {
  appliances: Appliance[];
  onAddAppliance: (appliance: Appliance) => void;
  onRemoveAppliance: (id: string) => void;
  onToggleConnection: (id: string) => void;
  onReorderConsumable: (applianceId: string, consumableName: string) => void;
  onToast: (text: string, type?: "success" | "info" | "amber") => void;
  onNavigateTab?: (tab: string) => void;
}

export const AppliancesTab: React.FC<AppliancesTabProps> = ({
  appliances,
  onAddAppliance,
  onRemoveAppliance,
  onToggleConnection,
  onReorderConsumable,
  onToast,
  onNavigateTab,
}) => {
  const [selectedDeepDiveAppliance, setSelectedDeepDiveAppliance] = useState<Appliance | null>(null);
  const [expandedApplianceId, setExpandedApplianceId] = useState<string | null>(null);

  // Add Wizard State
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Kitchen");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Remove confirm modal state
  const [applianceToRemove, setApplianceToRemove] = useState<Appliance | null>(null);

  const categories: { id: Category; label: string; icon: any }[] = [
    { id: "Kitchen", label: "Kitchen", icon: Utensils },
    { id: "Coffee", label: "Coffee", icon: Coffee },
    { id: "Climate Care", label: "Climate Care", icon: Wind },
    { id: "Garment Care", label: "Garment Care", icon: Shirt },
    { id: "Floor Care", label: "Floor Care", icon: Sparkles },
  ];

  const handleStartWizard = () => {
    setShowAddWizard(true);
    setAddStep(1);
    setSelectedCategory("Kitchen");
    setSelectedModel("");
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    const catalog = AVAILABLE_CATALOG_MODELS[cat] || [];
    if (catalog.length > 0) {
      setSelectedModel(catalog[0].model);
    }
    setAddStep(2);
  };

  const handleFinishAddAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;

    const catalog = AVAILABLE_CATALOG_MODELS[selectedCategory] || [];
    const matched = catalog.find((m) => m.model === selectedModel);

    const defaultSpecs = matched
      ? matched.specs
      : { wattage: 1500, capacity: "Standard", presets: ["Default"], functions: ["Standard operation"] };

    const newAppliance: Appliance = {
      id: `app-${Date.now()}`,
      category: selectedCategory,
      model: selectedModel,
      specs: defaultSpecs,
      connected: true,
      imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80",
      energy: {
        monthlyKWh: [
          { month: "Feb", kWh: 12, costEur: 3.6 },
          { month: "Mar", kWh: 14, costEur: 4.2 },
          { month: "Apr", kWh: 11, costEur: 3.3 },
          { month: "May", kWh: 15, costEur: 4.5 },
          { month: "Jun", kWh: 13, costEur: 3.9 },
          { month: "Jul", kWh: 14, costEur: 4.2 },
        ],
        estimatedMonthlyCostEur: 4.2,
        avgDailyHours: 1.0,
        peakHourUsagePct: 15,
        energyRating: "A++ Smart Energy",
      },
      lifespan: {
        installationDate: new Date().toISOString().split("T")[0],
        expectedLifespanYears: 8,
        operatingHours: 10,
        healthScorePct: 100,
        nextMaintenanceDate: "2026-12-01",
        maintenanceHistory: [],
        componentHealth: [
          { name: "Primary Drive / Motor", scorePct: 100, status: "Good" },
          { name: "Power Module", scorePct: 100, status: "Good" },
        ],
      },
    };

    onAddAppliance(newAppliance);
    setShowAddWizard(false);
    onToast(`Added ${newAppliance.model} to your home!`, "success");
  };

  const confirmRemoveAction = () => {
    if (applianceToRemove) {
      onRemoveAppliance(applianceToRemove.id);
      onToast(`Removed ${applianceToRemove.model}`, "info");
      setApplianceToRemove(null);
    }
  };

  return (
    <div className="pb-24 px-4 pt-3 max-w-md mx-auto space-y-4 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Appliance Ecosystem</h2>
          <p className="text-xs text-slate-500">{appliances.length} Versuni devices registered</p>
        </div>
        <button
          onClick={handleStartWizard}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          + Add Appliance
        </button>
      </div>

      {/* ENERGY CONSUMPTION TRENDS CHART */}
      {appliances.length > 0 && (
        <EnergyTrendsChart
          appliances={appliances}
          onSelectApplianceForDeepDive={(app) => setSelectedDeepDiveAppliance(app)}
        />
      )}

      {/* EMPTY STATE */}
      {appliances.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <Sliders className="w-12 h-12 text-blue-600 mx-auto opacity-70" />
          <h3 className="font-bold text-slate-900 text-base">No Appliances Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Add your first Versuni appliance to unlock recipes, care routines, energy analytics, and home coordination.
          </p>
          <button
            onClick={handleStartWizard}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            + Add First Appliance
          </button>
        </div>
      )}

      {/* APPLIANCE CARDS LIST WITH DEEP DIVE ACCESS */}
      {appliances.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Connected Devices ({appliances.length})
            </h3>
            <span className="text-[10px] font-bold text-blue-600">Tap device for deep-dive details</span>
          </div>

          {appliances.map((app) => {
            const isExpanded = expandedApplianceId === app.id;
            const lowConsumables = (app.consumables || []).filter((c) => c.level < 25);
            const healthScore = app.lifespan?.healthScorePct || 92;
            const latestKWh = app.energy?.monthlyKWh?.[app.energy.monthlyKWh.length - 1]?.kWh || 18;

            return (
              <div
                key={app.id}
                className={`bg-white border rounded-2xl p-4 text-xs text-slate-900 shadow-xs transition-all ${
                  lowConsumables.length > 0
                    ? "border-amber-400 bg-amber-50/20"
                    : app.connected
                    ? "border-slate-200 hover:border-blue-400"
                    : "border-slate-200 opacity-75"
                }`}
              >
                {/* Card Main Row */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedDeepDiveAppliance(app)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                        {app.category}
                      </span>
                      <AIChip label={app.connected ? "Connected" : "Offline"} size="sm" />
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md ml-auto">
                        {healthScore}% Health
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {app.model}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </h3>

                    {/* Spec & Energy Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.specs.wattage && (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded-md font-bold">
                          {app.specs.wattage}W
                        </span>
                      )}
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-600" />
                        {latestKWh} kWh/mo
                      </span>
                      {app.lifespan && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <HeartPulse className="w-3 h-3 text-emerald-600" />
                          {app.lifespan.expectedLifespanYears}y lifespan
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Connection Toggle Switch */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleConnection(app.id);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        app.connected
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-slate-100 text-slate-500 border-slate-300"
                      }`}
                    >
                      {app.connected ? <Wifi className="w-3 h-3 text-emerald-700" /> : <WifiOff className="w-3 h-3" />}
                      {app.connected ? "Connected" : "Offline"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setApplianceToRemove(app);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500"
                      title="Remove Appliance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Deep Dive & Expand Row */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDeepDiveAppliance(app)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 py-1.5 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    Deep Dive Details & Lifespan
                  </button>

                  <button
                    onClick={() => setExpandedApplianceId(isExpanded ? null : app.id)}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>

                {/* Consumables Level Bar */}
                {app.consumables && app.consumables.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    {app.consumables.map((c, idx) => {
                      const isLow = c.level < 25;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700">{c.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={isLow ? "font-bold text-amber-600" : "text-slate-500 font-medium"}>
                                {c.level}% {c.daysLeft ? `(~${c.daysLeft} days)` : ""}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReorderConsumable(app.id, c.name);
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                                  isLow
                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-2xs"
                                    : "bg-slate-50 border border-slate-200 text-blue-600 hover:bg-slate-100"
                                }`}
                              >
                                Reorder
                              </button>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLow ? "bg-amber-500" : "bg-blue-600"
                              }`}
                              style={{ width: `${Math.max(5, c.level)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Expandable Presets & Specs */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in text-xs">
                    {app.specs.presets && app.specs.presets.length > 0 && (
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                          Presets
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {app.specs.presets.map((p, i) => (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-bold"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.specs.functions && app.specs.functions.length > 0 && (
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                          Functions & Technologies
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {app.specs.functions.map((f, i) => (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DEEP DIVE MODAL */}
      <ApplianceDeepDiveModal
        appliance={selectedDeepDiveAppliance}
        onClose={() => setSelectedDeepDiveAppliance(null)}
        onToggleConnection={onToggleConnection}
        onReorderConsumable={onReorderConsumable}
        onToast={onToast}
        onNavigateToCare={onNavigateTab ? () => onNavigateTab("care") : undefined}
      />

      {/* ADD APPLIANCE 2-STEP WIZARD */}
      {showAddWizard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 text-slate-900 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base">Add Versuni Appliance</h3>
              </div>
              <button onClick={() => setShowAddWizard(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: PICK CATEGORY */}
            {addStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-bold">Step 1 of 2: Select Appliance Category</p>
                <div className="grid grid-cols-1 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 p-3 rounded-xl text-left flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-extrabold text-slate-900 text-sm">{cat.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: PICK MODEL */}
            {addStep === 2 && (
              <form onSubmit={handleFinishAddAppliance} className="space-y-4 text-xs">
                <p className="text-xs text-slate-500 font-bold">
                  Step 2 of 2: Pick model in <strong className="text-blue-600">{selectedCategory}</strong>
                </p>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Select Catalog Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  >
                    {(AVAILABLE_CATALOG_MODELS[selectedCategory] || []).map((m) => (
                      <option key={m.model} value={m.model}>
                        {m.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Or enter custom model name</label>
                  <input
                    type="text"
                    placeholder="Custom model name..."
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddStep(1)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedModel.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Add to my home
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE MODAL */}
      <ConfirmModal
        isOpen={!!applianceToRemove}
        title="Remove Appliance"
        message={`Are you sure you want to remove "${applianceToRemove?.model}"? This will update your home coordination routines.`}
        confirmLabel="Remove Device"
        confirmStyle="danger"
        onConfirm={confirmRemoveAction}
        onCancel={() => setApplianceToRemove(null)}
      />
    </div>
  );
};
