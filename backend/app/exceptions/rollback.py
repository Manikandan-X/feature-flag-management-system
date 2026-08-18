from app.exceptions.base import AppException


class AuditLogNotFoundException(AppException):

    def __init__(self):
        super().__init__(
            message="Audit log not found",
            status_code=404,
        )


class RollbackNotSupportedException(AppException):

    def __init__(self):
        super().__init__(
            message="Rollback is not supported for this audit action",
            status_code=400,
        )


class RollbackDataUnavailableException(AppException):

    def __init__(self):
        super().__init__(
            message="Previous state is not available for rollback",
            status_code=400,
        )


class RollbackEntityNotFoundException(AppException):

    def __init__(self):
        super().__init__(
            message="Entity required for rollback was not found",
            status_code=404,
        )