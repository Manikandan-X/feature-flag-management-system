from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Feature Flag & Environment Management System"
    app_env: str = "development"
    debug: bool = True

    database_url: str

    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"

    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    
    admin_username: str
    admin_email: str
    admin_password: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()