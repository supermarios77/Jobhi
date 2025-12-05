"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Navigation progress indicator that shows when pages are loading
 * Uses pathname changes to detect navigation
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading when pathname changes
    setIsLoading(true);
    setProgress(0);

    // Simulate progress with realistic timing
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 80) {
          return prev;
        }
        // Slow down as we approach 80%
        const increment = prev < 50 ? 15 : 5;
        return Math.min(prev + increment, 80);
      });
    }, 100);

    // Complete the progress bar after a short delay
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-background/20">
      <div
        className="h-full bg-foreground transition-all duration-200 ease-out shadow-sm"
        style={{ 
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)"
        }}
      />
    </div>
  );
}

