// ==========================================================================
// Types mirroring backend Pydantic schemas exactly (app/schemas/*.py)
// ==========================================================================

export type UserRole = "ADMIN" | "EMPLOYEE";

export type EnvironmentName = "development" | "testing" | "production";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ENABLE"
  | "DISABLE"
  | "SCHEDULE"
  | "ROLLOUT_UPDATE"
  | "USER_ASSIGNMENT"
  | "USER_ASSIGNMENT_DELETE"
  | "ROLLBACK";

export type AuditEntityType =
  | "FEATURE_FLAG"
  | "ENVIRONMENT"
  | "FEATURE_ROLLOUT"
  | "USER_ASSIGNMENT";

// ---- auth.py ----
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  role: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ---- environment.py ----
export interface EnvironmentCreate {
  name: string;
  description?: string | null;
}

export interface EnvironmentUpdate {
  name?: string | null;
  description?: string | null;
  is_active?: boolean | null;
}

export interface EnvironmentResponse {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

// ---- feature_flag.py ----
export interface FeatureFlagCreate {
  name: string;
  key: string;
  description?: string | null;
}

export interface FeatureFlagUpdate {
  name?: string | null;
  description?: string | null;
}

export interface FeatureFlagResponse {
  id: number;
  name: string;
  key: string;
  description: string | null;
  created_by: number;
}

// ---- feature_flag_environment.py ----
export interface FeatureFlagEnvironmentUpdate {
  enabled: boolean;
}

export interface FeatureFlagEnvironmentResponse {
  id: number;
  feature_flag_id: number;
  environment_id: number;
  enabled: boolean;
}

// ---- feature_rollout.py ----
export interface FeatureRolloutCreate {
  percentage: number;
}

export interface FeatureRolloutResponse {
  id: number;
  feature_flag_id: number;
  environment_id: number;
  percentage: number;
}

// ---- feature_schedule.py ----
export interface FeatureScheduleRequest {
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
}

export interface FeatureScheduleResponse {
  feature_flag_id: number;
  environment_id: number;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
}

// ---- feature_evaluation.py ----
export interface FeatureEvaluationResponse {
  feature_key: string;
  environment: string;
  user_id: number;
  enabled: boolean;
}

// ---- user_assignment.py ----
export interface UserAssignmentCreate {
  user_id: number;
  enabled: boolean;
}

export interface UserAssignmentResponse {
  id: number;
  user_id: number;
  feature_flag_id: number;
  environment_id: number;
  enabled: boolean;
}

// ---- audit_log.py ----
export interface AuditLogResponse {
  id: number;
  user_id: number | null;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: number;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

// ---- analytics.py ----
export interface FeatureUsageAnalyticsResponse {
  feature_key: string;
  environment: string;
  total_evaluations: number;
  enabled_count: number;
  disabled_count: number;
}

// ---- dashboard.py ----
export interface DashboardSummaryResponse {
  total_features: number;
  active_features: number;
  disabled_features: number;
  total_environments: number;
  active_environments: number;
  total_rollouts: number;
}

export interface DashboardFeatureResponse {
  feature_flag_id: number;
  feature_key: string;
  feature_name: string;
  environment_id: number;
  environment: string;
  enabled: boolean;
}

export interface DashboardRolloutResponse {
  feature_flag_id: number;
  feature_key: string;
  environment_id: number;
  environment: string;
  percentage: number;
}

export interface DashboardEnvironmentResponse {
  environment_id: number;
  environment: string;
  is_active: boolean;
  total_features: number;
  active_features: number;
  disabled_features: number;
  total_rollouts: number;
}

// ---- API error envelope (app/exceptions/base.py AppException handler) ----
export interface ApiErrorBody {
  success: false;
  message: string;
}
