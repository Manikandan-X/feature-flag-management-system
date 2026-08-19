from app.exceptions.base import AppException


class UserNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="User not found",
            status_code=404,
        )


class CannotModifyOwnAccountException(AppException):
    def __init__(self):
        super().__init__(
            message="You cannot deactivate your own account or change your own role",
            status_code=400,
        )
