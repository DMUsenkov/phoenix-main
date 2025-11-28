from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


    APP_NAME: str = "Phoenix API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"


    HOST: str = "0.0.0.0"
    PORT: int = 8000


    DATABASE_URL: str = "postgresql+asyncpg://phoenix:phoenix_secret@localhost:5433/phoenix"


    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]


    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: Literal["json", "text"] = "text"


    JWT_SECRET_KEY: str = "super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TTL_MIN: int = 30
    JWT_REFRESH_TTL_DAYS: int = 7


    PASSWORD_HASH_SCHEME: str = "bcrypt"


    PUBLIC_BASE_URL: str = "http://localhost:3001"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
