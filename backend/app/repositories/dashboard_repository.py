from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_flag_environment import (
    FeatureFlagEnvironment,
)
from app.models.feature_rollout import FeatureRollout


class DashboardRepository:

    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------
    # Summary
    # -------------------------------------------------

    def get_total_features(self) -> int:

        return (
            self.db.scalar(
                select(
                    func.count(FeatureFlag.id)
                )
            )
            or 0
        )

    def get_active_features(self) -> int:

        return (
            self.db.scalar(
                select(
                    func.count(
                        FeatureFlagEnvironment.id
                    )
                ).where(
                    FeatureFlagEnvironment.enabled.is_(True)
                )
            )
            or 0
        )

    def get_disabled_features(self) -> int:

        return (
            self.db.scalar(
                select(
                    func.count(
                        FeatureFlagEnvironment.id
                    )
                ).where(
                    FeatureFlagEnvironment.enabled.is_(False)
                )
            )
            or 0
        )

    def get_total_environments(self) -> int:

        return (
            self.db.scalar(
                select(
                    func.count(Environment.id)
                )
            )
            or 0
        )

    def get_active_environments(self) -> int:

        return (
            self.db.scalar(
                select(
                    func.count(Environment.id)
                ).where(
                    Environment.is_active.is_(True)
                )
            )
            or 0
        )

    def get_total_rollouts(self) -> int:

        return (
            self.db.scalar(
                select(
                    func.count(FeatureRollout.id)
                )
            )
            or 0
        )

    # -------------------------------------------------
    # Feature Status
    # -------------------------------------------------

    def get_feature_status(self):

        return list(
            self.db.execute(
                select(
                    FeatureFlag.id,
                    FeatureFlag.key,
                    FeatureFlag.name,
                    Environment.id,
                    Environment.name,
                    FeatureFlagEnvironment.enabled,
                )
                .join(
                    FeatureFlagEnvironment,
                    FeatureFlag.id
                    == FeatureFlagEnvironment.feature_flag_id,
                )
                .join(
                    Environment,
                    Environment.id
                    == FeatureFlagEnvironment.environment_id,
                )
                .order_by(
                    FeatureFlag.id,
                    Environment.id,
                )
            ).all()
        )

    # -------------------------------------------------
    # Rollout Statistics
    # -------------------------------------------------

    def get_rollout_statistics(self):

        return list(
            self.db.execute(
                select(
                    FeatureFlag.id,
                    FeatureFlag.key,
                    Environment.id,
                    Environment.name,
                    FeatureRollout.percentage,
                )
                .join(
                    FeatureRollout,
                    FeatureFlag.id
                    == FeatureRollout.feature_flag_id,
                )
                .join(
                    Environment,
                    Environment.id
                    == FeatureRollout.environment_id,
                )
                .order_by(
                    FeatureFlag.id,
                    Environment.id,
                )
            ).all()
        )

    # -------------------------------------------------
    # Environment Summary
    # -------------------------------------------------

    def get_environment_summary(self):

        environments = list(
            self.db.scalars(
                select(Environment)
                .order_by(Environment.id)
            ).all()
        )

        result = []

        for environment in environments:

            total_features = (
                self.db.scalar(
                    select(
                        func.count(
                            FeatureFlagEnvironment.id
                        )
                    ).where(
                        FeatureFlagEnvironment.environment_id
                        == environment.id
                    )
                )
                or 0
            )

            active_features = (
                self.db.scalar(
                    select(
                        func.count(
                            FeatureFlagEnvironment.id
                        )
                    ).where(
                        FeatureFlagEnvironment.environment_id
                        == environment.id,
                        FeatureFlagEnvironment.enabled.is_(True),
                    )
                )
                or 0
            )

            disabled_features = (
                self.db.scalar(
                    select(
                        func.count(
                            FeatureFlagEnvironment.id
                        )
                    ).where(
                        FeatureFlagEnvironment.environment_id
                        == environment.id,
                        FeatureFlagEnvironment.enabled.is_(False),
                    )
                )
                or 0
            )

            total_rollouts = (
                self.db.scalar(
                    select(
                        func.count(
                            FeatureRollout.id
                        )
                    ).where(
                        FeatureRollout.environment_id
                        == environment.id
                    )
                )
                or 0
            )

            result.append(
                (
                    environment.id,
                    environment.name,
                    environment.is_active,
                    total_features,
                    active_features,
                    disabled_features,
                    total_rollouts,
                )
            )

        return result