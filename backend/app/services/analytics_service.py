from app.schemas.analytics import (
    FeatureUsageAnalyticsResponse,
)
from app.utils.redis import redis_client


class AnalyticsService:

    @staticmethod
    def get_feature_usage(
        feature_key: str,
        environment: str,
    ) -> FeatureUsageAnalyticsResponse:

        base_key = (
            f"analytics:feature:{feature_key}"
            f":environment:{environment}"
        )

        total_key = f"{base_key}:total"
        enabled_key = f"{base_key}:enabled"
        disabled_key = f"{base_key}:disabled"

        total = redis_client.get(total_key)
        enabled = redis_client.get(enabled_key)
        disabled = redis_client.get(disabled_key)

        return FeatureUsageAnalyticsResponse(
            feature_key=feature_key,
            environment=environment,
            total_evaluations=int(total or 0),
            enabled_count=int(enabled or 0),
            disabled_count=int(disabled or 0),
        )