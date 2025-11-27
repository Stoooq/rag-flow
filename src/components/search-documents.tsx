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

interface SearchResult {
  id: number;
  title: string | null;
  content: string;
  similarity_percent?: number;
}

function SearchDocuments() {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchDocuments = async () => {
    if (!query.trim()) return;

    const APP_URL = import.meta.env.VITE_APP_URL || "http://127.0.0.1:8000";

    setIsSearching(true);
    try {
      const res = await fetch(`${APP_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          limit: 5,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error searching documents:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Document Search</CardTitle>
        <CardDescription>
          Search through your documents using natural language. Find relevant content based on
          meaning, not just keywords.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={query}
          onChange={handleQueryChange}
          placeholder="Ask a question or describe what you're looking for..."
        />
        <div className="flex items-stretch border-2 border-dashed w-full h-[150px] min-h-0">
          {results && results.length > 0 ? (
            <div className="w-full h-full min-h-0">
              <div className="w-full h-full min-h-0 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full items-stretch w-max space-x-4 p-2">
                  {results.map((result, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div
                          key={index}
                          className="flex flex-col justify-between text-sm bg-[#393939] p-2 h-full min-h-0 cursor-pointer"
                        >
                          <p className="text-lg truncate">Document Id: {result.id}</p>
                          <p className="text-lg truncate">{result.title}</p>
                          <div className="text-muted-foreground">
                            <p>Similarity: {result.similarity_percent || "unknown"}</p>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Document: {result.id} Title: {result.title}
                          </DialogTitle>
                          <DialogDescription>
                            Similarity: {result.similarity_percent}
                          </DialogDescription>
                        </DialogHeader>
                        {result.content}
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex justify-center items-center text-muted-foreground text-sm">
              No files uploaded
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="my" onClick={searchDocuments} disabled={!query.trim() || isSearching}>
          {isSearching ? "Searching..." : "Search Documents"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SearchDocuments;
