import React, { useState } from "react";
import {
  Utensils,
  Search,
  BookOpen,
  Sparkles,
  Bookmark,
  Star,
  Clock,
  Flame,
  ChevronRight,
  RefreshCw,
  X,
  ChevronDown,
} from "lucide-react";
import { Appliance, Ingredient, SavedRecipe, ShoppingItem, Recipe, RecipeBook } from "../../types";
import { SAMPLE_RECIPES, RECIPE_BOOKS } from "../../data/seedRecipes";
import { RecipeDetailModal } from "../RecipeDetailModal";
import { RecipeBookModal } from "../RecipeBookModal";
import { PantryManager } from "../PantryManager";
import { AIChip } from "../AIChip";

interface CookTabProps {
  appliances: Appliance[];
  pantry: Ingredient[];
  savedRecipes: SavedRecipe[];
  shoppingList: ShoppingItem[];
  onUpdatePantry: (pantry: Ingredient[]) => void;
  onSaveRecipe: (recipe: SavedRecipe) => void;
  onAddToShoppingList: (name: string, addedFrom?: string) => void;
  onToast: (text: string, type?: "success" | "info" | "amber") => void;
}

export const CookTab: React.FC<CookTabProps> = ({
  appliances,
  pantry,
  savedRecipes,
  shoppingList,
  onUpdatePantry,
  onSaveRecipe,
  onAddToShoppingList,
  onToast,
}) => {
  // Main Navigation: "recipes" | "books" | "pantry" | "generator" | "saved"
  const [activeSubTab, setActiveSubTab] = useState<"recipes" | "books" | "pantry" | "generator" | "saved">("recipes");

  // Category & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedBook, setSelectedBook] = useState<RecipeBook | null>(null);

  // AI Recipe Generator State
  const kitchenAppliances = appliances.filter((a) => a.category === "Kitchen" && a.connected);
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>(
    kitchenAppliances[0]?.id || appliances.find((a) => a.category === "Kitchen")?.id || ""
  );
  const [timeAvailable, setTimeAvailable] = useState<number>(30);
  const [diet, setDiet] = useState<string>("Dairy-free");
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [generatedRecipeResult, setGeneratedRecipeResult] = useState<SavedRecipe | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  const selectedAppliance = appliances.find((a) => a.id === selectedApplianceId);

  // AI Generator Action — AUTO OPENS RECIPE DETAIL MODAL ON COMPLETION
  const handleGenerateRecipe = async () => {
    setLoadingRecipe(true);
    setRecipeError(null);

    try {
      const res = await fetch("/api/ai/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantry,
          timeAvailable,
          diet,
          appliance: selectedAppliance,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate custom recipe.");

      const data = await res.json();
      if (data.dish) {
        const savedGen: SavedRecipe = {
          id: `recipe-${Date.now()}`,
          dish: data.dish,
          ingredients: data.ingredients || [],
          steps: data.steps || [],
          applianceSettings: data.applianceSettings || {
            preset: "Standard Airfry",
            tempC: 180,
            timeMin: timeAvailable,
          },
          appliedAppliance: selectedAppliance?.model || "Airfryer XXL",
          savedAt: Date.now(),
        };

        // Build full recipe object for immediate display in modal
        const fullRecipe: Recipe = {
          id: savedGen.id,
          title: data.dish,
          subtitle: `AI Crafted for ${selectedAppliance?.model || "Airfryer XXL"}`,
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
          category: selectedAppliance?.category === "Coffee" ? "Coffee" : "Airfryer",
          prepTimeMin: 10,
          cookTimeMin: data.applianceSettings?.timeMin || timeAvailable,
          rating: 4.9,
          reviewCount: 1,
          difficulty: "Easy",
          caloriesKcal: 420,
          servings: 2,
          suggestedApplianceModel: selectedAppliance?.model || "Airfryer XXL",
          targetApplianceCategory: selectedAppliance?.category || "Kitchen",
          applianceSettings: {
            preset: savedGen.applianceSettings.preset || "Airfry",
            tempC: savedGen.applianceSettings.tempC,
            timeMin: savedGen.applianceSettings.timeMin || timeAvailable || 15,
            midCookAction: savedGen.applianceSettings.midCookAction,
          },
          tags: ["AI Recipe", diet, `${timeAvailable} min`],
          ingredients: (data.ingredients || []).map((i: any) => ({
            name: typeof i === "string" ? i : i.name || "Ingredient",
            amount: typeof i === "object" ? i.quantity || "1 portion" : "to taste",
          })),
          steps: (data.steps || []).map((s: any, idx: number) => ({
            stepNumber: idx + 1,
            instruction: typeof s === "string" ? s : s.instruction || "Cook ingredient",
            tip: idx === 0 ? `Set ${selectedAppliance?.model || "Appliance"} to ${savedGen.applianceSettings.tempC || 180}°C` : undefined,
          })),
        };

        setGeneratedRecipeResult(savedGen);
        onSaveRecipe(savedGen);
        setSelectedRecipe(fullRecipe); // <--- IMMEDIATELY SHOW GENERATED RECIPE MODAL!
        onToast(`✨ Generated "${data.dish}" tuned for your appliance!`, "success");
      } else {
        throw new Error("Invalid recipe format returned.");
      }
    } catch (err: any) {
      setRecipeError(err.message || "Failed to generate recipe.");
      onToast("Could not generate AI recipe. Please check connection.", "amber");
    } finally {
      setLoadingRecipe(false);
    }
  };

  // Filtered Recipes
  const filteredRecipes = SAMPLE_RECIPES.filter((r) => {
    const matchesCategory = selectedCategory === "All" || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 px-4 pt-3 max-w-md mx-auto space-y-4 text-slate-900">
      {/* Visual Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Culinary Studio</h2>
          <p className="text-xs text-slate-500">Appliance-tuned recipes, cookbooks & pantry</p>
        </div>
        <AIChip label="Chef AI" size="sm" />
      </div>

      {/* TOP PILL TAB NAVIGATION */}
      <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-700 shadow-inner overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("recipes")}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
            activeSubTab === "recipes"
              ? "bg-white text-blue-600 shadow-sm"
              : "hover:text-slate-900"
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Recipes</span>
        </button>

        <button
          onClick={() => setActiveSubTab("books")}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
            activeSubTab === "books"
              ? "bg-white text-blue-600 shadow-sm"
              : "hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Books ({RECIPE_BOOKS.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("pantry")}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
            activeSubTab === "pantry"
              ? "bg-white text-blue-600 shadow-sm"
              : "hover:text-slate-900"
          }`}
        >
          <span>Pantry ({pantry.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("generator")}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
            activeSubTab === "generator"
              ? "bg-white text-blue-600 shadow-sm"
              : "hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>AI Chef</span>
        </button>

        <button
          onClick={() => setActiveSubTab("saved")}
          className={`py-2 px-2.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
            activeSubTab === "saved"
              ? "bg-white text-blue-600 shadow-sm"
              : "hover:text-slate-900"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>({savedRecipes.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: RECIPES GRID VIEW */}
      {activeSubTab === "recipes" && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes, salmon, espresso, air fryer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["All", "Airfryer", "Coffee", "Healthy", "Baking"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* RECIPE CARDS GRID */}
          <div className="grid grid-cols-2 gap-3">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
              >
                <div className="relative h-32 w-full bg-slate-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-slate-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-slate-200/80 shadow-xs">
                    {recipe.category}
                  </span>

                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-amber-600 font-bold text-[9px] px-2 py-0.5 rounded-full border border-slate-200/80 flex items-center gap-0.5 shadow-xs">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span>{recipe.rating}</span>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                    <span className="font-bold drop-shadow-md text-xs line-clamp-1">
                      {recipe.title}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 space-y-1.5 bg-white flex-1 flex flex-col justify-between">
                  <p className="text-[10px] text-slate-500 line-clamp-1">{recipe.subtitle}</p>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      {recipe.prepTimeMin + recipe.cookTimeMin}m
                    </span>

                    <span className="bg-blue-50 text-blue-700 font-bold text-[9px] px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-blue-600 fill-blue-600" />
                      {recipe.applianceSettings.tempC ? `${recipe.applianceSettings.tempC}°C` : "Preset"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RECIPE BOOKS SHELF */}
      {activeSubTab === "books" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Official Versuni Recipe Books
            </h3>
            <span className="text-xs text-slate-500 font-medium">{RECIPE_BOOKS.length} books</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RECIPE_BOOKS.map((book) => (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-xs hover:shadow-md group flex items-center p-3 gap-3"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-20 h-24 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="bg-blue-50 text-blue-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-blue-100">
                    {book.recipeCount} Recipes
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{book.subtitle}</p>
                  <div className="pt-1 flex items-center text-[10px] text-blue-600 font-bold gap-1">
                    <span>View Collection</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PANTRY MANAGER */}
      {activeSubTab === "pantry" && (
        <PantryManager
          pantry={pantry}
          onUpdatePantry={onUpdatePantry}
          onToast={onToast}
        />
      )}

      {/* SUB-TAB 4: AI CHEF GENERATOR */}
      {activeSubTab === "generator" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 text-xs text-slate-900 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
              Generative Culinary AI
            </h3>
            <p className="text-slate-500">
              Matches your available pantry ingredients with precise cooking parameters for your appliance.
            </p>
          </div>

          {/* Appliance Selector */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Target Kitchen Appliance
            </label>
            <div className="relative">
              <select
                value={selectedApplianceId}
                onChange={(e) => setSelectedApplianceId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold appearance-none focus:outline-none focus:border-blue-600"
              >
                {appliances
                  .filter((a) => a.category === "Kitchen" || a.category === "Coffee")
                  .map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.model} ({app.category})
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Time Selector */}
          <div>
            <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Time Available
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeAvailable(t)}
                  className={`py-2 rounded-xl font-bold border transition-all text-xs ${
                    timeAvailable === t
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {t}m
                </button>
              ))}
            </div>
          </div>

          {/* Diet Preferences */}
          <div>
            <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Dietary Preference
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["None", "Vegetarian", "Vegan", "High-protein", "Dairy-free"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiet(d)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    diet === d
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateRecipe}
            disabled={loadingRecipe}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loadingRecipe ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Crafting Custom Recipe...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white" />
                Generate Recipe & Open
              </>
            )}
          </button>
        </div>
      )}

      {/* SUB-TAB 5: SAVED RECIPES */}
      {activeSubTab === "saved" && (
        <div className="space-y-3 text-xs text-slate-900">
          {savedRecipes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">No Saved Recipes Yet</h4>
              <p className="text-[11px] text-slate-500">
                Tap the bookmark icon on any recipe to save it here!
              </p>
            </div>
          ) : (
            savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{recipe.dish}</h4>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-bold">
                    {recipe.appliedAppliance}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Preset: <strong>{recipe.applianceSettings.preset || "Airfry"}</strong> • {recipe.applianceSettings.tempC}°C • {recipe.applianceSettings.timeMin} min
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* RECIPE DETAIL MODAL */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        appliances={appliances}
        onClose={() => setSelectedRecipe(null)}
        onSaveRecipe={onSaveRecipe}
        onAddToShoppingList={onAddToShoppingList}
        onToast={onToast}
      />

      {/* RECIPE BOOK MODAL */}
      <RecipeBookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
      />
    </div>
  );
};
