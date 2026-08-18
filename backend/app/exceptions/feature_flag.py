from app.exceptions.base import AppException


class FeatureFlagNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="Feature flag not found",
            status_code=404,
        )


class FeatureFlagAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(
            message="Feature flag key already exists",
            status_code=409,
        )


class EnvironmentNotFoundForFeatureFlagException(AppException):
    def __init__(self):
        super().__init__(
            message="Environment not found",
            status_code=404,
        )