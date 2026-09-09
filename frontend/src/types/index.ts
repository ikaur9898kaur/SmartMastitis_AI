export type UserRole = 'farmer' | 'veterinarian' | 'admin' | 'field_personnel';
export type Language = 'en' | 'hi' | 'pa';
export type MastitisRiskLevel = 'NO RISK' | 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';

export interface Animal {
  id: number;
  animal_id: string;
  tag_number: string;
  rfid_id?: string;
  species: 'Cow' | 'Buffalo';
  breed: string;
  age_years: number;
  sex: string;
  weight_kg: number;
  body_condition_score: number;
  lactation_number: number;
  days_in_lactation: number;
  pregnancy_status: string;
  current_milk_yield: number;
  previous_mastitis: boolean;
  previous_mastitis_count: number;
  current_treatment: boolean;
  vaccination_status: 'UP TO DATE' | 'DUE SOON' | 'OVERDUE' | 'UNKNOWN';
  current_mastitis_risk: MastitisRiskLevel;
  risk_probability: number;
  risk_percentage: number;
  prediction_window: string;
  farm_zone: string;
  shed: string;
  pen: string;
  last_updated?: string;
}

export interface MetricDeviation {
  metric: string;
  current: number;
  baseline: number;
  absolute_change: number;
  percentage_change: number;
  status: string;
  source: string;
  unit: string;
}

export interface ContributingFactor {
  feature: string;
  current_value: string;
  baseline_value: string;
  change_pct: number;
  impact_level: 'High' | 'Moderate' | 'Low';
  description: string;
}

export interface PredictionResult {
  animal_id: string;
  tag_number: string;
  species: string;
  breed: string;
  risk_probability: number;
  risk_percentage: number;
  risk_level: MastitisRiskLevel;
  forecast_horizon: string;
  model_version: string;
  alert_banner: string;
  diagnostic_disclaimer: string;
  confidence_note: string;
  contributing_factors: ContributingFactor[];
  recommendations: string[];
}

export interface TelemetryPoint {
  date: string;
  timestamp: string;
  activity: number;
  baseline_activity: number;
  rumination: number;
  baseline_rumination: number;
  conductivity: number;
  baseline_conductivity: number;
  milk_yield: number;
  baseline_milk_yield: number;
  scc?: number;
  baseline_scc?: number;
  surface_temp?: number;
  risk_probability: number;
}

export interface DashboardStats {
  farm_name: string;
  farm_id: string;
  location: string;
  herd_strength: {
    total_animals: number;
    cattle: number;
    buffaloes: number;
    lactating: number;
    dry: number;
    pregnant: number;
    recently_calved: number;
    under_treatment: number;
  };
  mastitis_risk: {
    no_risk: number;
    low_risk: number;
    moderate_risk: number;
    high_risk: number;
    critical_risk: number;
  };
  averages: {
    average_milk_yield: number;
    average_scc: number;
    average_conductivity: number;
    average_milk_ph: number;
    average_activity: number;
    average_rumination: number;
    average_shed_temp: number;
    average_humidity: number;
    animals_under_treatment: number;
    vaccinations_due: number;
    devices_offline: number;
  };
}

export interface AlertItem {
  alert_id: number;
  animal_id?: string;
  alert_type: string;
  severity: 'INFO' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  message: string;
  details: string;
  action_required: string;
  channels: string;
  is_resolved: boolean;
  is_acknowledged: boolean;
  created_at: string;
  source: string;
}

export interface DeviceItem {
  device_id: string;
  device_type: string;
  connected_animal?: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  battery: number;
  signal_strength: string;
  power_source: string;
  firmware_version: string;
  calibration_status: string;
  cleaning_status: string;
  last_seen: string;
}
