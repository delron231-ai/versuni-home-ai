import React, { useState } from "react";
import { Sparkles, Check, X, Clock, AlertTriangle, RefreshCw, Zap, Shield, Play, ChevronRight, Layers } from "lucide-react";
import { Appliance, Household, CoordinationCard } from "../../types";
import { AIChip } from "../AIChip";

interface HomeTabProps {
  appliances: Appliance[];
  household: Household;
  cards: CoordinationCard[];
  onUpdateCards: (cards: CoordinationCard[]) => void;
  onToast: (text: string, type?: "success" | "info" | "amber") => void;
  onReorderConsumable: (applianceId: string, consumableName: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  appliances,
  household,
  cards,
  onUpdateCards,
  onToast,
  onReorderConsumable,
  onNavigateTab,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [customActivity, setCustomActivity] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectedAppliances = appliances.filter((a) => a.connected);
  const lowConsumables = appliances.flatMap((a) =>
    (a.consumables || []).filter((c) => c.level < 25).map((c) => ({ appliance: a, consumable: c }))
  );

  const activities = [
    { label: "Air-fry salmon", id: "Air-fry salmon" },
    { label: "Do laundry", id: "Do laundry" },
    { label: "Vacuum living room", id: "Vacuum the living room" },
    { label: "Brew coffee", id: "Brew coffee" },
    { label: "Custom…", id: "custom" },
  ];

  const handleRunCoordination = async (activityName: string) => {
    setSelectedActivity(activityName);
    setError(null);

    if (connectedAppliances.length === 0) {
      setError("No connected appliances. Please connect an appliance first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/ai/coordinate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appliances: connectedAppliances,
          household,
          activity: activityName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach coordination AI server.");
      }

      const data = await response.json();
      if (data.cards && Array.isArray(data.cards)) {
        const newCards: CoordinationCard[] = data.cards.map((c: any, index: number) => ({
          id: `coord-${Date.now()}-${index}`,
          title: c.title || "Home Coordination",
          category: c.category || "Smart Home",
          explanation: c.explanation || "Coordinated response for your home.",
          action: {
            label: c.action?.label || "Approve",
            type: c.action?.type || "approve",
          },
          status: "pending",
        }));

        // Combine new generated cards with standing cards, putting new ones at top
        const updated = [...newCards, ...cards.filter((c) => c.status !== "dismissed")];
        onUpdateCards(updated);
        onToast(`Generated ${newCards.length} coordination recommendations for "${activityName}"`, "info");
      }
    } catch (err: any) {
      setError(err.message || "Could not coordinate home. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCard = (card: CoordinationCard) => {
    if (card.action.type === "reorder") {
      // Find matching appliance with low consumable
      const match = lowConsumables[0];
      if (match) {
        onReorderConsumable(match.appliance.id, match.consumable.name);
      } else {
        onToast(`Reorder placed for ${card.title}`, "success");
      }
    } else if (card.action.type === "schedule") {
      onToast(`Scheduled: ${card.action.label}`, "info");
    } else {
      onToast(`Applied: ${card.action.label}`, "success");
    }

    const nextStatus = card.action.type === "schedule" ? "scheduled" : "active";
    const scheduledTime = card.action.type === "schedule" ? `Off-peak (${household.offPeakWindow})` : undefined;
    const activeUntil = card.action.type === "approve" ? "Active for 30 min" : undefined;

    const updated = cards.map((c) =>
      c.id === card.id ? { ...c, status: nextStatus, scheduledTime, activeUntil } : c
    );
    onUpdateCards(updated);
  };

  const handleDismissCard = (cardId: string) => {
    const updated = cards.map((c) => (c.id === cardId ? { ...c, status: "dismissed" as const } : c));
    onUpdateCards(updated);
    onToast("Card dismissed", "info");
  };

  const pendingCards = cards.filter((c) => c.status === "pending");
  const activeCards = cards.filter((c) => c.status === "active");
  const scheduledCards = cards.filter((c) => c.status === "scheduled");

  return (
    <div className="pb-24 px-4 pt-3 max-w-md mx-auto space-y-4 text-slate-900">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your home right now</h2>
        <p className="text-xs text-slate-500">Cross-category automated appliance coordination</p>
      </div>

      {/* Household Status Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-slate-900">Household Status</span>
          </div>
          <AIChip label="Live Sync" size="sm" />
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-bold">Members</span>
            <span className="font-extrabold text-slate-900 text-sm">{household.members} People</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-bold">Off-Peak</span>
            <span className="font-extrabold text-emerald-600 text-xs">{household.offPeakWindow}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-bold">Consumables</span>
            {lowConsumables.length > 0 ? (
              <span className="font-extrabold text-amber-600 text-xs">{lowConsumables.length} Low Alert</span>
            ) : (
              <span className="font-extrabold text-emerald-600 text-xs">All Good</span>
            )}
          </div>
        </div>

        {household.dietaryPrefs.length > 0 && (
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Shield className="w-3 h-3 text-blue-600" />
            <span>Dietary preferences: <strong className="text-slate-900 capitalize font-bold">{household.dietaryPrefs.join(", ")}</strong></span>
          </div>
        )}
      </div>

      {/* ENERGY TREND QUICK BANNER */}
      <div
        onClick={() => onNavigateTab("appliances")}
        className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl p-3.5 text-xs text-slate-900 shadow-xs cursor-pointer transition-all flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">Monthly Energy Trends</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
                82% Off-Peak
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              104.9 kWh consumed across {connectedAppliances.length} devices this month • View breakdown & lifespan
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
      </div>

      {/* INTERACTIVE TRIGGER CONTROL (MUST HAVE HERO FEATURE) */}
      <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-slate-900 text-sm">What are you about to do?</span>
          </div>
          <AIChip label="AI Trigger" size="sm" />
        </div>

        <p className="text-[11px] text-slate-500 mb-3 font-medium">
          Select an activity to watch your appliances coordinate across categories in real time.
        </p>

        {/* Activity Chips */}
        <div className="flex flex-wrap gap-2">
          {activities.map((act) => {
            const isSelected = selectedActivity === act.id;
            if (act.id === "custom") {
              return (
                <button
                  key={act.id}
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    showCustomInput
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  Custom…
                </button>
              );
            }
            return (
              <button
                key={act.id}
                onClick={() => handleRunCoordination(act.id)}
                disabled={loading}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
              >
                <Play className="w-3 h-3 text-blue-600 fill-blue-600" />
                {act.label}
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        {showCustomInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customActivity.trim()) {
                handleRunCoordination(customActivity.trim());
              }
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              placeholder="e.g., Deep clean bedroom, hosting dinner party..."
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs font-medium"
            />
            <button
              type="submit"
              disabled={loading || !customActivity.trim()}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40 shadow-xs"
            >
              Coordinate
            </button>
          </form>
        )}
      </div>

      {/* GLOBAL STATES: LOADING */}
      {loading && (
        <div className="bg-white border border-blue-300 rounded-2xl p-6 text-center shadow-xs animate-pulse">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-900 text-sm">Coordinating your home…</h4>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Gemini is analyzing {connectedAppliances.length} connected appliances & household rules.
          </p>
        </div>
      )}

      {/* GLOBAL STATES: ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-800 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => handleRunCoordination(selectedActivity || "Air-fry salmon")}
            className="mt-1 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Coordination
          </button>
        </div>
      )}

      {/* EMPTY STATE: NO CONNECTED APPLIANCES */}
      {connectedAppliances.length === 0 && !loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-base">No Connected Appliances</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
            Connect appliances to let your home coordinate itself automatically across categories.
          </p>
          <button
            onClick={() => onNavigateTab("appliances")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            + Connect Appliances
          </button>
        </div>
      )}

      {/* ACTIVE CARDS SECTION */}
      {activeCards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Active Routines ({activeCards.length})</span>
          </div>
          {activeCards.map((card) => (
            <div
              key={card.id}
              className="bg-white border-l-4 border-l-emerald-500 border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-800 text-sm">{card.title}</span>
                <AIChip label="Active" size="sm" />
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">{card.explanation}</p>
              {card.activeUntil && (
                <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                  <Clock className="w-3 h-3" />
                  {card.activeUntil}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULED CARDS SECTION */}
      {scheduledCards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled Routines ({scheduledCards.length})</span>
          </div>
          {scheduledCards.map((card) => (
            <div
              key={card.id}
              className="bg-white border-l-4 border-l-blue-600 border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-blue-700 text-sm">{card.title}</span>
                <AIChip label="Scheduled" size="sm" />
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">{card.explanation}</p>
              <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1 pt-1">
                <Clock className="w-3 h-3" />
                Scheduled for {card.scheduledTime || household.offPeakWindow}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PENDING / RECOMMENDATIONS CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-extrabold text-slate-900 text-sm">Recommended Actions</h3>
          <span className="text-slate-500 font-bold">{pendingCards.length} Cards</span>
        </div>

        {pendingCards.length === 0 && activeCards.length === 0 && scheduledCards.length === 0 && !loading && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-xs text-slate-500 font-medium">
            No pending cards right now. Pick an activity above to generate live recommendations!
          </div>
        )}

        {pendingCards.map((card) => (
          <div
            key={card.id}
            className={`bg-white border rounded-2xl p-4 text-xs text-slate-900 shadow-xs space-y-2 transition-all ${
              card.action.type === "reorder"
                ? "border-amber-300 bg-amber-50/20"
                : "border-slate-200 hover:border-blue-400"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
                  {card.category}
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{card.title}</h4>
              </div>
              <AIChip label={card.isStanding ? "Proactive" : "AI Card"} size="sm" />
            </div>

            <p className="text-slate-600 leading-relaxed text-xs font-medium">{card.explanation}</p>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleApproveCard(card)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                  card.action.type === "reorder"
                    ? "bg-amber-500 hover:bg-amber-600 text-white font-extrabold"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {card.action.label || "Approve"}
              </button>

              <button
                onClick={() => handleDismissCard(card.id)}
                className="py-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Not now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
