from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.feature_flag_environment import (
    FeatureFlagEnvironment,
)


class FeatureScheduleRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_feature_and_environment(
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

    def save(
        self,
        configuration: FeatureFlagEnvironment,
    ) -> FeatureFlagEnvironment:

        self.db.flush()
        self.db.refresh(configuration)

        return configuration