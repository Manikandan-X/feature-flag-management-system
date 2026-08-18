from app.exceptions.base import AppException


class FeatureEvaluationFeatureNotFoundException(
    AppException
):
    def __init__(self):
        super().__init__(
            message="Feature flag not found",
            status_code=404,
        )


class FeatureEvaluationEnvironmentNotFoundException(
    AppException
):
    def __init__(self):
        super().__init__(
            message="Environment not found",
            status_code=404,
        )


class FeatureEvaluationEnvironmentInactiveException(
    AppException
):
    def __init__(self):
        super().__init__(
            message="Environment is inactive",
            status_code=403,
        )