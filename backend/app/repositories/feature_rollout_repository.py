from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.feature_rollout import FeatureRollout


class FeatureRolloutRepository:

    def __init__(self, db: Session):
        self.db = db
        
    def get_by_id(
        self,
        rollout_id: int,
    ) -> FeatureRollout | None:

        return self.db.scalar(
            select(FeatureRollout).where(
                FeatureRollout.id == rollout_id
            )
        )

    def get_by_feature_and_environment(
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

    def create(
        self,
        rollout: FeatureRollout,
    ) -> FeatureRollout:

        self.db.add(rollout)
        self.db.flush()
        self.db.refresh(rollout)

        return rollout

    def save(
        self,
        rollout: FeatureRollout,
    ) -> FeatureRollout:

        self.db.flush()
        self.db.refresh(rollout)

        return rollout