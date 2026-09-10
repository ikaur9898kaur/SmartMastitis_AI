// Support VITE_API_URL for production (Vercel -> Render)
// If VITE_API_URL is provided (e.g. 'https://smartmastitis-backend.onrender.com'), use it;
// otherwise fall back to '/api' for local development with Vite dev proxy.
const rawBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`)
  : '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }
  return response.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => fetchApi<any>('/dashboard/stats'),
  getDashboardCharts: () => fetchApi<any>('/dashboard/charts'),
  
  // Animals
  getAnimals: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchApi<any>(`/animals${query ? `?${query}` : ''}`);
  },
  getAnimalProfile: (animalId: string) => fetchApi<any>(`/animals/${animalId}`),
  getAnimalTelemetry: (animalId: string, rangeDays: number = 30) => 
    fetchApi<any>(`/animals/${animalId}/telemetry?range_days=${rangeDays}`),
    
  // Prediction & AI
  getPrediction: (animalId: string) => fetchApi<any>(`/prediction/${animalId}`),
  getProgressionDemo: () => fetchApi<any>('/prediction/demo/progression'),
  getHerdForecast: () => fetchApi<any>('/prediction/herd-forecast'),
  
  // Health
  getVaccinations: (animalId?: string) => 
    fetchApi<any[]>(`/health/vaccinations${animalId ? `?animal_id=${animalId}` : ''}`),
  addVaccination: (data: any) => 
    fetchApi<any>('/health/vaccinations', { method: 'POST', body: JSON.stringify(data) }),
  getDiseaseHistory: (animalId?: string) => 
    fetchApi<any[]>(`/health/disease-history${animalId ? `?animal_id=${animalId}` : ''}`),
  getTreatments: (animalId?: string) => 
    fetchApi<any[]>(`/health/treatments${animalId ? `?animal_id=${animalId}` : ''}`),
  addTreatment: (data: any) => 
    fetchApi<any>('/health/treatments', { method: 'POST', body: JSON.stringify(data) }),
  getLabResults: (animalId?: string) => 
    fetchApi<any[]>(`/health/lab-results${animalId ? `?animal_id=${animalId}` : ''}`),
  addLabResult: (data: any) => 
    fetchApi<any>('/health/lab-results', { method: 'POST', body: JSON.stringify(data) }),
  getObservations: (animalId?: string) => 
    fetchApi<any[]>(`/health/observations${animalId ? `?animal_id=${animalId}` : ''}`),
  addObservation: (data: any) => 
    fetchApi<any>('/health/observations', { method: 'POST', body: JSON.stringify(data) }),

  // Operations & Records
  getMilkingSessions: () => fetchApi<any[]>('/records/milking/sessions'),
  getMilkingHygieneAudits: () => fetchApi<any[]>('/records/milking/hygiene-audits'),
  getWorkerHygiene: () => fetchApi<any[]>('/records/milking/worker-hygiene'),
  getFeedingRecords: (animalId?: string) => 
    fetchApi<any[]>(`/records/feeding${animalId ? `?animal_id=${animalId}` : ''}`),
  addFeedingRecord: (data: any) => 
    fetchApi<any>('/records/feeding', { method: 'POST', body: JSON.stringify(data) }),
  getFarmHygiene: () => fetchApi<any[]>('/records/hygiene'),
  addFarmHygiene: (data: any) => 
    fetchApi<any>('/records/hygiene', { method: 'POST', body: JSON.stringify(data) }),
  getHousingRecords: () => fetchApi<any[]>('/records/housing'),

  // Alerts
  getAlerts: () => fetchApi<any[]>('/alerts'),
  acknowledgeAlert: (id: number) => fetchApi<any>(`/alerts/${id}/acknowledge`, { method: 'PUT' }),
  resolveAlert: (id: number) => fetchApi<any>(`/alerts/${id}/resolve`, { method: 'PUT' }),

  // GIS
  getFarmMap: () => fetchApi<any>('/gis/farm-map'),

  // IoT
  getDevices: () => fetchApi<any[]>('/iot/devices'),
  getMilkSensingStation: () => fetchApi<any>('/iot/milk-sensing-station'),
  sendCollarTelemetry: (data: any) => 
    fetchApi<any>('/iot/collar', { method: 'POST', body: JSON.stringify(data) }),
  sendMilkTelemetry: (data: any) => 
    fetchApi<any>('/iot/milk', { method: 'POST', body: JSON.stringify(data) }),
  sendEnvironmentTelemetry: (data: any) => 
    fetchApi<any>('/iot/environment', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getAnimalReport: (animalId: string) => fetchApi<any>(`/reports/animal/${animalId}`),
  getHerdReport: () => fetchApi<any>('/reports/herd'),

  // ML & Admin
  getModelPerformance: () => fetchApi<any>('/ml/performance'),
  getContinuousLearning: () => fetchApi<any>('/ml/continuous-learning'),
  retrainModels: () => fetchApi<any>('/ml/retrain', { method: 'POST' }),

  // Corrective & Preventive Actions (CAPA)
  getCapaActions: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchApi<any[]>(`/capa${query ? `?${query}` : ''}`);
  },
  getCapaStats: () => fetchApi<any>('/capa/stats'),
  getCapaAction: (actionId: string) => fetchApi<any>(`/capa/${actionId}`),
  createCapaAction: (data: any) => 
    fetchApi<any>('/capa', { method: 'POST', body: JSON.stringify(data) }),
  updateCapaStatus: (actionId: string, data: any) => 
    fetchApi<any>(`/capa/${actionId}/status`, { method: 'PUT', body: JSON.stringify(data) }),
};
