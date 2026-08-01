import React, { useState } from "react";
import {
  X,
  Clock,
  Flame,
  Star,
  Users,
  Send,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Bookmark,
  ChefHat,
  Play,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Recipe, SavedRecipe, Appliance } from "../types";
import { AIChip } from "./AIChip";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  appliances: Appliance[];
  onClose: () => void;
  onSaveRecipe: (recipe: SavedRecipe) => void;
  onAddToShoppingList: (name: string, addedFrom?: string) => void;
  onToast: (text: string, type?: "success" | "info" | "amber") => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  appliances,
  onClose,
  onSaveRecipe,
  onAddToShoppingList,
  onToast,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isCookingMode, setIsCookingMode] = useState<boolean>(false);
  const [isPreheating, setIsPreheating] = useState<boolean>(false);

  if (!recipe) return null;

  const targetAppliance = appliances.find(
    (a) => a.category === recipe.targetApplianceCategory && a.connected
  ) || appliances.find((a) => a.category === recipe.targetApplianceCategory) || appliances[0];

  const handleToggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSendToAppliance = () => {
    setIsPreheating(true);
    setTimeout(() => {
      setIsPreheating(false);
      onToast(
        `Target temperature (${recipe.applianceSettings.tempC || 180}°C) sent to ${
          targetAppliance?.model || recipe.suggestedApplianceModel
        }! Pre-heating initiated.`,
        "success"
      );
    }, 1200);
  };

  const handleSaveToFavorites = () => {
    const saved: SavedRecipe = {
      id: `saved-${Date.now()}`,
      dish: recipe.title,
      ingredients: recipe.ingredients.map((ing) => ({ name: `${ing.amount} ${ing.name}`, have: true })),
      steps: recipe.steps.map((s) => s.instruction),
      applianceSettings: recipe.applianceSettings,
      appliedAppliance: targetAppliance?.model || recipe.suggestedApplianceModel,
      savedAt: Date.now(),
    };
    onSaveRecipe(saved);
    onToast(`Saved "${recipe.title}" to your recipes!`, "success");
  };

  const handleAddAllMissingToShopping = () => {
    let addedCount = 0;
    recipe.ingredients.forEach((ing, idx) => {
      if (!checkedIngredients[idx]) {
        onAddToShoppingList(`${ing.amount} ${ing.name}`, recipe.title);
        addedCount++;
      }
    });
    onToast(`Added ${addedCount} ingredient(s) to your shopping list!`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col text-slate-900 shadow-2xl overflow-hidden">
        {/* Hero Image Section */}
        <div className="relative h-60 w-full shrink-0 bg-slate-100">
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/30" />

          {/* Top Controls */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="bg-white/90 backdrop-blur-md text-slate-900 font-extrabold text-[11px] px-3 py-1 rounded-full border border-slate-200 shadow-xs">
              {recipe.category}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToFavorites}
                className="p-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-amber-500 shadow-xs transition-all"
                title="Save Recipe"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Title Info */}
          <div className="absolute bottom-3 left-4 right-4 space-y-1 text-white">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{recipe.rating}</span>
                <span className="text-slate-300 text-[10px]">({recipe.reviewCount})</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-300 font-semibold">{recipe.difficulty}</span>
              {recipe.caloriesKcal && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-200 font-medium">{recipe.caloriesKcal} kcal</span>
                </>
              )}
            </div>
            <h2 className="font-extrabold text-xl text-white tracking-tight leading-tight drop-shadow-md">
              {recipe.title}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">Prep & Cook</span>
              <span className="font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {recipe.prepTimeMin + recipe.cookTimeMin} min
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">Servings</span>
              <span className="font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                {recipe.servings} portions
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">Appliance</span>
              <span className="font-bold text-blue-600 truncate block mt-0.5">
                {recipe.suggestedApplianceModel.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* APPLIANCE PRESET CARD */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Flame className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Tuned for {targetAppliance?.model || recipe.suggestedApplianceModel}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    1-Click Auto Preheat & Preset Sync
                  </span>
                </div>
              </div>
              <AIChip label="Versuni Sync" size="sm" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Preset</span>
                <span className="font-bold text-slate-900 text-xs">{recipe.applianceSettings.preset}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Temp</span>
                <span className="font-bold text-blue-600 text-xs">{recipe.applianceSettings.tempC || 180}°C</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Timer</span>
                <span className="font-bold text-emerald-600 text-xs">{recipe.applianceSettings.timeMin} min</span>
              </div>
            </div>

            <button
              onClick={handleSendToAppliance}
              disabled={isPreheating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-xs"
            >
              {isPreheating ? (
                <span>Syncing Temp & Starting Preheat...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Start Cook Cycle on Appliance
                </>
              )}
            </button>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Ingredients Needed ({recipe.ingredients.length})
              </h3>
              <button
                onClick={handleAddAllMissingToShopping}
                className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                Add missing to shopping list
              </button>
            </div>

            <div className="space-y-1.5">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = checkedIngredients[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleIngredient(idx)}
                    className={`bg-slate-50 border p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isChecked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`font-semibold ${isChecked ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {ing.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600">{ing.amount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Cooking Steps */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Step-by-Step Directions
            </h3>

            <div className="space-y-2.5">
              {recipe.steps.map((s) => (
                <div
                  key={s.stepNumber}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {s.stepNumber}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">Step {s.stepNumber}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px] pl-7">{s.instruction}</p>
                  {s.tip && (
                    <div className="ml-7 bg-blue-50/70 border border-blue-200 p-2 rounded-lg text-[10px] text-blue-700 font-medium flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                      <span>{s.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
