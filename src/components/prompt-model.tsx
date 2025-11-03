import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { type ChangeEvent } from "react";

interface PromptModelProps {
  className?: string;
  prompt: string;
  onPromptChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPrompt: () => void;
  isPrompting?: boolean;
}

function PromptModel({
  className,
  prompt,
  onPromptChange,
  onPrompt,
  isPrompting = false,
}: PromptModelProps) {
  return (
    <Card className={className}>
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
          onChange={onPromptChange}
          placeholder="Ask a question about your documents..."
        />
      </CardContent>
      <CardFooter>
        <Button variant="my" onClick={onPrompt} disabled={!prompt.trim() || isPrompting}>
          {isPrompting ? "Processing..." : "Ask AI"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PromptModel;
