import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState, type ChangeEvent } from "react";

interface Document {
  content: string;
  id: number;
  similarity_percent: number;
  title: string;
}

function PromptModel() {
  const [prompt, setPrompt] = useState<string | "">("");
  const [answer, setAnswer] = useState<string | "">("");
  const [docs, setDocs] = useState<Document[] | []>([]);
  const [isPrompting, setIsPrompting] = useState(false);

  const APP_URL = import.meta.env.VITE_APP_URL || "http://ferrytworkshop.domdata.at:7998";

  const promptModel = async () => {
    if (!prompt.trim()) return;

    setIsPrompting(true);
    try {
      const res = await fetch(`${APP_URL}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt, apiKey: null }),
      });
      const data = await res.json();
      setAnswer(data.answer);
      setDocs(data.docs);
    } catch (error) {
      console.error("Error prompting model:", error);
    } finally {
      setIsPrompting(false);
    }
  };

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>AI Assistant with RAG</CardTitle>
        <CardDescription>
          Ask questions about your documents. AI will search your knowledge base and provide
          contextual answers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Ask a question about your documents..."
        />
        {answer && <div className="p-4">{answer}</div>}
        {docs && docs.length > 0 && (
          <div className="w-full h-[150px] min-h-0">
            <div className="w-full h-full min-h-0 overflow-x-auto overflow-y-hidden">
              <div className="flex h-full items-stretch w-max space-x-4 p-2">
                {docs.map((doc, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div
                        key={index}
                        className="flex flex-col justify-between text-sm bg-[#393939] p-2 h-full min-h-0 cursor-pointer"
                      >
                        <p className="text-lg truncate">Document Id: {doc.id}</p>
                        <p className="text-lg truncate">{doc.title}</p>
                        <div className="text-muted-foreground">
                          <p>Similarity: {doc.similarity_percent || "unknown"}</p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-h-[calc(100vh-4rem)] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Document: {doc.id} Title: {doc.title}
                        </DialogTitle>
                        <DialogDescription>Similarity: {doc.similarity_percent}</DialogDescription>
                      </DialogHeader>
                      {doc.content}
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="my" onClick={promptModel} disabled={!prompt.trim() || isPrompting}>
          {isPrompting ? "Processing..." : "Ask AI"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PromptModel;
