export enum DatabaseType {
  Postgres = 'postgres',
  MySQL = 'mysql'
}

export enum PostgresMetric {
  Cosine = 'cosine',
  L2 = 'l2'
}

export enum MySQLMetric {
  Cosine = 'cosine',
  L2 = 'l2'
}

export enum LLMProvider {
  Ollama = 'ollama',
  OpenAI = 'openai'
}

interface SettingsBase {
  llmProvider: LLMProviderEnum
}

interface PostgresSettings extends SettingsBase {
  database: DatabaseEnum.Postgres
  metric: PostgresMetric
}

interface MySQLSettings extends SettingsBase {
  database: DatabaseEnum.MySQL
  metric: MySQLMetric
}

export type SettingsType = PostgresSettings | MySQLSettings