import React from "react";
import { Home, Utensils, Sparkles, Sliders } from "lucide-react";

export type TabType = "home" | "cook" | "care" | "appliances";

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingCardsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  pendingCardsCount = 0,
}) => {
  const tabs = [
    { id: "home" as TabType, label: "Home", icon: Home, badge: pendingCardsCount },
    { id: "cook" as TabType, label: "Cook", icon: Utensils },
    { id: "care" as TabType, label: "Care", icon: Sparkles },
    { id: "appliances" as TabType, label: "Appliances", icon: Sliders },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 text-blue-600" : ""}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? "text-blue-600 font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
