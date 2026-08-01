import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, RefreshCw, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { Appliance, Ingredient, Household, ShoppingItem, ChatMessage } from "../types";
import { AIChip } from "./AIChip";

interface AssistantDrawerProps {
  appliances: Appliance[];
  pantry: Ingredient[];
  shoppingList: ShoppingItem[];
  household: Household;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  onAddShoppingItem?: (name: string) => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  appliances,
  pantry,
  shoppingList,
  household,
  chatMessages,
  onSendMessage,
  onClearChat,
  onAddShoppingItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const expiringCount = pantry.filter((i) => i.useSoon || (i.expiryDate && i.expiryDate.toLowerCase().includes("expiring"))).length;
  const connectedAppliances = appliances.filter((a) => a.connected);

  const suggestedPrompts = [
    "What's expiring soon?",
    "Make my home guest-ready tonight",
    "A coffee recipe for my machine",
    "What can I cook in 20 minutes?",
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    try {
      await onSendMessage(query);
    } catch (err: any) {
      setError("Failed to get response from Gemini AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initialGreeting = `Hello! I'm your Versuni Home AI Assistant. I see you've got ${
    connectedAppliances.length > 0 ? connectedAppliances.map((a) => a.model.split(" ")[0]).join(", ") : "your smart appliances"
  }${expiringCount > 0 ? `, and ${expiringCount} item(s) expiring soon in your pantry.` : "."} How can I help coordinate your home or cook today?`;

  return (
    <>
      {/* Floating Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#2563EB] text-white shadow-[0_4px_20px_rgba(59,130,246,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        title="Open Versuni AI Assistant"
      >
        <Sparkles className="w-5 h-5 text-white animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#3B82F6] border-2 border-[#0B1437]"></span>
        </span>
      </button>

      {/* Slide-Up Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
          <div className="bg-[#0B1437] border-t border-[#24326B] rounded-t-3xl h-[88vh] max-w-md w-full mx-auto flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-[#16204A] px-4 py-3 border-b border-[#24326B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-white text-sm">Versuni Assistant</h3>
                    <AIChip label="AI" size="sm" />
                  </div>
                  <p className="text-[10px] text-[#94A3B8]">
                    Aware of {appliances.length} appliances & {pantry.length} pantry items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {chatMessages.length > 0 && (
                  <button
                    onClick={onClearChat}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0B1437]"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0B1437]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* First greeting banner */}
              <div className="bg-[#16204A] border border-[#24326B] rounded-2xl p-3.5 text-xs text-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1 text-[#3B82F6] font-semibold">
                  <AIChip label="Versuni AI" size="sm" />
                  <span>Smart Assistant</span>
                </div>
                <p className="leading-relaxed text-[#94A3B8]">{initialGreeting}</p>

                {/* Suggested Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      disabled={loading}
                      className="text-[11px] bg-[#0B1437] hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 px-2.5 py-1 rounded-full text-left transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message List */}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 text-xs ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-[#3B82F6]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#3B82F6] text-white rounded-tr-none font-medium"
                        : "bg-[#16204A] border border-[#24326B] text-slate-100 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.role === "ai" && (
                      <div className="mb-1 flex items-center gap-1">
                        <AIChip label="AI" size="sm" />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-[#16204A] border border-[#24326B] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-[#3B82F6] p-2 bg-[#16204A] border border-[#24326B] rounded-2xl w-max">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Versuni AI is thinking...</span>
                </div>
              )}

              {/* Error state with retry */}
              {error && (
                <div className="bg-red-950/40 border border-red-700/50 rounded-xl p-3 text-xs text-red-200 flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => handleSend(chatMessages[chatMessages.length - 1]?.text)}
                    className="flex items-center gap-1 bg-red-900/60 px-2 py-1 rounded-lg text-white font-medium hover:bg-red-800"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#16204A] border-t border-[#24326B]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask about coffee, air quality, dinner options..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-[#0B1437] border border-[#24326B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-[#3B82F6] text-white disabled:opacity-40 hover:bg-[#2563EB] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
