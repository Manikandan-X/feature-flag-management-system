from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.feature_flag import FeatureFlag
from app.models.feature_flag_environment import (
    FeatureFlagEnvironment,
)


class FeatureFlagRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag | None:

        return self.db.scalar(
            select(FeatureFlag).where(
                FeatureFlag.id == feature_flag_id
            )
        )

    def get_by_key(
        self,
        key: str,
    ) -> FeatureFlag | None:

        return self.db.scalar(
            select(FeatureFlag).where(
                FeatureFlag.key == key
            )
        )

    def get_all(self) -> list[FeatureFlag]:

        return list(
            self.db.scalars(
                select(FeatureFlag).order_by(
                    FeatureFlag.id
                )
            ).all()
        )

    def create(
        self,
        feature_flag: FeatureFlag,
    ) -> FeatureFlag:

        self.db.add(feature_flag)
        self.db.flush()
        self.db.refresh(feature_flag)

        return feature_flag

    def save(
        self,
        feature_flag: FeatureFlag,
    ) -> FeatureFlag:

        self.db.flush()
        self.db.refresh(feature_flag)

        return feature_flag

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

    def create_environment_configuration(
        self,
        configuration: FeatureFlagEnvironment,
    ) -> FeatureFlagEnvironment:

        self.db.add(configuration)
        self.db.flush()
        self.db.refresh(configuration)

        return configuration