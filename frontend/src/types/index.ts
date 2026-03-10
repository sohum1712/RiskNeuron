/**
 * SwiftCover TypeScript Type Definitions
 * Matches backend Pydantic schemas and SQLAlchemy models
 */

// ============================================================================
// Enums & Type Aliases
// ============================================================================

export type Platform = "zepto" | "blinkit" | "swiggy_instamart" | "multiple";
export type RiskTier = "low" | "medium" | "high";
export type PlanType = "basic" | "standard" | "premium";
export type PolicyStatus = "active" | "expired" | "cancelled";
export type ClaimStatus = "pending" | "approved" | "rejected" | "paid" | "flagged_fraud";
export type ShiftType = "morning" | "evening" | "night" | "flexible";
export type City = "Mumbai" | "Delhi" | "Chennai" | "Hyderabad" | "Pune" | "Bangalore";

export type DisruptionType =
  | "heavy_rain"
  | "flood"
  | "extreme_heat"
  | "severe_pollution"
  | "traffic_shutdown"
  | "curfew"
  | "local_strike"
  | "dark_store_closure"
  | "app_outage";

export type Severity = "mild" | "moderate" | "severe" | "extreme";

// ============================================================================
// Worker Types
// ============================================================================

export interface Worker {
  id: number;
  name: string;
  phone: string;
  city: string;
  dark_store_name: string;
  zone_name: string;
  platform: string;
  avg_daily_orders: number;
  avg_daily_earnings: number;
  shift_type: string;
  experience_months: number;
  risk_score: number;
  risk_tier: string;
  zone_flood_risk: number;
  zone_heat_risk: number;
  zone_pollution_risk: number;
  upi_id: string | null;
  created_at: string;
  is_active: boolean;
}

export interface WorkerCreate {
  name: string;
  phone: string;
  city: City;
  dark_store_name: string;
  zone_name: string;
  platform: Platform;
  avg_daily_orders: number;
  shift_type: ShiftType;
  experience_months: number;
  upi_id?: string;
}

export interface RiskProfile {
  risk_score: number;
  risk_tier: RiskTier;
  risk_factors: string[];
  zone_flood_risk: number;
  zone_heat_risk: number;
  zone_pollution_risk: number;
}

export interface PlanOption {
  plan_type: PlanType;
  weekly_premium: number;
  weekly_coverage_limit: number;
  daily_coverage_limit: number;
  min_orders_threshold: number;
  covered_disruptions: string[];
  recommended: boolean;
  savings_potential_monthly: number;
}

export interface OnboardingResponse {
  worker: Worker;
  risk_profile: RiskProfile;
  recommended_plans: PlanOption[];
  message: string;
}

// ============================================================================
// Policy Types
// ============================================================================

export interface Policy {
  id: number;
  worker_id: number;
  plan_type: string;
  weekly_premium: number;
  weekly_coverage_limit: number;
  daily_coverage_limit: number;
  min_orders_threshold: number;
  parametric_triggers: Record<string, number>;
  covered_disruptions: string[];
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  created_at: string;
  days_remaining: number;
  is_valid_today: boolean;
  coverage_used_this_week: number;
}

export interface PolicyCreate {
  worker_id: number;
  plan_type: PlanType;
  auto_renew?: boolean;
}

// ============================================================================
// Claim Types
// ============================================================================

export interface Claim {
  id: number;
  worker_id: number;
  policy_id: number;
  disruption_event_id: number;
  claim_date: string;
  expected_orders: number | null;
  actual_orders: number | null;
  expected_earnings: number;
  actual_earnings: number;
  income_loss: number;
  disruption_impact_factor: number;
  payout_amount: number;
  status: string;
  fraud_score: number;
  fraud_flags: string[];
  auto_processed: boolean;
  rejection_reason: string | null;
  processed_at: string;
  paid_at: string | null;
  payment_reference: string | null;
  upi_transaction_id: string | null;
  worker_name?: string;
  disruption_type?: string;
}

export interface ClaimDetail {
  worker_name: string;
  platform: string;
  zone: string;
  expected_earnings: number;
  actual_earnings: number;
  payout: number;
  status: string;
  fraud_flags: string[];
  upi_transaction_id: string | null;
}

// ============================================================================
// Disruption Types
// ============================================================================

export interface DisruptionEvent {
  id: number;
  city: string;
  zone_name: string | null;
  disruption_type: string;
  severity: string;
  rainfall_mm: number | null;
  aqi: number | null;
  traffic_index: number | null;
  temperature_celsius: number | null;
  started_at: string;
  ended_at: string | null;
  duration_hours: number | null;
  is_active: boolean;
  source: string;
  dark_stores_closed: number;
  estimated_order_drop_pct: number;
  affected_workers_count: number;
  total_claims_triggered: number;
  total_payout_amount: number;
  created_at: string;
}

export interface DisruptionSimulateRequest {
  city: City;
  zone_name?: string;
  disruption_type: DisruptionType;
  severity: Severity;
  duration_hours?: number;
  rainfall_mm?: number;
  aqi?: number;
  traffic_index?: number;
  temperature_celsius?: number;
}

export interface SimulationResult {
  disruption_event: DisruptionEvent;
  affected_workers: number;
  policies_evaluated: number;
  claims_approved: number;
  claims_rejected: number;
  claims_fraud_flagged: number;
  total_payout: number;
  processing_time_seconds: number;
  claim_details: ClaimDetail[];
}

// ============================================================================
// Activity Types
// ============================================================================

export interface WorkerActivity {
  id: number;
  worker_id: number;
  date: string;
  orders_completed: number;
  working_hours: number;
  earnings: number;
  online_hours: number;
  peak_hour_orders: number;
  platform: string | null;
  is_disruption_day: boolean;
  disruption_event_id: number | null;
}

export interface ActivityLogRequest {
  worker_id: number;
  date: string;
  orders_completed: number;
  working_hours: number;
  earnings: number;
  online_hours?: number;
  peak_hour_orders?: number;
  platform?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface EarningsDataPoint {
  date: string;
  expected: number;
  actual: number;
  is_disruption_day: boolean;
}

export interface WeeklyStats {
  earnings: number;
  orders: number;
  coverage_used: number;
  coverage_remaining: number;
  days_remaining: number;
}

export interface DashboardData {
  worker: Worker;
  active_policy: Policy | null;
  active_disruptions: DisruptionEvent[];
  this_week_stats: WeeklyStats;
  earnings_chart: EarningsDataPoint[];
  recent_claims: Claim[];
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface CityStats {
  city: string;
  worker_count: number;
  active_policies: number;
  claims_this_week: number;
  avg_risk_score: number;
  total_payout: number;
}

export interface WeeklyTrend {
  week_start: string;
  premiums_collected: number;
  payouts_made: number;
  claims_count: number;
  loss_ratio: number;
}

export interface AnalyticsOverview {
  total_workers: number;
  active_policies: number;
  active_disruptions: number;
  claims_this_week: number;
  payouts_this_week: number;
  premiums_this_week: number;
  loss_ratio: number;
  fraud_caught_this_week: number;
  fraud_amount_saved: number;
  city_stats: CityStats[];
  weekly_trend: WeeklyTrend[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  detail: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}
