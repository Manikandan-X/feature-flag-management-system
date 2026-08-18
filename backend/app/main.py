from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.exceptions.base import AppException
from app.utils.redis import check_redis_connection


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Exception Handler
# ---------------------------------------------------------

@app.exception_handler(AppException)
async def app_exception_handler(
    request: Request,
    exc: AppException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
        },
    )


# ---------------------------------------------------------
# API Routes
# ---------------------------------------------------------

app.include_router(
    api_router,
    prefix="/api/v1",
)


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "application": settings.app_name,
        "environment": settings.app_env,
        "redis": check_redis_connection(),
    }