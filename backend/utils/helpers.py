import re

def clean_text(text: str) -> str:
    text = re.sub(r"[^\w\s.,!?]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_documents(documents: list[str]) -> list[str]:
    return [clean_text(document) for document in documents]
