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
  llmProvider: LLMProvider;
  textEncoder: string;
}

interface PostgresSettings extends SettingsBase {
  database: DatabaseType.Postgres;
  metric: PostgresMetric;
}

interface MySQLSettings extends SettingsBase {
  database: DatabaseType.MySQL;
  metric: MySQLMetric;
}

export type SettingsType = PostgresSettings | MySQLSettings