import { Appliance, Ingredient, Household, SavedRecipe, ShoppingItem, CoordinationCard, ChatMessage } from "../types";
import { INITIAL_APPLIANCES, INITIAL_HOUSEHOLD, INITIAL_INGREDIENTS, INITIAL_STANDING_CARDS, INITIAL_SHOPPING } from "../data/seedData";

const STORAGE_KEYS = {
  APPLIANCES: "versuni_appliances_v1",
  INGREDIENTS: "versuni_ingredients_v1",
  HOUSEHOLD: "versuni_household_v1",
  SAVED_RECIPES: "versuni_saved_recipes_v1",
  SHOPPING: "versuni_shopping_v1",
  CARDS: "versuni_cards_v1",
  CHAT: "versuni_chat_v1",
};

export const getStoredAppliances = (): Appliance[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLIANCES);
    if (!raw) return INITIAL_APPLIANCES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_APPLIANCES;
  } catch (e) {
    return INITIAL_APPLIANCES;
  }
};

export const setStoredAppliances = (items: Appliance[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(items));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

export const getStoredIngredients = (): Ingredient[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (!raw) return INITIAL_INGREDIENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_INGREDIENTS;
  } catch (e) {
    return INITIAL_INGREDIENTS;
  }
};

export const setStoredIngredients = (items: Ingredient[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(items));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

export const getStoredHousehold = (): Household => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD);
    if (!raw) return INITIAL_HOUSEHOLD;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_HOUSEHOLD;
  }
};

export const setStoredHousehold = (hh: Household): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(hh));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

export const getStoredSavedRecipes = (): SavedRecipe[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_RECIPES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const setStoredSavedRecipes = (recipes: SavedRecipe[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

export const getStoredShopping = (): ShoppingItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (!raw) return INITIAL_SHOPPING;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SHOPPING;
  } catch (e) {
    return INITIAL_SHOPPING;
  }
};

export const setStoredShopping = (items: ShoppingItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(items));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

export const getStoredCards = (): CoordinationCard[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) return INITIAL_STANDING_CARDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STANDING_CARDS;
  } catch (e) {
    return INITIAL_STANDING_CARDS;
  }
};

export const setStoredCards = (cards: CoordinationCard[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

export const getStoredChat = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const setStoredChat = (messages: ChatMessage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
  } catch (e) {
    console.error("Storage save error", e);
  }
};
