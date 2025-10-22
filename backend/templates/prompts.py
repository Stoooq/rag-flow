from langchain.prompts import PromptTemplate

class QueryExpansionTemplate:    
    def __init__(self):
        self.prompt = """You are an AI language model assistant. Your task is to generate 
        {expand_to_n} different versions of the given user question to retrieve relevant 
        documents from a vector database. By generating multiple perspectives on the user 
        question, your goal is to help the user overcome some of the limitations of the 
        distance-based similarity search.
        IMPORTANT: Provide ONLY the alternative questions, one per line, separated by '{separator}'.
        Do NOT include numbering, explanations, or any other text. Just the questions.
        Original question: {question}
        Alternative questions:"""

    @property
    def separator(self) -> str:
        return "#next-question#"
    
    def create_template(self, expand_to_n: int) -> PromptTemplate:
        return PromptTemplate(
            template=self.prompt,
            input_variables=["question"],
            partial_variables={
                "separator": self.separator,
                "expand_to_n": expand_to_n,
            },
        )


class RAGPromptTemplate:
    @staticmethod
    def create_prompt(query: str, documents: list[dict]) -> str:
        context = "\n".join([
            f"Document ID: {doc.get('id')}\nContent: {doc.get('content')}" 
            for doc in documents
        ])
        
        return f"""You are a helpful assistant. Write what the user asked you to while using
        the provided context as the primary source of information for the content.
        User query: {query}
        Context: {context}
        """
