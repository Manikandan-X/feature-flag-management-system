from app.exceptions.base import AppException


class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid username or password",
            status_code=401,
        )


class InvalidTokenException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid or expired token",
            status_code=401,
        )


class InactiveUserException(AppException):
    def __init__(self):
        super().__init__(
            message="User account is inactive",
            status_code=403,
        )


class ForbiddenException(AppException):
    def __init__(self):
        super().__init__(
            message="You do not have permission to perform this action",
            status_code=403,
        )


class UserAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(
            message="Username or email already exists",
            status_code=409,
        )
        
