import { apiClient } from "./client";
import type {
  AuditLogResponse,
  DashboardEnvironmentResponse,
  DashboardFeatureResponse,
  DashboardRolloutResponse,
  DashboardSummaryResponse,
  EnvironmentCreate,
  EnvironmentResponse,
  EnvironmentUpdate,
  FeatureEvaluationResponse,
  FeatureFlagCreate,
  FeatureFlagEnvironmentResponse,
  FeatureFlagEnvironmentUpdate,
  FeatureFlagResponse,
  FeatureFlagUpdate,
  FeatureRolloutCreate,
  FeatureRolloutResponse,
  FeatureScheduleRequest,
  FeatureScheduleResponse,
  FeatureUsageAnalyticsResponse,
  UserAssignmentCreate,
  UserAssignmentResponse,
} from "../types";

// -------------------------------------------------
// Environments
// -------------------------------------------------
export const environmentApi = {
  create: (data: EnvironmentCreate) =>
    apiClient
      .post<EnvironmentResponse>("/environments", data)
      .then((r) => r.data),

  listActive: () =>
    apiClient
      .get<EnvironmentResponse[]>("/environments")
      .then((r) => r.data),

  listAll: () =>
    apiClient
      .get<EnvironmentResponse[]>("/environments/all")
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<EnvironmentResponse>(`/environments/${id}`)
      .then((r) => r.data),

  update: (id: number, data: EnvironmentUpdate) =>
    apiClient
      .put<EnvironmentResponse>(`/environments/${id}`, data)
      .then((r) => r.data),
};

// -------------------------------------------------
// Feature Flags
// -------------------------------------------------
export const featureFlagApi = {
  create: (data: FeatureFlagCreate) =>
    apiClient
      .post<FeatureFlagResponse>("/feature-flags", data)
      .then((r) => r.data),

  listAll: () =>
    apiClient
      .get<FeatureFlagResponse[]>("/feature-flags")
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<FeatureFlagResponse>(`/feature-flags/${id}`)
      .then((r) => r.data),

  update: (id: number, data: FeatureFlagUpdate) =>
    apiClient
      .put<FeatureFlagResponse>(`/feature-flags/${id}`, data)
      .then((r) => r.data),

  configureEnvironment: (
    featureFlagId: number,
    environmentId: number,
    data: FeatureFlagEnvironmentUpdate,
  ) =>
    apiClient
      .put<FeatureFlagEnvironmentResponse>(
        `/feature-flags/${featureFlagId}/environments/${environmentId}`,
        data,
      )
      .then((r) => r.data),

  evaluate: (featureKey: string, environment: string) =>
    apiClient
      .get<FeatureEvaluationResponse>(
        `/feature-flags/${featureKey}/evaluate`,
        { params: { environment } },
      )
      .then((r) => r.data),
};

// -------------------------------------------------
// Rollouts & User Targeting
// -------------------------------------------------
export const rolloutApi = {
  configure: (
    featureFlagId: number,
    environmentId: number,
    data: FeatureRolloutCreate,
  ) =>
    apiClient
      .put<FeatureRolloutResponse>(
        `/feature-flags/${featureFlagId}/environments/${environmentId}/rollout`,
        data,
      )
      .then((r) => r.data),
};

export const userAssignmentApi = {
  configure: (
    featureFlagId: number,
    environmentId: number,
    data: UserAssignmentCreate,
  ) =>
    apiClient
      .put<UserAssignmentResponse>(
        `/feature-flags/${featureFlagId}/environments/${environmentId}/users`,
        data,
      )
      .then((r) => r.data),

  remove: (assignmentId: number) =>
    apiClient
      .delete(`/feature-flags/user-assignments/${assignmentId}`)
      .then((r) => r.data),
};

// -------------------------------------------------
// Feature Scheduling
// -------------------------------------------------
export const scheduleApi = {
  update: (
    featureFlagId: number,
    environmentId: number,
    data: FeatureScheduleRequest,
  ) =>
    apiClient
      .put<FeatureScheduleResponse>(
        `/feature-flags/${featureFlagId}/environments/${environmentId}/schedule`,
        data,
      )
      .then((r) => r.data),
};

// -------------------------------------------------
// Audit Logs
// -------------------------------------------------
export const auditLogApi = {
  listAll: () =>
    apiClient.get<AuditLogResponse[]>("/audit-logs").then((r) => r.data),

  entityHistory: (entityType: string, entityId: number) =>
    apiClient
      .get<AuditLogResponse[]>(`/audit-logs/entity/${entityType}/${entityId}`)
      .then((r) => r.data),

  userHistory: (userId: number) =>
    apiClient
      .get<AuditLogResponse[]>(`/audit-logs/user/${userId}`)
      .then((r) => r.data),

  rollback: (auditLogId: number) =>
    apiClient
      .post<AuditLogResponse>(`/audit-logs/${auditLogId}/rollback`)
      .then((r) => r.data),
};

// -------------------------------------------------
// Analytics
// -------------------------------------------------
export const analyticsApi = {
  featureUsage: (featureKey: string, environment: string) =>
    apiClient
      .get<FeatureUsageAnalyticsResponse>("/analytics/feature-usage", {
        params: { feature_key: featureKey, environment },
      })
      .then((r) => r.data),
};

// -------------------------------------------------
// Dashboard
// -------------------------------------------------
export const dashboardApi = {
  summary: () =>
    apiClient
      .get<DashboardSummaryResponse>("/dashboard/summary")
      .then((r) => r.data),

  features: () =>
    apiClient
      .get<DashboardFeatureResponse[]>("/dashboard/features")
      .then((r) => r.data),

  rollouts: () =>
    apiClient
      .get<DashboardRolloutResponse[]>("/dashboard/rollouts")
      .then((r) => r.data),

  environments: () =>
    apiClient
      .get<DashboardEnvironmentResponse[]>("/dashboard/environments")
      .then((r) => r.data),
};
