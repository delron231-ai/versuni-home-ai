import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navbar, TabType } from "./components/Navbar";
import { ToastContainer, ToastMessage } from "./components/Toast";
import { AssistantDrawer } from "./components/AssistantDrawer";
import { HomeTab } from "./components/tabs/HomeTab";
import { CookTab } from "./components/tabs/CookTab";
import { CareTab } from "./components/tabs/CareTab";
import { AppliancesTab } from "./components/tabs/AppliancesTab";

import {
  Appliance,
  Ingredient,
  Household,
  SavedRecipe,
  ShoppingItem,
  CoordinationCard,
  ChatMessage,
} from "./types";
import {
  getStoredAppliances,
  setStoredAppliances,
  getStoredIngredients,
  setStoredIngredients,
  getStoredHousehold,
  setStoredHousehold,
  getStoredSavedRecipes,
  setStoredSavedRecipes,
  getStoredShopping,
  setStoredShopping,
  getStoredCards,
  setStoredCards,
  getStoredChat,
  setStoredChat,
} from "./lib/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  // Persistent States
  const [appliances, setAppliancesState] = useState<Appliance[]>(getStoredAppliances);
  const [pantry, setPantryState] = useState<Ingredient[]>(getStoredIngredients);
  const [household, setHouseholdState] = useState<Household>(getStoredHousehold);
  const [savedRecipes, setSavedRecipesState] = useState<SavedRecipe[]>(getStoredSavedRecipes);
  const [shoppingList, setShoppingListState] = useState<ShoppingItem[]>(getStoredShopping);
  const [cards, setCardsState] = useState<CoordinationCard[]>(getStoredCards);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>(getStoredChat);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Check API key health
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.hasApiKey === "boolean") {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch(() => {
        // Assume key exists if check fails
      });
  }, []);

  // Sync to local storage on change
  const updateAppliances = (newAppliances: Appliance[]) => {
    setAppliancesState(newAppliances);
    setStoredAppliances(newAppliances);
  };

  const updatePantry = (newPantry: Ingredient[]) => {
    setPantryState(newPantry);
    setStoredIngredients(newPantry);
  };

  const updateHousehold = (newHh: Household) => {
    setHouseholdState(newHh);
    setStoredHousehold(newHh);
    showToast("Household settings updated", "info");
  };

  const updateSavedRecipes = (recipe: SavedRecipe) => {
    const updated = [recipe, ...savedRecipes.filter((r) => r.id !== recipe.id)];
    setSavedRecipesState(updated);
    setStoredSavedRecipes(updated);
  };

  const updateShoppingList = (name: string, addedFrom?: string) => {
    const newItem: ShoppingItem = { id: `shop-${Date.now()}`, name, addedFrom };
    const updated = [...shoppingList, newItem];
    setShoppingListState(updated);
    setStoredShopping(updated);
  };

  const updateCards = (newCards: CoordinationCard[]) => {
    setCardsState(newCards);
    setStoredCards(newCards);
  };

  const updateChat = (messages: ChatMessage[]) => {
    setChatMessagesState(messages);
    setStoredChat(messages);
  };

  // Toast Helper
  const showToast = (text: string, type: "success" | "info" | "amber" = "success") => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}-${Math.random()}`, text, type };
    setToasts((prev) => [newToast, ...prev]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Consumable reorder helper
  const handleReorderConsumable = (applianceId: string, consumableName: string) => {
    const updated = appliances.map((a) => {
      if (a.id === applianceId && a.consumables) {
        return {
          ...a,
          consumables: a.consumables.map((c) =>
            c.name === consumableName ? { ...c, level: 100, daysLeft: 180 } : c
          ),
        };
      }
      return a;
    });
    updateAppliances(updated);
    showToast(`Reorder placed for ${consumableName}! Stock reset to 100%`, "success");
  };

  // Appliance Connection Toggle
  const handleToggleConnection = (id: string) => {
    const updated = appliances.map((a) => (a.id === id ? { ...a, connected: !a.connected } : a));
    updateAppliances(updated);
    const target = updated.find((a) => a.id === id);
    showToast(`${target?.model} is now ${target?.connected ? "Connected" : "Offline"}`, "info");
  };

  // Appliance Actions
  const handleAddAppliance = (app: Appliance) => {
    updateAppliances([...appliances, app]);
  };

  const handleRemoveAppliance = (id: string) => {
    updateAppliances(appliances.filter((a) => a.id !== id));
  };

  // Assistant Chat Call
  const handleSendChatMessage = async (userText: string) => {
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: "user", text: userText, ts: Date.now() };
    const nextMessages = [...chatMessages, userMsg];
    updateChat(nextMessages);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
          context: {
            appliances: appliances.filter((a) => a.connected),
            pantry,
            shoppingList,
            household,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Chat response failed.");
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "ai",
        text: data.text || "I'm sorry, I couldn't generate a response.",
        ts: Date.now(),
      };
      updateChat([...nextMessages, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "ai",
        text: "Something went wrong sending your message to Versuni AI. Please try again.",
        ts: Date.now(),
      };
      updateChat([...nextMessages, errorMsg]);
      throw err;
    }
  };

  const handleClearChat = () => {
    updateChat([]);
    showToast("Chat history cleared", "info");
  };

  const pendingCardsCount = cards.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Mobile Shell Frame */}
      <div className="min-h-screen max-w-md mx-auto relative flex flex-col shadow-xl border-x border-slate-200 bg-slate-50">
        {/* Header */}
        <Header
          household={household}
          appliances={appliances}
          onUpdateHousehold={updateHousehold}
          hasApiKey={hasApiKey}
        />

        {/* Tab Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "home" && (
            <HomeTab
              appliances={appliances}
              household={household}
              cards={cards}
              onUpdateCards={updateCards}
              onToast={showToast}
              onReorderConsumable={handleReorderConsumable}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "cook" && (
            <CookTab
              appliances={appliances}
              pantry={pantry}
              savedRecipes={savedRecipes}
              shoppingList={shoppingList}
              onUpdatePantry={updatePantry}
              onSaveRecipe={updateSavedRecipes}
              onAddToShoppingList={updateShoppingList}
              onToast={showToast}
            />
          )}

          {activeTab === "care" && (
            <CareTab
              appliances={appliances}
              onToast={showToast}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "appliances" && (
            <AppliancesTab
              appliances={appliances}
              onAddAppliance={handleAddAppliance}
              onRemoveAppliance={handleRemoveAppliance}
              onToggleConnection={handleToggleConnection}
              onReorderConsumable={handleReorderConsumable}
              onToast={showToast}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
        </main>

        {/* Assistant Chat Slide-up Drawer */}
        <AssistantDrawer
          appliances={appliances}
          pantry={pantry}
          shoppingList={shoppingList}
          household={household}
          chatMessages={chatMessages}
          onSendMessage={handleSendChatMessage}
          onClearChat={handleClearChat}
          onAddShoppingItem={updateShoppingList}
        />

        {/* Bottom Navigation */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCardsCount={pendingCardsCount}
        />
      </div>
    </div>
  );
}
