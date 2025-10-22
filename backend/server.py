from flask import Flask, request, jsonify, g
from flask_cors import CORS

from database import Database
from utils.helpers import clean_documents, clean_text
from services.text_service import text_encoder
from services.llm_service import expand_query, call_llm
from services.search_service import rerank_documents
import os
from dotenv import load_dotenv
from crawlers import Crawler

from schemas.settings import (
    parse_settings,
    Settings,
    PostgresSettings,
    DatabaseType,
    PostgresMetric,
    LLMProvider
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": "*"}})

load_dotenv()

DEFAULT_SETTINGS = PostgresSettings(
    database=DatabaseType.postgres,
    metric=PostgresMetric.cosine,
    llmProvider=LLMProvider.Ollama
)

pg_db = Database(
    db_type="postgres", 
    host=os.getenv("POSTGRES_HOST", "localhost"), 
    port=int(os.getenv("POSTGRES_PORT", "5432")), 
    user=os.getenv("POSTGRES_USER", "postgres"), 
    password=os.getenv("POSTGRES_PASSWORD"), 
    db_name=os.getenv("POSTGRES_DB", "test")
)
# mysql_db = Database(
#     db_type="mysql", 
#     host=os.getenv("MYSQL_HOST", "localhost"), 
#     port=int(os.getenv("MYSQL_PORT", "3306")), 
#     user=os.getenv("MYSQL_USER", "mysql"), 
#     password=os.getenv("MYSQL_PASSWORD"), 
#     db_name=os.getenv("MYSQL_DB", "test")
# )

class SettingsStore:
    def __init__(self, initial: Settings):
        self._settings: Settings = initial

    def get_settings(self) -> Settings:
        return self._settings
    
    def set_settings(self, new_settings: Settings):
        self._settings = new_settings

settings_store = SettingsStore(DEFAULT_SETTINGS)

def get_db_by_type(db_type: str) -> Database:
    if db_type == DatabaseType.postgres:
        return pg_db
    # elif db_type == DatabaseType.mysql:
    #     return mysql_db
    else:
        raise ValueError("Invalid db type")

def get_db_from_settings() -> Database:
    s = settings_store.get_settings()
    return get_db_by_type(s.database)


@app.before_request
def setup_database():
    if request.method == "OPTIONS":
        return
    try:
        g.db = get_db_from_settings()
    except Exception:
        g.db = pg_db


@app.route("/update-settings", methods=["POST", "OPTIONS"])
def update_settings():
    if request.method == "OPTIONS":
        return "", 204

    app.logger.info("Start saving settings")

    try:
        payload = request.get_json()
        settings_data = payload.get("settings", payload)
        
        new_settings = parse_settings(settings_data)
        settings_store.set_settings(new_settings)
        return jsonify({"status": "success", "settings": new_settings.model_dump()}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    

@app.route("/crawl", methods=["POST", "OPTIONS"])
def crawl_link():
    if request.method == "OPTIONS":
        return "", 204
    
    app.logger.info("Start crawling")

    data = request.get_json()
    link = data["link"]
    crawler = Crawler()

    try:
        sections = crawler.extract(link=link)
        app.logger.info(sections[0])
        
        exists = g.db.table_exists("mytable")
        if not exists:
            g.db.create_vector_table("mytable")
        cleaned_docs = clean_documents([s.get('content') for s in sections])
        vectors = text_encoder.encode(cleaned_docs)
        contents = cleaned_docs
        titles = [s.get('title') for s in sections]
        page_urls = [s.get('page_url') for s in sections]

        g.db.add_documents("mytable", titles, contents, page_urls, vectors)

    except Exception as e:
        app.logger.error(f"An error occurred while crowling: {e!s}")

    return jsonify({"status": "success"}), 200


@app.route("/add", methods=["POST", "OPTIONS"])
def add_documents():
    if request.method == "OPTIONS":
        return "", 204
    
    app.logger.info("Start adding documents")
    
    data = request.get_json()
    documents = data["contents"]

    exists = g.db.table_exists("mytable")
    if not exists:
        g.db.create_vector_table("mytable")

    cleaned_docs = clean_documents(documents)
    vectors = text_encoder.encode(cleaned_docs)
    contents = cleaned_docs
    titles = [f"Document {i+1}" for i in range(len(contents))]
    page_urls = [None for _ in contents]

    g.db.add_documents("mytable", titles, contents, page_urls, vectors)
    
    db_type = "postgres" if g.db == pg_db else "mysql"
    return jsonify({"status": "success", "database": db_type}), 200


@app.route("/search", methods=["POST", "OPTIONS"])
def search_documents():
    if request.method == "OPTIONS":
        return "", 204
    
    app.logger.info("Start searching documents")
    
    data = request.get_json()
    query = data["query"]
    limit = data.get("limit", 5)

    current_settings = settings_store.get_settings()
    metric = current_settings.metric
    
    cleaned_query = clean_text(query)
    vector = text_encoder.encode(cleaned_query)[0]

    results = g.db.search("mytable", vector, metric=metric, limit=limit)
    
    serializable_results = []
    for r in results:
        result_dict = {
            "id": r[0], 
            "title": r[1],
            "content": r[2]
        }
        
        if metric == "cosine":
            result_dict["similarity_percent"] = r[3]
        elif metric == "l2":
            result_dict["l2_distance"] = r[3]
        elif metric == "inner_product":
            result_dict["inner_product_score"] = r[3]
        
        serializable_results.append(result_dict)
    
    app.logger.info(serializable_results)
    return jsonify({
        "results": serializable_results,
        "metric_used": metric,
        "total_results": len(serializable_results)
    })


@app.route("/prompt", methods=["POST", "OPTIONS"])
def prompt_llm():
    if request.method == "OPTIONS":
        return "", 204
    
    app.logger.info("Start prompting llm")
    
    data = request.get_json()
    query = data["prompt"]
    
    provider = data.get("provider", "ollama")
    model_name = data.get("model")
    api_key = data.get("apiKey")
    
    queries = expand_query(
        query, 
        expand_to_n=4, 
        provider=provider, 
        model_name=model_name, 
        api_key=api_key
    )
    
    encoded_queries = text_encoder.encode(queries)
    n_k_documents = [g.db.search("mytable", vector, metric="cosine", limit=5) for vector in encoded_queries]
    
    n_k_documents = [item for sublist in n_k_documents for item in sublist]
    
    unique_docs = {}
    for doc in n_k_documents:
        doc_id = doc[0]
        similarity = doc[3]
        
        if doc_id not in unique_docs or similarity > unique_docs[doc_id][3]:
            unique_docs[doc_id] = doc
    
    n_k_documents = list(unique_docs.values())

    k_documents_tuples = rerank_documents(query, docs=n_k_documents, top_k=5)
    
    k_documents = []
    for doc_tuple in k_documents_tuples:
        document = {
            "id": doc_tuple[0],
            "title": doc_tuple[1], 
            "content": doc_tuple[2],
            "similarity_percent": doc_tuple[3]
        }
        k_documents.append(document)
    
    answer = call_llm(
        query, 
        documents=k_documents, 
        provider=provider,
        model_name=model_name, 
        api_key=api_key
    )

    return jsonify({"answer": answer, "docs": k_documents})


if __name__ == "__main__":
    app.run(port=8000, debug=True)
