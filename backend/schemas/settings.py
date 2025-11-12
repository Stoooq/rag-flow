from enum import Enum
from typing import Union, Literal, Optional
from pydantic import BaseModel

class DatabaseType(str, Enum):
    postgres = "postgres"
    mysql = "mysql"

class PostgresMetric(str, Enum):
    cosine = "cosine"
    l2 = "l2"

class MySQLMetric(str, Enum):
    cosine = "cosine"
    l2 = "l2"

class LLMProvider(str, Enum):
    Ollama = "ollama"
    OpenAI = "openai"
    Domdata = "domdata"

class PostgresSettings(BaseModel):
    database: Literal[DatabaseType.postgres]
    metric: PostgresMetric
    llmProvider: LLMProvider
    textEncoder: str = "all-MiniLM-L6-v2"
    openAiApiKey: Optional[str] = None

class MySQLSettings(BaseModel):
    database: Literal[DatabaseType.mysql]
    metric: MySQLMetric
    llmProvider: LLMProvider
    textEncoder: str = "all-MiniLM-L6-v2"
    openAiApiKey: Optional[str] = None

Settings = Union[PostgresSettings, MySQLSettings]

def parse_settings(payload: dict) -> Settings:
    db = payload.get("database")
    if db == DatabaseType.postgres:
        return PostgresSettings(**payload)
    elif db == DatabaseType.mysql:
        return MySQLSettings(**payload)
    else:
        raise ValueError("Invalid database type")