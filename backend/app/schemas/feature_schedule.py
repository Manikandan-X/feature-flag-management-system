from datetime import datetime

from pydantic import BaseModel, model_validator


class FeatureScheduleRequest(BaseModel):
    scheduled_start_at: datetime | None = None
    scheduled_end_at: datetime | None = None

    @model_validator(mode="after")
    def validate_schedule(self):
        if (
            self.scheduled_start_at is not None
            and self.scheduled_end_at is not None
            and self.scheduled_end_at
            <= self.scheduled_start_at
        ):
            raise ValueError(
                "scheduled_end_at must be after scheduled_start_at"
            )

        return self


class FeatureScheduleResponse(BaseModel):
    feature_flag_id: int
    environment_id: int
    scheduled_start_at: datetime | None
    scheduled_end_at: datetime | None

    model_config = {
        "from_attributes": True,
    }