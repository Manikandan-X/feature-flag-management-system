from app.exceptions.base import AppException


class FeatureRolloutNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="Feature rollout not found",
            status_code=404,
        )


class FeatureRolloutAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(
            message="Feature rollout already exists",
            status_code=409,
        )