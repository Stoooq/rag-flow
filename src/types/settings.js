export var DatabaseType;
(function (DatabaseType) {
    DatabaseType["Postgres"] = "postgres";
    DatabaseType["MySQL"] = "mysql";
})(DatabaseType || (DatabaseType = {}));
export var PostgresMetric;
(function (PostgresMetric) {
    PostgresMetric["Cosine"] = "cosine";
    PostgresMetric["L2"] = "l2";
})(PostgresMetric || (PostgresMetric = {}));
export var MySQLMetric;
(function (MySQLMetric) {
    MySQLMetric["Cosine"] = "cosine";
    MySQLMetric["L2"] = "l2";
})(MySQLMetric || (MySQLMetric = {}));
export var LLMProvider;
(function (LLMProvider) {
    LLMProvider["Ollama"] = "ollama";
    LLMProvider["OpenAI"] = "openai";
})(LLMProvider || (LLMProvider = {}));
