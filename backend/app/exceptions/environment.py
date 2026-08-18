from app.exceptions.base import AppException


class EnvironmentNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="Environment not found",
            status_code=404,
        )


class EnvironmentAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(
            message="Environment already exists",
            status_code=409,
        )