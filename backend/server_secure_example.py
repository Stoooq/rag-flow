"""
Secure implementation example - API keys stored only on backend.
Replace the /prompt endpoint in server.py with this version for production.
"""
import os
from flask import Flask, request, jsonify, g

# ... other imports ...

@app.route("/prompt", methods=["POST", "OPTIONS"])
def prompt_llm_secure():
    """
    Secure version: API keys are stored on backend only.
    Frontend sends only provider and model name.
    """
    if request.method == "OPTIONS":
        return "", 204
    
    data = request.get_json()
    query = data["promptQuery"]
    
    # LLM configuration from request
    provider = data.get("provider", "ollama")  # ollama, openai, gemini
    model_name = data.get("model")  # Optional specific model
    
    # Get API key from environment variables (secure)
    api_key = None
    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return jsonify({
                "status": "error", 
                "message": "OpenAI API key not configured on server"
            }), 500
    elif provider == "gemini":
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return jsonify({
                "status": "error", 
                "message": "Gemini API key not configured on server"
            }), 500
    
    try:
        # Query expansion
        queries = expand_query(
            query, 
            expand_to_n=4, 
            provider=provider, 
            model_name=model_name, 
            api_key=api_key
        )
        
        # Search for documents
        encoded_queries = text_encoder.encode(queries)
        n_k_documents = [g.db.search("mytable", vector, limit=5) for vector in encoded_queries]
        
        n_k_documents = [item for sublist in n_k_documents for item in sublist]
        n_k_documents = list(set(n_k_documents))
        
        # Rerank documents
        k_documents = rerank_documents(query, docs=n_k_documents, top_k=5)
        
        # Generate answer
        answer = call_llm(
            query, 
            documents=k_documents, 
            provider=provider, 
            model_name=model_name, 
            api_key=api_key
        )

        return jsonify({"answer": answer})
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"LLM error: {str(e)}"
        }), 500
