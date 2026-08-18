import hashlib
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.exceptions.feature_evaluation import (
    FeatureEvaluationEnvironmentInactiveException,
    FeatureEvaluationEnvironmentNotFoundException,
    FeatureEvaluationFeatureNotFoundException,
)
from app.models.user import User
from app.repositories.feature_evaluation_repository import (
    FeatureEvaluationRepository,
)
from app.schemas.feature_evaluation import (
    FeatureEvaluationResponse,
)
from app.utils.redis import redis_client


class FeatureEvaluationService:

    def __init__(self, db: Session):

        self.repository = FeatureEvaluationRepository(
            db
        )

    @staticmethod
    def _is_schedule_active(
        scheduled_start_at,
        scheduled_end_at,
    ) -> bool:

        now = datetime.now(timezone.utc)

        if scheduled_start_at is not None:

            if scheduled_start_at.tzinfo is None:
                scheduled_start_at = (
                    scheduled_start_at.replace(
                        tzinfo=timezone.utc
                    )
                )

            if now < scheduled_start_at:
                return False

        if scheduled_end_at is not None:

            if scheduled_end_at.tzinfo is None:
                scheduled_end_at = (
                    scheduled_end_at.replace(
                        tzinfo=timezone.utc
                    )
                )

            if now >= scheduled_end_at:
                return False

        return True

    @staticmethod
    def _track_usage(
        feature_key: str,
        environment_name: str,
        enabled: bool,
    ) -> None:

        base_key = (
            f"analytics:feature:{feature_key}"
            f":environment:{environment_name}"
        )

        total_key = f"{base_key}:total"
        enabled_key = f"{base_key}:enabled"
        disabled_key = f"{base_key}:disabled"

        try:

            # Total evaluations
            redis_client.incr(total_key)

            # Enabled / disabled evaluations
            if enabled:
                redis_client.incr(enabled_key)
            else:
                redis_client.incr(disabled_key)

        except Exception:
            # Analytics must not break feature evaluation.
            pass

    def _build_response(
        self,
        feature_key: str,
        environment_name: str,
        user_id: int,
        enabled: bool,
    ) -> FeatureEvaluationResponse:

        self._track_usage(
            feature_key=feature_key,
            environment_name=environment_name,
            enabled=enabled,
        )

        return FeatureEvaluationResponse(
            feature_key=feature_key,
            environment=environment_name,
            user_id=user_id,
            enabled=enabled,
        )

    def evaluate(
        self,
        feature_key: str,
        environment_name: str,
        user: User,
    ) -> FeatureEvaluationResponse:

        # -------------------------------------------------
        # 1. Get feature flag
        # -------------------------------------------------

        feature_flag = (
            self.repository.get_feature_by_key(
                feature_key
            )
        )

        if not feature_flag:
            raise FeatureEvaluationFeatureNotFoundException()

        # -------------------------------------------------
        # 2. Get environment
        # -------------------------------------------------

        environment = (
            self.repository.get_environment_by_name(
                environment_name
            )
        )

        if not environment:
            raise FeatureEvaluationEnvironmentNotFoundException()

        # -------------------------------------------------
        # 3. Check environment status
        # -------------------------------------------------

        if not environment.is_active:
            raise FeatureEvaluationEnvironmentInactiveException()

        # -------------------------------------------------
        # 4. Get environment configuration
        # -------------------------------------------------

        configuration = (
            self.repository.get_environment_configuration(
                feature_flag.id,
                environment.id,
            )
        )

        # -------------------------------------------------
        # 5. Check schedule
        # -------------------------------------------------

        if configuration is not None:

            schedule_active = (
                self._is_schedule_active(
                    configuration.scheduled_start_at,
                    configuration.scheduled_end_at,
                )
            )

            if not schedule_active:

                return self._build_response(
                    feature_key=feature_flag.key,
                    environment_name=environment.name,
                    user_id=user.id,
                    enabled=False,
                )

        # -------------------------------------------------
        # 6. User-specific assignment
        # -------------------------------------------------

        assignment = (
            self.repository.get_user_assignment(
                user.id,
                feature_flag.id,
                environment.id,
            )
        )

        if assignment is not None:

            return self._build_response(
                feature_key=feature_flag.key,
                environment_name=environment.name,
                user_id=user.id,
                enabled=assignment.enabled,
            )

        # -------------------------------------------------
        # 7. Percentage rollout
        # -------------------------------------------------

        rollout = (
            self.repository.get_rollout(
                feature_flag.id,
                environment.id,
            )
        )

        if rollout is not None:

            enabled = self._evaluate_rollout(
                user.id,
                feature_flag.id,
                rollout.percentage,
            )

            return self._build_response(
                feature_key=feature_flag.key,
                environment_name=environment.name,
                user_id=user.id,
                enabled=enabled,
            )

        # -------------------------------------------------
        # 8. Environment configuration
        # -------------------------------------------------

        if configuration is not None:

            return self._build_response(
                feature_key=feature_flag.key,
                environment_name=environment.name,
                user_id=user.id,
                enabled=configuration.enabled,
            )

        # -------------------------------------------------
        # 9. Default
        # -------------------------------------------------

        return self._build_response(
            feature_key=feature_flag.key,
            environment_name=environment.name,
            user_id=user.id,
            enabled=False,
        )

    @staticmethod
    def _evaluate_rollout(
        user_id: int,
        feature_flag_id: int,
        percentage: int,
    ) -> bool:

        # 0% rollout
        if percentage <= 0:
            return False

        # 100% rollout
        if percentage >= 100:
            return True

        # Create deterministic value
        value = (
            f"{user_id}:{feature_flag_id}"
        ).encode("utf-8")

        # Generate SHA-256 hash
        hash_value = hashlib.sha256(
            value
        ).hexdigest()

        # Convert hash into a bucket from 0-99
        bucket = (
            int(hash_value[:8], 16)
            % 100
        )

        # Check whether user falls inside rollout
        return bucket < percentage