from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./fintrack.db"
    JWT_SECRET: str = "dev_secret_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALERT_THRESHOLD: float = 1000.0

    class Config:
        env_file = ".env"


settings = Settings()
