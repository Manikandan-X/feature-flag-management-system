from app.exceptions.base import AppException


class UserAssignmentNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="User assignment not found",
            status_code=404,
        )


class UserAssignmentAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(
            message="User assignment already exists",
            status_code=409,
        )


class UserNotFoundForAssignmentException(AppException):
    def __init__(self):
        super().__init__(
            message="User not found",
            status_code=404,
        )