from app.exceptions.base import AppException


class FeatureScheduleNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="Feature environment configuration not found",
            status_code=404,
        )


class InvalidFeatureScheduleException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid feature schedule",
            status_code=400,
        )