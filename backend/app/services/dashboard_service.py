from app.repositories.dashboard_repository import (
    DashboardRepository,
)
from app.schemas.dashboard import (
    DashboardEnvironmentResponse,
    DashboardFeatureResponse,
    DashboardRolloutResponse,
    DashboardSummaryResponse,
)


class DashboardService:

    def __init__(self, db):

        self.repository = DashboardRepository(db)

    # -------------------------------------------------
    # Dashboard Summary
    # -------------------------------------------------

    def get_summary(
        self,
    ) -> DashboardSummaryResponse:

        return DashboardSummaryResponse(
            total_features=(
                self.repository.get_total_features()
            ),
            active_features=(
                self.repository.get_active_features()
            ),
            disabled_features=(
                self.repository.get_disabled_features()
            ),
            total_environments=(
                self.repository.get_total_environments()
            ),
            active_environments=(
                self.repository.get_active_environments()
            ),
            total_rollouts=(
                self.repository.get_total_rollouts()
            ),
        )

    # -------------------------------------------------
    # Feature Status
    # -------------------------------------------------

    def get_features(
        self,
    ) -> list[DashboardFeatureResponse]:

        rows = (
            self.repository.get_feature_status()
        )

        return [
            DashboardFeatureResponse(
                feature_flag_id=row[0],
                feature_key=row[1],
                feature_name=row[2],
                environment_id=row[3],
                environment=row[4],
                enabled=row[5],
            )
            for row in rows
        ]

    # -------------------------------------------------
    # Rollout Statistics
    # -------------------------------------------------

    def get_rollouts(
        self,
    ) -> list[DashboardRolloutResponse]:

        rows = (
            self.repository.get_rollout_statistics()
        )

        return [
            DashboardRolloutResponse(
                feature_flag_id=row[0],
                feature_key=row[1],
                environment_id=row[2],
                environment=row[3],
                percentage=row[4],
            )
            for row in rows
        ]

    # -------------------------------------------------
    # Environment Summary
    # -------------------------------------------------

    def get_environments(
        self,
    ) -> list[DashboardEnvironmentResponse]:

        rows = (
            self.repository.get_environment_summary()
        )

        return [
            DashboardEnvironmentResponse(
                environment_id=row[0],
                environment=row[1],
                is_active=row[2],
                total_features=row[3],
                active_features=row[4],
                disabled_features=row[5],
                total_rollouts=row[6],
            )
            for row in rows
        ]