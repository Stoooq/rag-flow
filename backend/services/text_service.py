from sentence_transformers import SentenceTransformer

class TextEncoder:    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.encoder = SentenceTransformer(model_name)
    
    def update_model(self, new_model_name: str):
        if new_model_name != self.model_name:
            try:
                self.model_name = new_model_name
                self.encoder = SentenceTransformer(new_model_name)
            except Exception as e:
                raise Exception(f"Failed to load model '{new_model_name}': {str(e)}")
    
    def encode(self, documents: str | list[str]) -> list[list[float]]:
        if isinstance(documents, str):
            documents = [documents]
        return [self.encoder.encode(document).tolist() for document in documents]


text_encoder = TextEncoder()

__all__ = ["TextEncoder", "text_encoder"]
