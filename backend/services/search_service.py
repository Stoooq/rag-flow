from sentence_transformers import CrossEncoder

def rerank_documents(query: str, docs: list[tuple], top_k: int) -> list[tuple]:
    model = CrossEncoder(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-6-v2")

    query_doc_tuples = [(query, doc[2]) for doc in docs]
    scores = model.predict(query_doc_tuples)

    scored_query_doc_tuples = list(zip(scores, docs, strict=False))
    scored_query_doc_tuples.sort(key=lambda x: x[0], reverse=True)

    reranked_documents = scored_query_doc_tuples[:top_k]
    reranked_documents = [doc for _, doc in reranked_documents]

    return reranked_documents


__all__ = ["rerank_documents"]
