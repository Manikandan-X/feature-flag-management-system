import type { AuditAction, AuditEntityType } from "../types";
import { tokens } from "../theme";

export const actionColor: Record<AuditAction, string> = {
  CREATE: tokens.signal,
  UPDATE: tokens.envDevelopment,
  DELETE: tokens.envProduction,
  ENABLE: tokens.signal,
  DISABLE: tokens.envProduction,
  SCHEDULE: tokens.envTesting,
  ROLLOUT_UPDATE: tokens.envTesting,
  USER_ASSIGNMENT: tokens.envDevelopment,
  USER_ASSIGNMENT_DELETE: tokens.envProduction,
  ROLLBACK: tokens.signal,
};

export const actionLabel: Record<AuditAction, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  ENABLE: "Enabled",
  DISABLE: "Disabled",
  SCHEDULE: "Scheduled",
  ROLLOUT_UPDATE: "Rollout changed",
  USER_ASSIGNMENT: "User assigned",
  USER_ASSIGNMENT_DELETE: "Assignment removed",
  ROLLBACK: "Rolled back",
};

export const entityLabel: Record<AuditEntityType, string> = {
  FEATURE_FLAG: "Feature flag",
  ENVIRONMENT: "Environment",
  FEATURE_ROLLOUT: "Rollout",
  USER_ASSIGNMENT: "User assignment",
};

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDiffValue(value: Record<string, unknown> | null): string {
  if (!value) return "—";
  return Object.entries(value)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ");
}
