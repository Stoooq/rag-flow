from enum import Enum
from typing import Union, Literal
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

class PostgresSettings(BaseModel):
    database: Literal[DatabaseType.postgres]
    metric: PostgresMetric
    llmProvider: LLMProvider

class MySQLSettings(BaseModel):
    database: Literal[DatabaseType.mysql]
    metric: MySQLMetric
    llmProvider: LLMProvider

Settings = Union[PostgresSettings, MySQLSettings]

def parse_settings(payload: dict) -> Settings:
    db = payload.get("database")
    if db == DatabaseType.postgres:
        return PostgresSettings(**payload)
    elif db == DatabaseType.mysql:
        return MySQLSettings(**payload)
    else:
        raise ValueError("Invalid database type")