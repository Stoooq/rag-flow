import re
from typing import Optional
from templates.prompts import QueryExpansionTemplate, RAGPromptTemplate
from services.llm_providers import get_llm_provider
import spacy
from loguru import logger

nlp = spacy.load("pl_core_news_md")
WORD_RE = re.compile(r"\b\w+\b", re.UNICODE)

def expand_query(
    query: str,
    expand_to_n: int,
    provider: str = "ollama",
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
) -> list[str]:
    query_expansion_template = QueryExpansionTemplate()
    prompt_template = query_expansion_template.create_template(expand_to_n - 1)

    llm = get_llm_provider(provider, model_name, temperature=0.0, api_key=api_key)

    prompt_text = prompt_template.format(question=query)
    response = llm.invoke(prompt_text)

    queries_content = response.strip().split(query_expansion_template.separator)
    queries = [query]

    for content in queries_content:
        stripped_content = content.strip()
        if stripped_content:
            cleaned = re.sub(r"^\d+\.\s*", "", stripped_content)
            cleaned = cleaned.strip()
            if cleaned and cleaned != query:
                queries.append(cleaned)

    return queries

def count_words(t):
    return len(WORD_RE.findall(t))

def trim_to_last_full_sentences(text, limit=15000):
    if count_words(text) <= limit:
        return text

    doc = nlp(text)
    sents = [s.text for s in doc.sents]

    total = 0
    chosen = []
    for s in sents:
        wc = count_words(s)
        if total + wc <= limit:
            chosen.append(s)
            total += wc
        else:
            break

    if not chosen:
        first = sents[0]
        words = WORD_RE.findall(first)
        return " ".join(words[:limit])

    return " ".join(chosen)

def call_llm(
    query: str,
    documents: list[dict],
    provider: str = "ollama",
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
    limit: int = 15000,
) -> str:
    llm = get_llm_provider(provider, model_name, temperature=0.0, api_key=api_key)
    prompt = RAGPromptTemplate.create_prompt(query, documents)

    trimmed_prompt = trim_to_last_full_sentences(text=prompt, limit=limit)
    response = llm.invoke(trimmed_prompt)

    return response


__all__ = ["expand_query", "call_llm"]
