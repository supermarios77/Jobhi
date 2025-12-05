"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { playThemeSwitchSound } from "@/lib/utils/sound";
import { useState } from "react";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    // Play sound effect
    playThemeSwitchSound();
    
    // Trigger animation
    setIsAnimating(true);
    
    // Toggle theme
    toggleTheme();
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`relative h-10 w-10 rounded-full overflow-visible border-2 transition-all duration-300 group ${
        isAnimating
          ? theme === "light"
            ? "border-amber-400/50 scale-105"
            : "border-blue-400/50 scale-105"
          : "border-border hover:border-foreground/30"
      }`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Elegant ripple effect */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          theme === "light"
            ? "bg-gradient-to-br from-amber-200/30 via-orange-200/20 to-yellow-200/30"
            : "bg-gradient-to-br from-blue-200/30 via-indigo-200/20 to-purple-200/30"
        } ${
          isAnimating ? "scale-150 opacity-100" : "scale-100 opacity-0"
        }`}
      />

      {/* Outer glow ring */}
      <div
        className={`absolute -inset-1 rounded-full transition-all duration-700 ${
          theme === "light"
            ? "bg-gradient-to-br from-amber-400/40 to-orange-500/40"
            : "bg-gradient-to-br from-blue-400/40 to-purple-500/40"
        } ${
          isAnimating ? "opacity-100 blur-sm" : "opacity-0 blur-none"
        }`}
      />

      {/* Elegant particle effect - fewer, larger particles */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {isAnimating && (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  theme === "light" ? "bg-amber-400" : "bg-blue-400"
                }`}
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-24px)`,
                  animation: `elegant-particle-${i} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Icon container with elegant smooth transitions */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun icon - elegant fade, scale, and rotation */}
        <Sun
          className={`absolute h-5 w-5 transition-all duration-700 ease-in-out ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-180 scale-0 opacity-0"
          } ${
            isAnimating && theme === "light"
              ? "drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] brightness-110"
              : ""
          }`}
        />
        
        {/* Moon icon - elegant fade, scale, and rotation */}
        <Moon
          className={`absolute h-5 w-5 transition-all duration-700 ease-in-out ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-180 scale-0 opacity-0"
          } ${
            isAnimating && theme === "dark"
              ? "drop-shadow-[0_0_12px_rgba(96,165,250,0.9)] brightness-110"
              : ""
          }`}
        />
      </div>

      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-full bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}




