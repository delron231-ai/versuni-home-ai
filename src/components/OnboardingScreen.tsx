import React, { useState } from "react";
import {
  Cpu,
  Wifi,
  Sparkles,
  ShieldCheck,
  Coffee,
  Wind,
  Shirt,
  Users,
  Clock,
  ChevronRight,
  Zap,
  CheckCircle2,
  Key,
  UserCheck,
  RotateCcw,
  Plus,
  ArrowRight,
  Check,
  Flame,
  Layers,
  Sparkle,
  X,
} from "lucide-react";
import { Appliance, Household } from "../types";
import { INITIAL_APPLIANCES, INITIAL_HOUSEHOLD } from "../data/seedData";
import { AIChip } from "./AIChip";

interface OnboardingScreenProps {
  onCompleteDemoLogin: () => void;
  onCompleteCustomOnboarding: (household: Household, appliances: Appliance[]) => void;
  onClose?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onCompleteDemoLogin,
  onCompleteCustomOnboarding,
  onClose,
}) => {
  // Navigation mode: "welcome" | "wizard"
  const [mode, setMode] = useState<"welcome" | "wizard">("welcome");

  // Wizard Step: 1 = Household, 2 = Appliances, 3 = AI Showcase, 4 = Ready
  const [step, setStep] = useState<number>(1);

  // Step 1: Household Form State
  const [userName, setUserName] = useState<string>("Alex");
  const [members, setMembers] = useState<number>(2);
  const [dietary, setDietary] = useState<string[]>(["vegetarian", "low-carb"]);
  const [offPeak, setOffPeak] = useState<string>("23:00-06:00");

  // Step 2: Appliance Catalog Selection
  const availableCatalog = [
    {
      id: "app-1",
      name: "Airfryer XXL Smart",
      model: "Airfryer XXL Combi 7000",
      category: "Kitchen" as const,
      status: "ready" as const,
      connected: true,
      specs: { capacity: "2.0 kg / 8.3L", maxTempC: 220, smartPresets: true },
      energyStats: { totalKwhUsed: 24.5, currentPowerWatts: 0, offPeakSavingsPct: 22, monthlyEstCost: 8.4 },
      consumables: [
        { name: "Air Fryer Mesh Oil Filter", level: 85, daysLeft: 120, status: "ok" as const },
      ],
    },
    {
      id: "app-2",
      name: "Barista Espresso Machine",
      model: "Philips Series 5400 LatteGo",
      category: "Coffee" as const,
      status: "ready" as const,
      connected: true,
      specs: { grindLevels: 12, maxBar: 15, thermoBlock: true },
      energyStats: { totalKwhUsed: 14.2, currentPowerWatts: 0, offPeakSavingsPct: 15, monthlyEstCost: 4.8 },
      consumables: [
        { name: "AquaClean Water Filter", level: 18, daysLeft: 12, status: "reorder" as const },
        { name: "LatteGo Milk Circuit Cleaner", level: 60, daysLeft: 45, status: "ok" as const },
      ],
    },
    {
      id: "app-3",
      name: "Series 3000i Air Purifier",
      model: "Philips Air Purifier 3000i",
      category: "Climate Care" as const,
      status: "active" as const,
      connected: true,
      specs: { roomCoverageSqM: 135, filterType: "NanoProtect HEPA", cadr: 520 },
      energyStats: { totalKwhUsed: 38.0, currentPowerWatts: 24, offPeakSavingsPct: 35, monthlyEstCost: 6.2 },
      consumables: [
        { name: "NanoProtect HEPA Series 3 Filter", level: 72, daysLeft: 140, status: "ok" as const },
      ],
    },
    {
      id: "app-4",
      name: "AquaTrio Wet & Dry Robot",
      model: "AquaTrio Cordless 9000",
      category: "Floor Care" as const,
      status: "ready" as const,
      connected: true,
      specs: { suctionPowerPa: 4000, waterTankCapacityMl: 450, autoDock: true },
      energyStats: { totalKwhUsed: 9.8, currentPowerWatts: 0, offPeakSavingsPct: 40, monthlyEstCost: 2.3 },
      consumables: [
        { name: "AquaSpin Microfiber Brushes", level: 90, daysLeft: 180, status: "ok" as const },
      ],
    },
    {
      id: "app-5",
      name: "PerfectCare 8000 Steamer",
      model: "Philips PerfectCare 8000 Steamer",
      category: "Garment Care" as const,
      status: "ready" as const,
      connected: true,
      specs: { steamRateGmin: 45, optimalTemp: true, waterTankL: 1.8 },
      energyStats: { totalKwhUsed: 11.5, currentPowerWatts: 0, offPeakSavingsPct: 18, monthlyEstCost: 3.9 },
      consumables: [
        { name: "De-Calc Water Cartridge", level: 65, daysLeft: 60, status: "ok" as const },
      ],
    },
  ];

  const [selectedApplianceIds, setSelectedApplianceIds] = useState<string[]>([
    "app-1",
    "app-2",
    "app-3",
    "app-4",
  ]);

  // Step 3: Interactive AI Feature Showcase Demo index
  const [activeShowcase, setActiveShowcase] = useState<number>(0);

  const showcaseFeatures = [
    {
      title: "Cross-Appliance Air & Kitchen Sync",
      icon: Wind,
      badge: "Automated Care",
      desc: "When you air-fry salmon or steaks at high heat, the system automatically switches your Air Purifier to Turbo mode to trap particulate grease instantly.",
      demo: "Sensing Airfryer 200°C -> Air Purifier Turbo engaged (CADR 520 m³/h)",
    },
    {
      title: "AI Vision & Pantry Auto-Cook",
      icon: Flame,
      badge: "Culinary Intelligence",
      desc: "Snap a photo of your fridge ingredients. Versuni AI identifies produce and generates 1-click recipes tuned for your connected Airfryer.",
      demo: "Salmon + Tomatoes detected -> Sent to Airfryer XXL (180°C, 18 mins)",
    },
    {
      title: "Barista Grind & Fabric Protection",
      icon: Coffee,
      badge: "Precision Tuning",
      desc: "Select roast origin or fabric type. AI calculates optimum bean grind size, water temp, or soleplate heat for zero-burn delicate care.",
      demo: "Ethiopian Light Roast -> Calibrated to Grind Level 4 & 92°C Extraction",
    },
    {
      title: "Off-Peak Eco Energy Saver",
      icon: Zap,
      badge: "Eco Optimization",
      desc: "High-wattage dishwasher and vacuum cycles are scheduled automatically during your local off-peak utility window, cutting energy costs up to 35%.",
      demo: "AquaTrio & Dishwasher scheduled for off-peak window (23:00 - 06:00)",
    },
  ];

  const toggleDietaryTag = (tag: string) => {
    if (dietary.includes(tag)) {
      setDietary(dietary.filter((t) => t !== tag));
    } else {
      setDietary([...dietary, tag]);
    }
  };

  const toggleApplianceSelection = (id: string) => {
    if (selectedApplianceIds.includes(id)) {
      setSelectedApplianceIds(selectedApplianceIds.filter((i) => i !== id));
    } else {
      setSelectedApplianceIds([...selectedApplianceIds, id]);
    }
  };

  const handleFinishWizard = () => {
    const customHousehold: Household = {
      members,
      dietaryPrefs: dietary,
      offPeakWindow: offPeak,
    };
    const chosenAppliances = availableCatalog.filter((a) => selectedApplianceIds.includes(a.id));
    onCompleteCustomOnboarding(
      customHousehold,
      chosenAppliances.length > 0 ? chosenAppliances : INITIAL_APPLIANCES
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col my-auto max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 relative flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-base tracking-tight text-white leading-tight">
                  Versuni Home AI
                </h2>
                <AIChip label="Smart OS" size="sm" />
              </div>
              <p className="text-[11px] text-slate-400">
                Connected Appliance Ecosystem
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* WELCOME / AUTH GATEWAY SCREEN */}
          {mode === "welcome" && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Next-Gen Home Automation
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Welcome to Versuni Smart Home
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Orchestrate kitchen, coffee, air climate, floor cleaning & fabric care appliances with unified Gemini AI.
                </p>
              </div>

              {/* SAVED CREDENTIALS DEMO CARD */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4.5 rounded-2xl space-y-3.5 shadow-lg border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Saved Demo Credentials</span>
                      <span className="text-[10px] text-slate-400 font-mono">alex.versuni@home.io</span>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Active Session
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Connected Devices:</span>
                    <strong className="text-white">4 Versuni Appliances</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Air Purifier Sensor:</span>
                    <strong className="text-emerald-400">12 AQI (Clean Air)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Off-Peak Energy Window:</span>
                    <strong className="text-amber-300">23:00 - 06:00 (Saving 28%)</strong>
                  </div>
                </div>

                <button
                  onClick={onCompleteDemoLogin}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <Key className="w-4 h-4" />
                  <span>Log In with Saved Ecosystem Credentials</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* OR DIVIDER */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  or start fresh
                </span>
              </div>

              {/* START INTERACTIVE WIZARD BUTTON */}
              <button
                onClick={() => {
                  setMode("wizard");
                  setStep(1);
                }}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold border-2 border-slate-200 hover:border-blue-400 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Start Guided Onboarding Wizard</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* WIZARD MODE: 4 STEPS */}
          {mode === "wizard" && (
            <div className="space-y-4 animate-fade-in">
              {/* Wizard Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Step {step} of 4</span>
                  <span className="text-blue-600">
                    {step === 1 && "Household Profile"}
                    {step === 2 && "Appliance Pairing"}
                    {step === 3 && "AI Ecosystem Features"}
                    {step === 4 && "Setup Complete"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: HOUSEHOLD SETUP */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">Household & Energy Profile</h4>
                      <p className="text-[10px] text-slate-500">Configure members and dietary habits for AI tuning</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">Primary User Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                        Household Members: <span className="text-blue-600">{members} Person(s)</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={members}
                        onChange={(e) => setMembers(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                        Dietary Preferences
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "vegetarian",
                          "high-protein",
                          "low-carb",
                          "dairy-free",
                          "gluten-free",
                          "keto",
                        ].map((tag) => {
                          const isSel = dietary.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleDietaryTag(tag)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                                isSel
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                        Off-Peak Utility Window
                      </label>
                      <select
                        value={offPeak}
                        onChange={(e) => setOffPeak(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="23:00-06:00">23:00 - 06:00 (Night Discount - Best)</option>
                        <option value="22:00-07:00">22:00 - 07:00 (Extended Eco)</option>
                        <option value="14:00-17:00">14:00 - 17:00 (Mid-Day Solar)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMode("welcome")}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      <span>Next: Select Appliances</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: APPLIANCE PAIRING */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">Pair Versuni Appliances</h4>
                      <p className="text-[10px] text-slate-500">Select devices to discover & auto-connect via Wi-Fi</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {availableCatalog.map((app) => {
                      const isSelected = selectedApplianceIds.includes(app.id);
                      return (
                        <div
                          key={app.id}
                          onClick={() => toggleApplianceSelection(app.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-emerald-50/40 border-emerald-300 shadow-2xs"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 opacity-70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {app.category === "Kitchen" && <Flame className="w-4 h-4" />}
                              {app.category === "Coffee" && <Coffee className="w-4 h-4" />}
                              {app.category === "Climate Care" && <Wind className="w-4 h-4" />}
                              {app.category === "Floor Care" && <Sparkles className="w-4 h-4" />}
                              {app.category === "Garment Care" && <Shirt className="w-4 h-4" />}
                            </div>
                            <div>
                              <strong className="text-slate-900 block font-extrabold">{app.name}</strong>
                              <span className="text-[10px] text-slate-500">{app.model}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Connected
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md">
                                Tap to Pair
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={selectedApplianceIds.length === 0}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      <span>Next: Explore AI Features</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: INTERACTIVE AI USE CASES SHOWCASE */}
              {step === 3 && (
                <div className="space-y-3.5 animate-fade-in text-xs">
                  <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">Versuni AI Capabilities Showcase</h4>
                      <p className="text-[10px] text-slate-500">Tap cards below to preview smart cross-appliance routines</p>
                    </div>
                  </div>

                  {/* Interactive Tab selector for showcase */}
                  <div className="grid grid-cols-2 gap-2">
                    {showcaseFeatures.map((feat, idx) => {
                      const Icon = feat.icon;
                      const isActive = activeShowcase === idx;
                      return (
                        <div
                          key={feat.title}
                          onClick={() => setActiveShowcase(idx)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                            isActive
                              ? "bg-slate-900 text-white border-slate-800 shadow-md"
                              : "bg-white border-slate-200 text-slate-800 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`p-1.5 rounded-lg ${
                                isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-blue-600"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isActive ? "bg-slate-800 text-blue-300" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {feat.badge}
                            </span>
                          </div>
                          <strong className="block text-[11px] font-extrabold leading-tight">
                            {feat.title}
                          </strong>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Showcase Detail Box */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {showcaseFeatures[activeShowcase].desc}
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-[10px] font-mono text-emerald-800 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{showcaseFeatures[activeShowcase].demo}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      <span>Next: Summary</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: READY & LAUNCH */}
              {step === 4 && (
                <div className="space-y-4 text-center py-2 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Your AI Ecosystem is Ready!</h3>
                    <p className="text-xs text-slate-500">
                      Welcome aboard, <strong>{userName}</strong>! Your {selectedApplianceIds.length} connected appliances have been linked.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-left space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Household Size:</span>
                      <strong className="text-slate-900">{members} Members</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dietary Preferences:</span>
                      <strong className="text-slate-900">{dietary.join(", ") || "None"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Off-Peak Window:</span>
                      <strong className="text-blue-600">{offPeak}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paired Appliances:</span>
                      <strong className="text-emerald-600">{selectedApplianceIds.length} Devices Active</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleFinishWizard}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Launch Versuni Home AI Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
