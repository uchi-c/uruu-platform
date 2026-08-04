"use client";

import { useState } from 'react';

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const analyzeIncident = async (incidentId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, response, analyzeIncident };
}
