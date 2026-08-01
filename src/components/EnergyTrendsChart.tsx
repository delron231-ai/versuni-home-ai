import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Zap, TrendingUp, DollarSign, Calendar, ShieldCheck, Activity } from "lucide-react";
import { Appliance } from "../types";

interface EnergyTrendsChartProps {
  appliances: Appliance[];
  onSelectApplianceForDeepDive?: (appliance: Appliance) => void;
}

export const EnergyTrendsChart: React.FC<EnergyTrendsChartProps> = ({
  appliances,
  onSelectApplianceForDeepDive,
}) => {
  const [metric, setMetric] = useState<"kWh" | "cost">("kWh");
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>("all");

  const connectedAppliances = appliances.filter((a) => a.connected);

  // Month list from data
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  // Colors for different categories
  const categoryColors: Record<string, string> = {
    Kitchen: "#3B82F6", // Vibrant Blue
    Coffee: "#F59E0B", // Warm Amber
    "Climate Care": "#10B981", // Emerald Green
    "Garment Care": "#8B5CF6", // Purple
    "Floor Care": "#EC4899", // Pink
  };

  // Build aggregated monthly trend data
  const chartData = months.map((m) => {
    const row: Record<string, any> = { month: m, totalKWh: 0, totalCost: 0 };

    appliances.forEach((app) => {
      if (selectedApplianceId !== "all" && app.id !== selectedApplianceId) return;

      const monthlyItem = app.energy?.monthlyKWh?.find((e) => e.month === m);
      const valKWh = monthlyItem ? monthlyItem.kWh : 0;
      const valCost = monthlyItem ? monthlyItem.costEur : valKWh * 0.3;

      row[app.id] = metric === "kWh" ? valKWh : valCost;
      row.totalKWh += valKWh;
      row.totalCost += valCost;
    });

    row.totalKWh = Number(row.totalKWh.toFixed(1));
    row.totalCost = Number(row.totalCost.toFixed(2));

    return row;
  });

  // Calculate high level KPIs
  const currentMonthData = chartData[chartData.length - 1] || { totalKWh: 0, totalCost: 0 };
  const prevMonthData = chartData[chartData.length - 2] || { totalKWh: 0, totalCost: 0 };

  const kWhDiffPct =
    prevMonthData.totalKWh > 0
      ? (((currentMonthData.totalKWh - prevMonthData.totalKWh) / prevMonthData.totalKWh) * 100).toFixed(1)
      : "0";

  const isKWhDown = Number(kWhDiffPct) <= 0;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-50 min-w-[160px]">
          <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 flex justify-between">
            <span>{label} Consumption</span>
            <span className="text-blue-600">
              {metric === "kWh"
                ? `${payload.reduce((acc: number, p: any) => acc + (Number(p.value) || 0), 0).toFixed(1)} kWh`
                : `€${payload.reduce((acc: number, p: any) => acc + (Number(p.value) || 0), 0).toFixed(2)}`}
            </span>
          </p>
          {payload.map((entry: any, index: number) => {
            const app = appliances.find((a) => a.id === entry.dataKey);
            if (!app || entry.value === 0) return null;
            return (
              <div key={index} className="flex items-center justify-between text-[11px] gap-3">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 truncate font-medium">{app.model}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {metric === "kWh" ? `${entry.value} kWh` : `€${entry.value.toFixed(2)}`}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-slate-900 shadow-xs">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm tracking-tight text-slate-900">Monthly Energy Trends</h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Connected appliances consumption & cost history
          </p>
        </div>

        {/* Metric & Appliance Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-[11px] font-bold">
            <button
              onClick={() => setMetric("kWh")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === "kWh" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              kWh
            </button>
            <button
              onClick={() => setMetric("cost")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === "cost" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Est. Cost (€)
            </button>
          </div>

          {/* Filter Device */}
          <select
            value={selectedApplianceId}
            onChange={(e) => setSelectedApplianceId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-600 shadow-2xs"
          >
            <option value="all">All Connected Devices ({connectedAppliances.length})</option>
            {appliances.map((a) => (
              <option key={a.id} value={a.id}>
                {a.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">July Energy</span>
          <span className="text-sm font-black text-slate-900">{currentMonthData.totalKWh} kWh</span>
          <span
            className={`text-[10px] font-extrabold block mt-0.5 ${
              isKWhDown ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {isKWhDown ? "↓" : "↑"} {Math.abs(Number(kWhDiffPct))}% vs Jun
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Monthly Cost</span>
          <span className="text-sm font-black text-emerald-600">€{currentMonthData.totalCost.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Off-peak 82%</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Eco Mode</span>
          <span className="text-sm font-black text-blue-600">Smart Sync</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Saved ~€4.20</span>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.7} />
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {selectedApplianceId === "all" ? (
              appliances.map((app) => (
                <Bar
                  key={app.id}
                  dataKey={app.id}
                  name={app.model}
                  stackId="a"
                  fill={categoryColors[app.category] || "#2563EB"}
                  radius={[3, 3, 0, 0]}
                />
              ))
            ) : (
              <Bar
                dataKey={selectedApplianceId}
                fill={
                  categoryColors[
                    appliances.find((a) => a.id === selectedApplianceId)?.category || "Kitchen"
                  ] || "#2563EB"
                }
                radius={[6, 6, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend & Quick Deep Dive Buttons */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Connected Devices ({appliances.length})
          </span>
          <span className="text-[10px] text-blue-600 font-bold">Click device for deep dive</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {appliances.map((app) => {
            const color = categoryColors[app.category] || "#2563EB";
            const appMonth = app.energy?.monthlyKWh?.[app.energy.monthlyKWh.length - 1];
            return (
              <button
                key={app.id}
                onClick={() => onSelectApplianceForDeepDive && onSelectApplianceForDeepDive(app)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-400 px-2.5 py-1.5 rounded-xl text-left flex items-center gap-2 transition-all group shrink-0"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 truncate max-w-[120px]">
                  {app.model}
                </span>
                {appMonth && (
                  <span className="text-[10px] font-extrabold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                    {appMonth.kWh} kWh
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
