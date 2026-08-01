import React, { useState } from "react";
import {
  X,
  Zap,
  Activity,
  HeartPulse,
  Calendar,
  Clock,
  Wrench,
  Wifi,
  WifiOff,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Appliance } from "../types";
import { AIChip } from "./AIChip";

interface ApplianceDeepDiveModalProps {
  appliance: Appliance | null;
  onClose: () => void;
  onToggleConnection: (id: string) => void;
  onReorderConsumable: (applianceId: string, consumableName: string) => void;
  onToast: (text: string, type?: "success" | "info" | "amber") => void;
  onNavigateToCare?: () => void;
}

export const ApplianceDeepDiveModal: React.FC<ApplianceDeepDiveModalProps> = ({
  appliance,
  onClose,
  onToggleConnection,
  onReorderConsumable,
  onToast,
  onNavigateToCare,
}) => {
  const [activeTab, setActiveTab] = useState<"lifespan" | "energy" | "specs">("lifespan");
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);

  if (!appliance) return null;

  const energy = appliance.energy || {
    monthlyKWh: [
      { month: "Feb", kWh: 15, costEur: 4.5 },
      { month: "Mar", kWh: 18, costEur: 5.4 },
      { month: "Apr", kWh: 14, costEur: 4.2 },
      { month: "May", kWh: 16, costEur: 4.8 },
      { month: "Jun", kWh: 19, costEur: 5.7 },
      { month: "Jul", kWh: 17, costEur: 5.1 },
    ],
    estimatedMonthlyCostEur: 5.1,
    avgDailyHours: 1.2,
    peakHourUsagePct: 15,
    energyRating: "A++ Efficiency",
  };

  const lifespan = appliance.lifespan || {
    installationDate: "2024-01-15",
    expectedLifespanYears: 8,
    operatingHours: 650,
    healthScorePct: 92,
    nextMaintenanceDate: "2026-09-01",
    maintenanceHistory: [
      { date: "2025-10-12", task: "System diagnostics & sensor calibration", status: "Completed" as const },
    ],
    componentHealth: [
      { name: "Core Engine / Motor", scorePct: 95, status: "Good" as const },
      { name: "Thermal Controller", scorePct: 92, status: "Good" as const },
      { name: "Filter / Mesh Unit", scorePct: 85, status: "Good" as const },
    ],
  };

  // Calculate age in years/months
  const installDateObj = new Date(lifespan.installationDate);
  const now = new Date();
  const yearsUsed = Math.max(0.2, (now.getTime() - installDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365));
  const lifespanPct = Math.min(100, Math.round((yearsUsed / lifespan.expectedLifespanYears) * 100));

  const handleRunDiagnostic = () => {
    setIsRunningDiagnostic(true);
    setDiagnosticComplete(false);
    setTimeout(() => {
      setIsRunningDiagnostic(false);
      setDiagnosticComplete(true);
      onToast(`Diagnostic completed for ${appliance.model}. All systems operating normally!`, "success");
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col text-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {appliance.imageUrl ? (
                <img src={appliance.imageUrl} alt={appliance.model} className="w-full h-full object-cover" />
              ) : (
                <Zap className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                  {appliance.category}
                </span>
                <AIChip label={appliance.connected ? "Connected" : "Offline"} size="sm" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug">
                {appliance.model}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 transition-all shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab("lifespan")}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "lifespan"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            Lifespan & Health
          </button>
          <button
            onClick={() => setActiveTab("energy")}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "energy"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Zap className="w-4 h-4" />
            Energy & Cost
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "specs"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            Specs & Settings
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* TAB 1: LIFESPAN & HEALTH */}
          {activeTab === "lifespan" && (
            <div className="space-y-4 animate-fade-in">
              {/* Overall Health Score Hero */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Device Health Status
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600">
                      {lifespan.healthScorePct}%
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      Optimal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    All internal motors, sensors, and firmware pass real-time diagnostics.
                  </p>
                </div>

                {/* Health Gauge Ring visual */}
                <div className="w-16 h-16 rounded-full border-4 border-emerald-300 border-t-emerald-600 flex items-center justify-center shrink-0 bg-white shadow-2xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              {/* Lifespan & Age Meter */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Device Lifespan & Usage</span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-bold">
                    {yearsUsed.toFixed(1)} of {lifespan.expectedLifespanYears} years used
                  </span>
                </div>

                {/* Lifespan Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                      style={{ width: `${lifespanPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Installed: {lifespan.installationDate}</span>
                    <span>Est. Lifespan: {lifespan.expectedLifespanYears} Years</span>
                  </div>
                </div>

                {/* Operating Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Total Runtime</span>
                      <span className="font-extrabold text-slate-900 text-xs">{lifespan.operatingHours} Hours</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2.5">
                    <Wrench className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Next Maintenance</span>
                      <span className="font-extrabold text-slate-900 text-xs">{lifespan.nextMaintenanceDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Health Diagnostics */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Component Health Diagnostics
                </h3>

                <div className="space-y-2.5">
                  {lifespan.componentHealth.map((comp, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-700">{comp.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              comp.scorePct < 50
                                ? "text-red-600"
                                : comp.scorePct < 80
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {comp.scorePct}%
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${
                              comp.status === "Good"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {comp.status}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            comp.scorePct < 50
                              ? "bg-red-500"
                              : comp.scorePct < 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${comp.scorePct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Care Action */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleRunDiagnostic}
                    disabled={isRunningDiagnostic}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-blue-600 text-blue-600 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    {isRunningDiagnostic ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {isRunningDiagnostic ? "Testing Sensors..." : "Run Sensor Diagnostic"}
                  </button>

                  {onNavigateToCare && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToCare();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1 transition-all shadow-xs"
                    >
                      Care Routines
                    </button>
                  )}
                </div>

                {diagnosticComplete && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-emerald-800 text-[11px] animate-fade-in font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>All hardware, heating sensors, and network response tests passed 100%!</span>
                  </div>
                )}
              </div>

              {/* Consumables Section if available */}
              {appliance.consumables && appliance.consumables.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    Consumables & Maintenance Parts
                  </h3>

                  {appliance.consumables.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {c.level}% remaining {c.daysLeft ? `(~${c.daysLeft} days left)` : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => onReorderConsumable(appliance.id, c.name)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-xs transition-all"
                      >
                        Reorder Stock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENERGY & CONSUMPTION */}
          {activeTab === "energy" && (
            <div className="space-y-4 animate-fade-in">
              {/* Energy Rating & Monthly Cost Header */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                    Est. Monthly Cost
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    €{energy.estimatedMonthlyCostEur.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">@ €0.30/kWh</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                    Efficiency Grade
                  </span>
                  <span className="text-sm font-extrabold text-blue-600 block mt-1">
                    {energy.energyRating}
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-bold">{100 - energy.peakHourUsagePct}% Off-Peak</span>
                </div>
              </div>

              {/* 6-Month kWh Consumption Area Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    6-Month kWh Trend
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Avg Daily Runtime: {energy.avgDailyHours}h
                  </span>
                </div>

                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energy.monthlyKWh} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.7} />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#CBD5E1",
                          borderRadius: "0.75rem",
                          color: "#0F172A",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(val: any) => [`${val} kWh (€${(val * 0.3).toFixed(2)})`, "Consumption"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="kWh"
                        stroke="#2563EB"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#energyGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Energy Saving Recommendations */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Smart Home Eco Optimization
                </h3>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Versuni Home AI schedules background cycles during off-peak windows (23:00–06:00), saving an estimated €{ (energy.estimatedMonthlyCostEur * 0.22).toFixed(2) } every month.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SPECS & SETTINGS */}
          {activeTab === "specs" && (
            <div className="space-y-4 animate-fade-in">
              {/* Connection Status Toggle Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">Network Connectivity</span>
                  <span className="text-[11px] text-slate-500">
                    {appliance.connected ? "Wi-Fi Connected & Syncing with Versuni AI" : "Device is currently offline"}
                  </span>
                </div>
                <button
                  onClick={() => onToggleConnection(appliance.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    appliance.connected
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-100 text-slate-500 border-slate-300"
                  }`}
                >
                  {appliance.connected ? <Wifi className="w-3.5 h-3.5 text-emerald-700" /> : <WifiOff className="w-3.5 h-3.5" />}
                  {appliance.connected ? "Connected" : "Offline"}
                </button>
              </div>

              {/* Technical Specifications List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <h3 className="font-extrabold text-slate-900 text-sm">Technical Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {appliance.specs.wattage && (
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block font-semibold">Wattage / Power</span>
                      <span className="font-extrabold text-slate-900">{appliance.specs.wattage} Watts</span>
                    </div>
                  )}
                  {appliance.specs.capacity && (
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block font-semibold">Capacity</span>
                      <span className="font-extrabold text-slate-900">{appliance.specs.capacity}</span>
                    </div>
                  )}
                  {appliance.specs.tempRangeC && (
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl col-span-2">
                      <span className="text-[10px] text-slate-500 block font-semibold">Temperature Range</span>
                      <span className="font-extrabold text-slate-900">{appliance.specs.tempRangeC}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Presets & Functions */}
              {appliance.specs.presets && appliance.specs.presets.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                  <h3 className="font-extrabold text-slate-900 text-xs">Supported Presets</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {appliance.specs.presets.map((preset, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                      >
                        {preset}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {appliance.specs.functions && appliance.specs.functions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                  <h3 className="font-extrabold text-slate-900 text-xs">Key Features & Technologies</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {appliance.specs.functions.map((fn, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                      >
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
