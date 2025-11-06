from abc import ABC, abstractmethod
from typing import Optional
import os
import requests
import json
from loguru import logger

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


class DomdataProvider(LLMProvider):
    def __init__(self, model_name: str = "domdata", temperature: float = 0.0):
        super().__init__(model_name, temperature)

        self.key = os.getenv("DOMDATA_MODEL_TOKEN")
        if not self.key:
            raise ValueError("API key required")
        
        self.url = os.getenv("DOMDATA_MODEL_URL")
        if not self.url:
            raise ValueError("API key required")
        
    def parse_streaming_response(response):
        collected_chunks = []
        for line in response.iter_lines(decode_unicode=True):
            line_str = line.strip()
            if line_str.startsWith("data: "):
                data_str = line_str[len("data: "):]
                data_json = json.loads(data_str)
                if "chunks" in data_json:
                    collected_chunks.append(data_json["chunks"])
        return "".join(collected_chunks)
        
    def invoke(self, prompt: str) -> str:
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json"
        }

        payload = {
            "conversation_id": "demo-conversation-g",
            "conversation": [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": {prompt}
                        }
                    ]
                }
            ],
            "model_settings": {
                "name": "speakleash/Bielik-11B-v2.2-Instruct-FP8",
                "temperature": {self.temperature},
                "min_new_tokens": 5,
                "max_new_tokens": 500
            },
            "context": {
                "session_id": "string",
                "context_id": "string",
                "request_id": "string",
                "unique_id": "string"
            },
            "runtime": {
                "endpoint": "workplace|eform|architect|admin|install",
                "url": "/architect/sso/external-services",
                "path": "/Integracja/Serwisy_zewnętrzne",
                "language": "pl"
            },
            "agent": {
                "symbol": "ArchitectBPMN",
                "name": "chat|ruleset|sepconditions",
                "collections": [],
                "space": "tenantNameX",
                "settings": {
                    "key": "value"
                }
            }
        }
        try:
            response = requests.post(self.url, headers=headers, json=payload, stream=True)
            return self.parse_streaming_response(response)
        except Exception as e:
            logger.info("ERROR: ", e)


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
    
    if provider_type == "domdata":
        model = model_name or ""
        return DomdataProvider(model_name=model, temperature=temperature, api_key=api_key)

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
