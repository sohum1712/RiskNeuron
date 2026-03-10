/**
 * SwiftCover API Client
 * Axios-based HTTP client for all backend API calls
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  Worker,
  WorkerCreate,
  OnboardingResponse,
  Policy,
  PolicyCreate,
  Claim,
  DisruptionEvent,
  DisruptionSimulateRequest,
  SimulationResult,
  DashboardData,
  AnalyticsOverview,
  ActivityLogRequest,
  WorkerActivity,
  HealthResponse,
} from "../types";

// ============================================================================
// Axios Instance Configuration
// ============================================================================

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Error interceptor for logging
api.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error("Network Error:", error.message);
    } else {
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Worker API Functions
// ============================================================================

/**
 * Register a new worker and get onboarding response with risk profile and plans
 */
export const registerWorker = async (
  data: WorkerCreate
): Promise<OnboardingResponse> => {
  const response = await api.post<OnboardingResponse>("/workers/register", data);
  return response.data;
};

/**
 * Get single worker by ID
 */
export const getWorker = async (workerId: number): Promise<Worker> => {
  const response = await api.get<Worker>(`/workers/${workerId}`);
  return response.data;
};

/**
 * Get worker dashboard with all aggregated data
 */
export const getDashboard = async (workerId: number): Promise<DashboardData> => {
  const response = await api.get<DashboardData>(`/workers/${workerId}/dashboard`);
  return response.data;
};

/**
 * Get all active workers (admin)
 */
export const getAllWorkers = async (): Promise<Worker[]> => {
  const response = await api.get<Worker[]>("/workers");
  return response.data;
};

// ============================================================================
// Policy API Functions
// ============================================================================

/**
 * Create a new policy for a worker
 */
export const createPolicy = async (data: PolicyCreate): Promise<Policy> => {
  const response = await api.post<Policy>("/policies/create", data);
  return response.data;
};

/**
 * Get all policies for a worker
 */
export const getWorkerPolicies = async (workerId: number): Promise<Policy[]> => {
  const response = await api.get<Policy[]>(`/policies/worker/${workerId}`);
  return response.data;
};

/**
 * Renew an existing policy (extends by 7 days)
 */
export const renewPolicy = async (policyId: number): Promise<Policy> => {
  const response = await api.post<Policy>(`/policies/${policyId}/renew`);
  return response.data;
};

/**
 * Upgrade a policy to a different plan
 */
export const upgradePolicy = async (
  policyId: number,
  planType: string
): Promise<Policy> => {
  const response = await api.put<Policy>(`/policies/${policyId}/upgrade`, {
    plan_type: planType,
  });
  return response.data;
};

// ============================================================================
// Claim API Functions
// ============================================================================

/**
 * Get all claims with optional filters
 */
export const getAllClaims = async (
  status?: string,
  workerId?: number,
  limit?: number
): Promise<Claim[]> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (workerId) params.append("worker_id", workerId.toString());
  if (limit) params.append("limit", limit.toString());

  const response = await api.get<Claim[]>(`/claims?${params.toString()}`);
  return response.data;
};

/**
 * Get all claims for a specific worker
 */
export const getWorkerClaims = async (workerId: number): Promise<Claim[]> => {
  const response = await api.get<Claim[]>(`/claims/worker/${workerId}`);
  return response.data;
};

/**
 * Process payout for an approved claim
 */
export const processClaimPayout = async (
  claimId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>(
    `/claims/${claimId}/payout`
  );
  return response.data;
};

/**
 * Admin review of a fraud-flagged claim
 */
export const reviewClaim = async (
  claimId: number,
  action: "approve" | "reject",
  reason?: string
): Promise<Claim> => {
  const response = await api.post<Claim>(`/claims/${claimId}/review`, {
    action,
    reason,
  });
  return response.data;
};

// ============================================================================
// Disruption API Functions
// ============================================================================

/**
 * Simulate a disruption event (main demo endpoint)
 */
export const simulateDisruption = async (
  data: DisruptionSimulateRequest
): Promise<SimulationResult> => {
  const response = await api.post<SimulationResult>("/disruptions/simulate", data);
  return response.data;
};

/**
 * Get active disruptions with optional city filter
 */
export const getActiveDisruptions = async (
  city?: string
): Promise<DisruptionEvent[]> => {
  const params = city ? `?city=${city}` : "";
  const response = await api.get<DisruptionEvent[]>(`/disruptions/active${params}`);
  return response.data;
};

/**
 * Get disruption history with optional filters
 */
export const getDisruptionHistory = async (
  city?: string,
  limit?: number
): Promise<DisruptionEvent[]> => {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  if (limit) params.append("limit", limit.toString());

  const response = await api.get<DisruptionEvent[]>(
    `/disruptions/history?${params.toString()}`
  );
  return response.data;
};

// ============================================================================
// Activity API Functions
// ============================================================================

/**
 * Log daily activity for a worker
 */
export const logActivity = async (
  data: ActivityLogRequest
): Promise<WorkerActivity> => {
  const response = await api.post<WorkerActivity>("/activity/log", data);
  return response.data;
};

/**
 * Get activity history for a worker
 */
export const getWorkerActivity = async (
  workerId: number,
  days: number = 30
): Promise<WorkerActivity[]> => {
  const response = await api.get<WorkerActivity[]>(
    `/activity/worker/${workerId}?days=${days}`
  );
  return response.data;
};

// ============================================================================
// Analytics API Functions
// ============================================================================

/**
 * Get analytics overview with KPIs and trends
 */
export const getAnalytics = async (): Promise<AnalyticsOverview> => {
  const response = await api.get<AnalyticsOverview>("/analytics/overview");
  return response.data;
};

// ============================================================================
// Health Check
// ============================================================================

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>("/health");
  return response.data;
};

// Export axios instance for custom requests if needed
export default api;
