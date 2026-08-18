from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_flag_environment import (
    FeatureFlagEnvironment,
)
from app.models.feature_rollout import FeatureRollout
from app.models.user_assignment import UserAssignment


class FeatureEvaluationRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_feature_by_key(
        self,
        key: str,
    ) -> FeatureFlag | None:

        return self.db.scalar(
            select(FeatureFlag).where(
                FeatureFlag.key == key
            )
        )

    def get_environment_by_name(
        self,
        name: str,
    ) -> Environment | None:

        return self.db.scalar(
            select(Environment).where(
                Environment.name == name
            )
        )

    def get_user_assignment(
        self,
        user_id: int,
        feature_flag_id: int,
        environment_id: int,
    ) -> UserAssignment | None:

        return self.db.scalar(
            select(UserAssignment).where(
                UserAssignment.user_id == user_id,
                UserAssignment.feature_flag_id
                == feature_flag_id,
                UserAssignment.environment_id
                == environment_id,
            )
        )

    def get_rollout(
        self,
        feature_flag_id: int,
        environment_id: int,
    ) -> FeatureRollout | None:

        return self.db.scalar(
            select(FeatureRollout).where(
                FeatureRollout.feature_flag_id
                == feature_flag_id,
                FeatureRollout.environment_id
                == environment_id,
            )
        )

    def get_environment_configuration(
        self,
        feature_flag_id: int,
        environment_id: int,
    ) -> FeatureFlagEnvironment | None:

        return self.db.scalar(
            select(FeatureFlagEnvironment).where(
                FeatureFlagEnvironment.feature_flag_id
                == feature_flag_id,
                FeatureFlagEnvironment.environment_id
                == environment_id,
            )
        )