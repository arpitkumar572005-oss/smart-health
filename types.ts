
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: string; // Base64 image
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // "Morning", "Afternoon", "Evening", "Night"
  duration: string; // e.g., "7 Days"
  taken: boolean;
}

export interface HealthMetric {
  label: string;
  value: string | number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface ReportAnalysis {
  testName: string;
  value: string;
  unit: string;
  status: 'Normal' | 'Abnormal';
  explanation: string;
}

export interface SymptomAnalysis {
  condition: string;
  probability: string;
  description: string;
  recommendation: string;
  severity: 'Low' | 'Moderate' | 'High';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  REPORT = 'REPORT',
  MEDICINE = 'MEDICINE',
  EMERGENCY = 'EMERGENCY',
  INSIGHTS = 'INSIGHTS',
  SYMPTOM_CHECKER = 'SYMPTOM_CHECKER'
}

export interface EmergencyGuide {
  title: string;
  steps: string[];
  icon: string;
}

export interface User {
  name: string;
  email: string;
}
