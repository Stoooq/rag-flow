import pymysql
import psycopg
from contextlib import contextmanager

class Database:
    def __init__(self, db_type, host, port, user, password, db_name):
        self.db_type = db_type
        if db_type == "postgres":
            self.config = dict(host=host, port=port, user=user, password=password, dbname=db_name)
        elif db_type == "mysql":
            self.config = dict(host=host, port=port, user=user, password=password, database=db_name)
        else:
            raise ValueError("Unsupported db_type")

    @contextmanager
    def connect(self):
        if self.db_type == "postgres":
            conn = psycopg.connect(**self.config)
        elif self.db_type == "mysql":
            conn = pymysql.connect(**self.config, cursorclass=pymysql.cursors.DictCursor)
        else:
            raise ValueError("Unsupported db_type")
        try:
            yield conn
        finally:
            conn.close()

    def add_document(self, table: str, title: list[str], content: list[str], page_url: list[str], embedding: list[list[float]]):
        with self.connect() as conn:
            with conn.cursor() as cur:
                query = f"""
                INSERT INTO {table} (title, content, page_url, embedding) VALUES (%s, %s, %s, %s)
                """
                cur.execute(query, (title, content, page_url, embedding))
                conn.commit()

    def add_documents(self, table: str, titles: list[str], contents: list[str], page_urls: list[str], embeddings: list[list[float]]):
        with self.connect() as conn:
            with conn.cursor() as cur:
                query = f"""
                INSERT INTO {table} (title, content, page_url, embedding) VALUES (%s, %s, %s, %s)
                """
                data_tuples = []
                for title, content, page_url, embedding in zip(titles, contents, page_urls, embeddings):
                    data_tuples.append((title, content, page_url, embedding))
                
                cur.executemany(query, data_tuples)
                conn.commit()

    def remove_document(self, table: str, doc_id):
        with self.connect() as conn:
            with conn.cursor() as cur:
                query = f"DELETE FROM {table} WHERE id = %s"
                cur.execute(query, (doc_id,))
                conn.commit()

    def search(self, table: str, query_vector, metric: str = "cosine", limit=5):
        with self.connect() as conn:
            with conn.cursor() as cur:
                if hasattr(query_vector, "tolist"):
                    query_vector = query_vector.tolist()
                
                metric_operators = {
                    "cosine": "<=>",
                    "l2": "<->", 
                    "inner_product": "<#>"
                }
                
                operator = metric_operators.get(metric, "<=>")
                
                if metric == "cosine":
                    similarity_calc = f"ROUND(((1 - (embedding {operator} %s::vector)) * 100)::numeric, 2) as similarity_percent"
                elif metric == "l2":
                    similarity_calc = f"ROUND((embedding {operator} %s::vector)::numeric, 4) as l2_distance"
                elif metric == "inner_product":
                    similarity_calc = f"ROUND((embedding {operator} %s::vector)::numeric, 4) as inner_product_score"
                else:
                    similarity_calc = f"ROUND(((1 - (embedding {operator} %s::vector)) * 100)::numeric, 2) as similarity_percent"
                
                query = f"""
                SELECT id, title, content, {similarity_calc}
                FROM {table}
                ORDER BY embedding {operator} %s::vector
                LIMIT %s
                """
                cur.execute(query, (query_vector, query_vector, limit))
                return cur.fetchall()

    def create_vector_table(self, table, dim=384):
        with self.connect() as conn:
            with conn.cursor() as cur:
                query = f"""
                CREATE TABLE IF NOT EXISTS {table} (
                    id SERIAL PRIMARY KEY,
                    title TEXT,
                    content TEXT,
                    page_url TEXT NULL,
                    embedding vector({dim})
                )
                """
                cur.execute(query)
                conn.commit()

    def table_exists(self, table):
        with self.connect() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_name = %s
                    );
                """
                cur.execute(query, (table,))
                return cur.fetchone()[0]
