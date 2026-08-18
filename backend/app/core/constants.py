from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"


class AuditAction(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    ENABLE = "ENABLE"
    DISABLE = "DISABLE"
    SCHEDULE = "SCHEDULE"
    ROLLOUT_UPDATE = "ROLLOUT_UPDATE"
    USER_ASSIGNMENT = "USER_ASSIGNMENT"
    USER_ASSIGNMENT_DELETE = "USER_ASSIGNMENT_DELETE"
    ROLLBACK = "ROLLBACK"


class AuditEntityType(str, Enum):
    FEATURE_FLAG = "FEATURE_FLAG"
    ENVIRONMENT = "ENVIRONMENT"
    FEATURE_ROLLOUT = "FEATURE_ROLLOUT"
    USER_ASSIGNMENT = "USER_ASSIGNMENT"


class EnvironmentName(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"