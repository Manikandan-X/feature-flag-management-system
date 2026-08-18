from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import (
    require_admin,
    require_employee,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentResponse,
    EnvironmentUpdate,
)
from app.services.environment_service import (
    EnvironmentService,
)


router = APIRouter(
    prefix="/environments",
    tags=["Environments"],
)


# -------------------------------------------------
# Create Environment
# -------------------------------------------------

@router.post(
    "",
    response_model=EnvironmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_environment(
    data: EnvironmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    service = EnvironmentService(db)

    return service.create(
        data,
        current_user.id,
    )


# -------------------------------------------------
# Get Active Environments
# -------------------------------------------------

@router.get(
    "",
    response_model=list[EnvironmentResponse],
)
def get_active_environments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):

    service = EnvironmentService(db)

    return service.get_active()


# -------------------------------------------------
# Get All Environments
# -------------------------------------------------

@router.get(
    "/all",
    response_model=list[EnvironmentResponse],
)
def get_all_environments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    service = EnvironmentService(db)

    return service.get_all()


# -------------------------------------------------
# Get Environment
# -------------------------------------------------

@router.get(
    "/{environment_id}",
    response_model=EnvironmentResponse,
)
def get_environment(
    environment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):

    service = EnvironmentService(db)

    return service.get(environment_id)


# -------------------------------------------------
# Update Environment
# -------------------------------------------------

@router.put(
    "/{environment_id}",
    response_model=EnvironmentResponse,
)
def update_environment(
    environment_id: int,
    data: EnvironmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    service = EnvironmentService(db)

    return service.update(
        environment_id,
        data,
        current_user.id,
    )