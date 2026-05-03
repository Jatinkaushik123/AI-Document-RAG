from __future__ import annotations

import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    embedding_model: str = "all-MiniLM-L6-v2"
    openai_api_key: str = ""
    openai_model: str = "gpt-5.4-mini"
    allowed_origins: str = "http://localhost:5173"
    data_dir: str = ".data"
    chunk_size: int = 300
    chunk_overlap: int = 50
    top_k: int = 2

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
