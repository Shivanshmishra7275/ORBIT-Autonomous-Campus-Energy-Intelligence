import type { AnalysisRequest, AnalysisResponse, Building } from '../types/contracts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getBuildings(): Promise<Building[]> {
  return request<Building[]>('/buildings');
}

export function runAnalysis(payload: AnalysisRequest): Promise<AnalysisResponse> {
  return request<AnalysisResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
