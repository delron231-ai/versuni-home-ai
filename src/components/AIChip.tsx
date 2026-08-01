import React from "react";
import { Sparkles } from "lucide-react";

interface AIChipProps {
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export const AIChip: React.FC<AIChipProps> = ({ label = "AI", size = "sm", className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tracking-wider rounded-full bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40 ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      <Sparkles className={size === "sm" ? "w-2.5 h-2.5 text-[#3B82F6]" : "w-3 h-3 text-[#3B82F6]"} />
      {label}
    </span>
  );
};
