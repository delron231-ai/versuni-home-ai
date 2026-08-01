import React, { useState } from "react";
import {
  Coffee,
  Wind,
  Shirt,
  Sparkles,
  RefreshCw,
  Send,
  Layers,
  Clock,
  Calendar,
  Check,
  ShieldCheck,
  MapPin,
  Power,
  Sliders,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Appliance, CareRoutineResult } from "../../types";
import { AIChip } from "../AIChip";

interface CareTabProps {
  appliances: Appliance[];
  onToast: (text: string, type?: "success" | "info" | "amber") => void;
  onNavigateTab: (tab: any) => void;
}

export const CareTab: React.FC<CareTabProps> = ({ appliances, onToast, onNavigateTab }) => {
  const nonKitchenAppliances = appliances.filter((a) => a.category !== "Kitchen" && a.connected);

  // Sub-navigation filter tab for decluttering: "all" | "Climate Care" | "Coffee" | "Garment Care" | "Floor Care"
  const [activeCareFilter, setActiveCareFilter] = useState<string>("all");

  // 1. AIR PURIFIER INTERACTIVE CONTROLS STATE
  const [isPurifierOn, setIsPurifierOn] = useState<boolean>(true);
  const [purifierMode, setPurifierMode] = useState<string>("Auto");
  const [purifierFanSpeed, setPurifierFanSpeed] = useState<string>("Speed 2");
  const [cityLocation, setCityLocation] = useState<string>("London, UK");
  const [cityAqi, setCityAqi] = useState<number>(78);
  const [roomAqi, setRoomAqi] = useState<number>(12);

  // 2. COFFEE MACHINE SYNC & BREW STATE
  const [coffeeRoast, setCoffeeRoast] = useState<string>("Ethiopian Light");
  const [coffeeParamsSynced, setCoffeeParamsSynced] = useState<boolean>(false);

  // 3. GARMENT STEAMER SYNC STATE
  const [selectedFabric, setSelectedFabric] = useState<string>("Silk");
  const [garmentParamsSynced, setGarmentParamsSynced] = useState<boolean>(false);

  // 4. VACUUM ROBOT SCHEDULE STATE
  const [vacuumTime, setVacuumTime] = useState<string>("09:30");
  const [selectedRooms, setSelectedRooms] = useState<string[]>(["Living Room", "Kitchen", "Bedrooms"]);
  const [cleaningMode, setCleaningMode] = useState<string>("AquaTrio Wet & Dry");

  // Routine Generator States
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [resultsState, setResultsState] = useState<Record<string, CareRoutineResult>>({});
  const [errorState, setErrorState] = useState<Record<string, string>>({});

  const handleGenerateCare = async (category: string, applianceModel: string, specs: any, userInput: any) => {
    setLoadingState((prev) => ({ ...prev, [category]: true }));
    setErrorState((prev) => ({ ...prev, [category]: "" }));

    try {
      const res = await fetch("/api/ai/care-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, applianceModel, specs, userInput }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate ${category} care routine.`);
      }

      const data = await res.json();
      if (data.title) {
        const result: CareRoutineResult = {
          category: category as any,
          applianceModel,
          title: data.title,
          summary: data.summary || "Tailored routine optimized for your appliance.",
          details: data.details || {},
          instructions: data.instructions || [],
        };
        setResultsState((prev) => ({ ...prev, [category]: result }));
        onToast(`Generated ${category} routine for ${applianceModel}`, "success");
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err: any) {
      setErrorState((prev) => ({ ...prev, [category]: err.message || "Failed to generate routine." }));
    } finally {
      setLoadingState((prev) => ({ ...prev, [category]: false }));
    }
  };

  // SEND BREW PARAMETERS TO COFFEE MACHINE
  const handleSendCoffeeParameters = (modelName: string) => {
    setCoffeeParamsSynced(true);
    onToast(`☕ Brew parameters (Level 4 Grind, 16.5g, 92°C) sent to ${modelName}!`, "success");
  };

  // SEND STEAM PROFILE TO GARMENT STEAMER
  const handleSendGarmentParameters = (modelName: string) => {
    setGarmentParamsSynced(true);
    onToast(`👕 Steam profile (${selectedFabric} mode, 140°C, 45g/min) sent to ${modelName}!`, "success");
  };

  // TOGGLE PURIFIER POWER
  const handleTogglePurifier = (modelName: string) => {
    const newState = !isPurifierOn;
    setIsPurifierOn(newState);
    onToast(
      newState
        ? `🟢 Air Purifier (${modelName}) turned ON in ${purifierMode} mode`
        : `⚪ Air Purifier (${modelName}) turned OFF`,
      newState ? "success" : "info"
    );
  };

  // PURIFIER MODE CHANGE
  const handleChangePurifierMode = (mode: string) => {
    setPurifierMode(mode);
    onToast(`Wind mode set to ${mode}`, "info");
  };

  // PURIFIER FAN SPEED CHANGE
  const handleChangePurifierSpeed = (speed: string) => {
    setPurifierFanSpeed(speed);
    onToast(`Purifier fan speed set to ${speed}`, "info");
  };

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter((r) => r !== room));
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  const handleSaveVacuumSchedule = () => {
    onToast(
      `📅 Set ${cleaningMode} cleaning schedule for ${vacuumTime} daily across ${selectedRooms.length} rooms!`,
      "success"
    );
  };

  const coffeeAppliance = appliances.find((a) => a.category === "Coffee" && a.connected);
  const climateAppliance = appliances.find((a) => a.category === "Climate Care" && a.connected);
  const garmentAppliance = appliances.find((a) => a.category === "Garment Care" && a.connected);
  const floorAppliance = appliances.find((a) => a.category === "Floor Care" && a.connected);

  const airImprovementPct = Math.round(((cityAqi - roomAqi) / cityAqi) * 100);

  const careCategories = [
    { id: "all", label: "All Care" },
    { id: "Climate Care", label: "Air Purifier", icon: Wind, show: !!climateAppliance },
    { id: "Coffee", label: "Coffee AI", icon: Coffee, show: !!coffeeAppliance },
    { id: "Garment Care", label: "Garment Steamer", icon: Shirt, show: !!garmentAppliance },
    { id: "Floor Care", label: "Robot Vacuum", icon: Sparkles, show: !!floorAppliance },
  ];

  return (
    <div className="pb-24 px-4 pt-3 max-w-md mx-auto space-y-4 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Care & Smart Control</h2>
          <p className="text-xs text-slate-500">Live air purifier, coffee brewing & fabric care controls</p>
        </div>
        <AIChip label="Versuni Care" size="sm" />
      </div>

      {/* CATEGORY SUB-NAV TABS FOR UNCLUTTERED VIEW */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {careCategories
          .filter((cat) => cat.id === "all" || cat.show)
          .map((cat) => {
            const Icon = cat.icon;
            const isSel = activeCareFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCareFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSel
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
      </div>

      {nonKitchenAppliances.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Connected Care Appliances</h3>
          <p className="text-xs text-slate-500">
            Connect an Air Purifier, Espresso Machine, Garment Steamer, or Vacuum to unlock AI care routines and controls.
          </p>
          <button
            onClick={() => onNavigateTab("appliances")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            + Connect Appliances
          </button>
        </div>
      )}

      {/* 1. AIR PURIFIER CONTROLS & AQI COMPARISON */}
      {(activeCareFilter === "all" || activeCareFilter === "Climate Care") && climateAppliance && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
          {/* Header & Power Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl border ${
                  isPurifierOn
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-400 border-slate-200"
                }`}
              >
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{climateAppliance.model}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Air Quality & Purifier Control</span>
              </div>
            </div>

            {/* START / STOP PURIFIER POWER BUTTON */}
            <button
              onClick={() => handleTogglePurifier(climateAppliance.model)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
                isPurifierOn
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isPurifierOn ? "Purifier Running" : "Purifier Stopped"}</span>
            </button>
          </div>

          {/* AQI Indoor vs Outdoor Dual Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center">
            {/* City AQI */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                Outdoor Air ({cityLocation.split(",")[0]})
              </span>
              <div className="text-lg font-black text-amber-600">{cityAqi} AQI</div>
              <span className="inline-block bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md">
                Moderate Pollen
              </span>
            </div>

            {/* Room AQI */}
            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 space-y-0.5">
              <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider block">
                Living Room Air
              </span>
              <div className="text-lg font-black text-emerald-600">
                {isPurifierOn ? roomAqi : roomAqi + 28} AQI
              </div>
              <span className="inline-block bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                {isPurifierOn ? "Clean Air" : "Purifier Paused"}
              </span>
            </div>
          </div>

          {/* Live Clean Air Improvement Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold">
                Indoor Air is <strong className="text-amber-300">{airImprovementPct}% Cleaner</strong> than City Air
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-md">
              HEPA 99.97%
            </span>
          </div>

          {/* INTERACTIVE PURIFIER MODE & SPEED CONTROLS */}
          {isPurifierOn && (
            <div className="space-y-3 pt-1 border-t border-slate-100 animate-fade-in">
              {/* Purifier Modes */}
              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                  Purifier Operating Mode
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Auto", "Turbo", "Sleep", "Allergen"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleChangePurifierMode(mode)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        purifierMode === mode
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fan Speed Controls */}
              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                  Fan Speed Level
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Speed 1", "Speed 2", "Speed 3", "Turbo Max"].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleChangePurifierSpeed(speed)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        purifierFanSpeed === speed
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. COFFEE ESPRESSO BREW CONTROL & SEND PARAMETERS */}
      {(activeCareFilter === "all" || activeCareFilter === "Coffee") && coffeeAppliance && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{coffeeAppliance.model}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Coffee Roast & Brew Calibration</span>
              </div>
            </div>
            <AIChip label="AI Brew Sync" size="sm" />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1.5 text-[10px] uppercase tracking-wider">
              Select Roast / Bean Profile
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["Espresso Blend", "Ethiopian Light", "Dark Roast", "Decaf Specialty"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setCoffeeRoast(r);
                    setCoffeeParamsSynced(false);
                  }}
                  className={`text-[11px] px-3 py-1 rounded-full font-bold border transition-all ${
                    coffeeRoast === r
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* DISPLAY CALIBRATED BREW PARAMETERS */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-extrabold text-slate-900 text-xs">AI Extraction Parameters ({coffeeRoast})</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Gold Cup Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Ceramic Grind</span>
                <strong className="text-slate-900">Level 4 (Medium-Fine)</strong>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Dose Weight</span>
                <strong className="text-slate-900">16.5g Coffee</strong>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Brew Water Temp</span>
                <strong className="text-slate-900">92°C ThermoBlock</strong>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Yield Target</span>
                <strong className="text-slate-900">45ml Double Shot</strong>
              </div>
            </div>
          </div>

          {/* SEND PARAMETERS TO COFFEE MACHINE BUTTON */}
          <div className="pt-1 space-y-2">
            <button
              onClick={() => handleSendCoffeeParameters(coffeeAppliance.model)}
              className={`w-full py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all text-xs ${
                coffeeParamsSynced
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {coffeeParamsSynced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" /> Brew Parameters Synced to Espresso Machine
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Send Brew Parameters to Coffee Machine
                </>
              )}
            </button>

            <button
              onClick={() =>
                handleGenerateCare("Coffee", coffeeAppliance.model, coffeeAppliance.specs, { roast: coffeeRoast })
              }
              disabled={loadingState["Coffee"]}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              {loadingState["Coffee"] ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              )}
              {loadingState["Coffee"] ? "Recalibrating..." : "Recalibrate Bean Extraction via AI"}
            </button>
          </div>
        </div>
      )}

      {/* 3. GARMENT STEAMER FABRIC CARE & SEND PARAMETERS */}
      {(activeCareFilter === "all" || activeCareFilter === "Garment Care") && garmentAppliance && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Shirt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{garmentAppliance.model}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Fabric Steam Care & OptimalTemp</span>
              </div>
            </div>
            <AIChip label="Fabric AI" size="sm" />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1.5 text-[10px] uppercase tracking-wider">
              Select Garment Fabric
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["Cotton", "Silk", "Wool", "Linen", "Synthetic"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setSelectedFabric(f);
                    setGarmentParamsSynced(false);
                  }}
                  className={`text-[11px] px-3 py-1 rounded-full font-bold border transition-all ${
                    selectedFabric === f
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* DISPLAY CALIBRATED STEAM PARAMETERS */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-extrabold text-slate-900 text-xs">Fabric Profile ({selectedFabric})</span>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                Zero Burn Guarantee
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Continuous Steam</span>
                <strong className="text-slate-900">45g / min</strong>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Soleplate Temp</span>
                <strong className="text-slate-900">140°C Safe Heat</strong>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">OptimalTEMP Mode</span>
                <strong className="text-slate-900">Active Sensor</strong>
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Steam Boost Power</span>
                <strong className="text-slate-900">220g Crease Blast</strong>
              </div>
            </div>
          </div>

          {/* SEND PARAMETERS TO GARMENT STEAMER BUTTON */}
          <div className="pt-1 space-y-2">
            <button
              onClick={() => handleSendGarmentParameters(garmentAppliance.model)}
              className={`w-full py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all text-xs ${
                garmentParamsSynced
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {garmentParamsSynced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" /> Steam Profile Synced to Garment Steamer
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Send Steam Profile to Garment Steamer
                </>
              )}
            </button>

            <button
              onClick={() =>
                handleGenerateCare("Garment Care", garmentAppliance.model, garmentAppliance.specs, { fabric: selectedFabric })
              }
              disabled={loadingState["Garment Care"]}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              {loadingState["Garment Care"] ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              )}
              {loadingState["Garment Care"] ? "Configuring Steam..." : "Reconfigure Steam Rate via AI"}
            </button>
          </div>
        </div>
      )}

      {/* 4. VACUUM ROBOT TIMINGS & SCHEDULE */}
      {(activeCareFilter === "all" || activeCareFilter === "Floor Care") && floorAppliance && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs text-xs text-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{floorAppliance.model}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Vacuum Timings & Floor Schedule</span>
              </div>
            </div>
            <AIChip label="Robot Timings" size="sm" />
          </div>

          {/* Set Daily Timing Picker */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Set Daily Cleaning Time
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={vacuumTime}
                  onChange={(e) => setVacuumTime(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-extrabold text-blue-700 focus:outline-none focus:border-blue-600 shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Time Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              {["08:00 AM", "09:30 AM", "02:00 PM", "08:00 PM"].map((tStr) => {
                const hour24 = tStr.includes("PM")
                  ? (parseInt(tStr) % 12 + 12).toString().padStart(2, "0") + tStr.slice(2, 5)
                  : parseInt(tStr).toString().padStart(2, "0") + tStr.slice(2, 5);
                return (
                  <button
                    key={tStr}
                    type="button"
                    onClick={() => setVacuumTime(hour24)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                      vacuumTime === hour24
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {tStr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rooms Selection */}
          <div className="space-y-1.5">
            <label className="block text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              Select Rooms to Clean
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["Living Room", "Kitchen", "Bedrooms", "Dining", "Hallway"].map((room) => {
                const isSel = selectedRooms.includes(room);
                return (
                  <button
                    key={room}
                    type="button"
                    onClick={() => toggleRoom(room)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                      isSel
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{room}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-slate-600 font-bold uppercase tracking-wider text-[10px] mb-1">
              Cleaning Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {["AquaTrio Wet & Dry", "Eco Silent Vacuum", "Turbo Carpet Clean", "Spot Clean"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCleaningMode(mode)}
                  className={`p-2 rounded-xl text-[11px] font-bold border text-left transition-all ${
                    cleaningMode === mode
                      ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Save Schedule Button */}
          <button
            onClick={handleSaveVacuumSchedule}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all text-xs"
          >
            <Calendar className="w-4 h-4" />
            Save & Enable Robot Schedule
          </button>
        </div>
      )}
    </div>
  );
};

