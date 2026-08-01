import React, { useState } from "react";
import { Cpu, Wifi, AlertCircle, Settings, X, Save, Users, Clock, ShieldAlert } from "lucide-react";
import { Household, Appliance } from "../types";
import { AIChip } from "./AIChip";

interface HeaderProps {
  household: Household;
  appliances: Appliance[];
  onUpdateHousehold: (hh: Household) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  household,
  appliances,
  onUpdateHousehold,
  hasApiKey,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [members, setMembers] = useState(household.members);
  const [dietary, setDietary] = useState(household.dietaryPrefs.join(", "));
  const [offPeak, setOffPeak] = useState(household.offPeakWindow);

  const connectedCount = appliances.filter((a) => a.connected).length;
  const lowConsumables = appliances.flatMap(
    (a) => a.consumables?.filter((c) => c.level < 25) || []
  );

  const handleSaveHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHousehold({
      members: Math.max(1, Number(members) || 1),
      dietaryPrefs: dietary
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      offPeakWindow: offPeak.trim() || "23:00-06:00",
    });
    setShowSettings(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
      {!hasApiKey && (
        <div className="mb-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Add your Gemini API key to enable full AI features.</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                Versuni Home
              </h1>
              <AIChip label="AI" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Smart Ecosystem · {connectedCount}/{appliances.length} Connected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lowConsumables.length > 0 && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              {lowConsumables.length} Low
            </span>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
            title="Household Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 text-slate-900 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">Household Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHousehold} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Household Members
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={members}
                  onChange={(e) => setMembers(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">
                  Dietary Preferences (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="dairy-free, vegetarian, gluten-free"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Off-Peak Energy Window
                </label>
                <input
                  type="text"
                  placeholder="23:00-06:00"
                  value={offPeak}
                  onChange={(e) => setOffPeak(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
