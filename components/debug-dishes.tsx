"use client";

import { useEffect, useState } from "react";

interface DebugInfo {
  dishesCount: number;
  error: string | null;
  queryParams: any;
  databaseUrl: string | null;
  timestamp: string;
}

export function DebugDishes() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        // Fetch debug info from an API route
        const response = await fetch("/api/debug/dishes");
        const data = await response.json();
        setDebugInfo(data);
      } catch (error: any) {
        setDebugInfo({
          dishesCount: 0,
          error: error.message || "Failed to fetch debug info",
          queryParams: null,
          databaseUrl: null,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 p-4 m-4 rounded-lg">
        <p className="text-sm font-mono">Loading debug info...</p>
      </div>
    );
  }

  if (!debugInfo) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 p-4 m-4 rounded-lg font-mono text-xs">
      <h3 className="font-bold mb-2 text-yellow-800">🐛 DEBUG INFO (Remove in production)</h3>
      
      <div className="space-y-1 text-yellow-900">
        <div>
          <strong>Dishes Found:</strong> {debugInfo.dishesCount}
        </div>
        
        <div>
          <strong>Timestamp:</strong> {new Date(debugInfo.timestamp).toLocaleString()}
        </div>
        
        {debugInfo.queryParams && (
          <div>
            <strong>Query Params:</strong>{" "}
            <span className="bg-yellow-100 px-1 rounded">
              {JSON.stringify(debugInfo.queryParams)}
            </span>
          </div>
        )}
        
        {debugInfo.databaseUrl && (
          <div>
            <strong>DB URL Type:</strong>{" "}
            <span className="bg-yellow-100 px-1 rounded">
              {debugInfo.databaseUrl.includes("pooler") ? "Pooler ✅" : "Direct ⚠️"}
            </span>
          </div>
        )}
        
        {debugInfo.error && (
          <div className="bg-red-100 border border-red-300 p-2 rounded mt-2">
            <strong className="text-red-800">Error:</strong>{" "}
            <span className="text-red-700">{debugInfo.error}</span>
          </div>
        )}
        
        {!debugInfo.error && debugInfo.dishesCount === 0 && (
          <div className="bg-orange-100 border border-orange-300 p-2 rounded mt-2">
            <strong className="text-orange-800">⚠️ No dishes found!</strong>
            <p className="text-orange-700 mt-1">
              Check: 1) Database has dishes, 2) Dishes are active (isActive: true), 3) Database connection works
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

