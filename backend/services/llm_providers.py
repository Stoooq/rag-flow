from abc import ABC, abstractmethod
from typing import Optional
import os

from langchain_ollama import OllamaLLM
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

class LLMProvider(ABC):

    def __init__(self, model_name: str, temperature: float = 0.0, api_key: Optional[str] = None):
        self.model_name = model_name
        self.temperature = temperature
        self.api_key = api_key
    
    @abstractmethod
    def invoke(self, prompt: str) -> str:
        pass


class OllamaProvider(LLMProvider):
    def __init__(self, model_name: str = "jobautomation/OpenEuroLLM-Polish", temperature: float = 0.0):
        super().__init__(model_name, temperature)
        self.model = OllamaLLM(model=model_name, temperature=temperature)
    
    def invoke(self, prompt: str) -> str:
        return self.model.invoke(prompt)


class OpenAIProvider(LLMProvider):    
    def __init__(self, model_name: str = "gpt-4o-mini", temperature: float = 0.0, api_key: Optional[str] = None):
        super().__init__(model_name, temperature, api_key)
        
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            raise ValueError("OpenAI API key required")
        
        self.model = ChatOpenAI(model=model_name, temperature=temperature, api_key=key)
    
    def invoke(self, prompt: str) -> str:
        response = self.model.invoke(prompt)
        return response.content


class GeminiProvider(LLMProvider):
    def __init__(self, model_name: str = "gemini-1.5-flash", temperature: float = 0.0, api_key: Optional[str] = None):
        super().__init__(model_name, temperature, api_key)

        key = api_key or os.getenv("GOOGLE_API_KEY")
        if not key:
            raise ValueError("Gemini API key required")
        
        self.model = ChatGoogleGenerativeAI(model=model_name, temperature=temperature, google_api_key=key)
    
    def invoke(self, prompt: str) -> str:
        response = self.model.invoke(prompt)
        return response.content


def get_llm_provider(provider_type: str, model_name: Optional[str] = None, temperature: float = 0.0, api_key: Optional[str] = None) -> LLMProvider:
    provider_type = provider_type.lower()
    
    if provider_type == "ollama":
        model = model_name or "jobautomation/OpenEuroLLM-Polish"
        return OllamaProvider(model_name=model, temperature=temperature)
    
    elif provider_type == "openai":
        model = model_name or "gpt-4o-mini"
        return OpenAIProvider(model_name=model, temperature=temperature, api_key=api_key)
    
    elif provider_type == "gemini":
        model = model_name or "gemini-1.5-flash"
        return GeminiProvider(model_name=model, temperature=temperature, api_key=api_key)
    
    else:
        raise ValueError(f"Unsupported provider: {provider_type}. Choose from: ollama, openai, gemini")


__all__ = ["LLMProvider", "OllamaProvider", "OpenAIProvider", "GeminiProvider", "get_llm_provider"]
