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
    }, 600);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`relative h-9 w-9 rounded-lg overflow-hidden transition-all duration-300 ${
        isAnimating ? "scale-110 rotate-180" : "scale-100 rotate-0"
      }`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Animated background glow */}
      <div
        className={`absolute inset-0 rounded-lg transition-all duration-500 ${
          theme === "light"
            ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20"
            : "bg-gradient-to-br from-blue-400/20 to-purple-500/20"
        } ${isAnimating ? "opacity-100 scale-150" : "opacity-0 scale-100"}`}
      />
      
      {/* Particle effect container */}
      <div className="absolute inset-0 pointer-events-none">
        {isAnimating && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${
                  theme === "light" ? "bg-amber-400" : "bg-blue-400"
                }`}
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`,
                  animation: `particle-${i} 0.6s ease-out forwards`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Icons with enhanced animations */}
      <Sun
        className={`h-5 w-5 absolute transition-all duration-500 ${
          theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-180 scale-0 opacity-0"
        } ${isAnimating ? "drop-shadow-lg" : ""}`}
        style={{
          filter: isAnimating && theme === "light" ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))" : "none",
        }}
      />
      <Moon
        className={`h-5 w-5 absolute transition-all duration-500 ${
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-180 scale-0 opacity-0"
        } ${isAnimating ? "drop-shadow-lg" : ""}`}
        style={{
          filter: isAnimating && theme === "dark" ? "drop-shadow(0 0 8px rgba(96, 165, 250, 0.8))" : "none",
        }}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}




