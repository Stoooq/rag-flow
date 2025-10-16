import re
from typing import Optional
from templates.prompts import QueryExpansionTemplate, RAGPromptTemplate
from services.llm_providers import get_llm_provider


def expand_query(query: str, expand_to_n: int, provider: str = "ollama", model_name: Optional[str] = None, api_key: Optional[str] = None) -> list[str]:
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
            cleaned = re.sub(r'^\d+\.\s*', '', stripped_content)
            cleaned = cleaned.strip()
            if cleaned and cleaned != query:
                queries.append(cleaned)
    
    return queries


def call_llm(query: str, documents: list[tuple], provider: str = "ollama",
             model_name: Optional[str] = None, api_key: Optional[str] = None) -> str:
    llm = get_llm_provider(provider, model_name, temperature=0.0, api_key=api_key)
    prompt = RAGPromptTemplate.create_prompt(query, documents)
    response = llm.invoke(prompt)
    return response


__all__ = ["expand_query", "call_llm"]
