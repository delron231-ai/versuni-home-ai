import React from "react";
import { X, BookOpen, Star, Clock, Flame, ChevronRight } from "lucide-react";
import { RecipeBook, Recipe } from "../types";

interface RecipeBookModalProps {
  book: RecipeBook | null;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({
  book,
  onClose,
  onSelectRecipe,
}) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col text-slate-900 shadow-2xl overflow-hidden">
        {/* Cover Hero */}
        <div className="relative h-48 w-full shrink-0 bg-slate-100">
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-black/30" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 space-y-1 text-white">
            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
              {book.category} Cookbook
            </span>
            <h2 className="font-extrabold text-lg text-white tracking-tight drop-shadow-md">{book.title}</h2>
            <p className="text-[11px] text-slate-200">By {book.author}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          <p className="text-slate-600 leading-relaxed">{book.description}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Curated Recipes ({book.featuredRecipes.length})
              </h3>
            </div>

            <div className="space-y-2.5">
              {book.featuredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => {
                    onClose();
                    onSelectRecipe(recipe);
                  }}
                  className="bg-slate-50 border border-slate-200 hover:border-blue-500 p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group hover:bg-white hover:shadow-sm"
                >
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{recipe.rating}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 font-semibold text-[10px]">{recipe.difficulty}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors truncate">
                      {recipe.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {recipe.prepTimeMin + recipe.cookTimeMin} min
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Flame className="w-3 h-3" />
                        {recipe.applianceSettings.preset}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
