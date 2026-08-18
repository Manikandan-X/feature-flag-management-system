from pydantic import BaseModel


class UserAssignmentCreate(BaseModel):
    user_id: int
    enabled: bool


class UserAssignmentResponse(BaseModel):
    id: int
    user_id: int
    feature_flag_id: int
    environment_id: int
    enabled: bool

    model_config = {
        "from_attributes": True,
    }