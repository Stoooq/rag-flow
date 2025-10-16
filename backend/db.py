import psycopg

class DbClient:
    def __init__(self, dbname, user, password, host="localhost", port=5432):
        self.conn = psycopg.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )

    def add_document(self, table, content, embedding):
        query = f"INSERT INTO {table} (content, embedding) VALUES (%s, %s)"
        with self.conn.cursor() as cur:
            cur.execute(query, (content, embedding))
            self.conn.commit()

    def add_documents(self, table, contents, embeddings):
        if not embeddings or not contents or len(contents) != len(embeddings):
            return
        query = f"INSERT INTO {table} (content, embedding) VALUES (%s, %s)"
        with self.conn.cursor() as cur:
            cur.executemany(query, list(zip(contents, embeddings)))
            self.conn.commit()

    def remove_document(self, table, condition):
        with self.conn.cursor() as cur:
            query = f"DELETE FROM {table} WHERE {condition}"
            cur.execute(query)
            self.conn.commit()

    def search(self, table, query_vector, limit=5):
        if hasattr(query_vector, "tolist"):
            query_vector = query_vector.tolist()
        with self.conn.cursor() as cur:
            sql = f"""
            SELECT id, content
            FROM {table}
            ORDER BY embedding <=> %s::vector
            LIMIT %s
            """
            cur.execute(sql, (query_vector, limit))
            return cur.fetchall()

    def create_vector_table(self, table_name, dim=384):
        with self.conn.cursor() as cur:
            query = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                id SERIAL PRIMARY KEY,
                content TEXT,
                embedding vector({dim})
            )
            """
            cur.execute(query)
            self.conn.commit()

    def table_exists(self, table_name):
        with self.conn.cursor() as cur:
            cur.execute(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name=%s);",
                (table_name,)
            )
            return cur.fetchone()[0]

    def close(self):
        self.conn.close()
