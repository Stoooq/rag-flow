from sentence_transformers import SentenceTransformer

class TextEncoder:    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.encoder = SentenceTransformer(model_name)
    
    def encode(self, documents: str | list[str]) -> list[list[float]]:
        if isinstance(documents, str):
            documents = [documents]
        return [self.encoder.encode(document).tolist() for document in documents]


text_encoder = TextEncoder()

__all__ = ["TextEncoder", "text_encoder"]
