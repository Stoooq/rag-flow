import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useState, type ChangeEvent } from "react";

function AddDocuments() {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);

  const addDocuments = async () => {
    if (!files) return;

    setIsUploading(true);
    try {
      const text = await Promise.all(files.map((file) => file.text()));

      const APP_URL = import.meta.env.VITE_APP_URL || "http://ferrytwkshop.domdata.at:7998";

      const response = await fetch(`${APP_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: text }),
      });

      if (response.ok) {
        setFiles(null);
      } else {
        console.error("Failed to upload documents");
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Documents to Vector Database</CardTitle>
        <CardDescription>
          Upload text files to create embeddings and store them in the vector database for semantic
          search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" onChange={handleFileChange} multiple accept=".txt,.md,.pdf" />
        <div className="flex items-stretch border-2 border-dashed w-full h-[150px] min-h-0">
          {files && files.length > 0 ? (
            <div className="w-full h-full min-h-0">
              <div className="w-full h-full min-h-0 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full items-stretch w-max space-x-4 p-2">
                  {files.map((file, index) => (
                    // Każdy item ma h-full i min-h-0 — dzięki temu wypełnia wysokość kontenera
                    <div
                      key={index}
                      className="flex flex-col justify-between text-sm bg-[#393939] p-2 h-full min-h-0"
                    >
                      <p className="text-lg truncate">{file.name}</p>
                      <div className="text-muted-foreground">
                        <p>Type: {file.type || "unknown"}</p>
                        <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
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
        <Button
          variant="my"
          onClick={addDocuments}
          disabled={!files || files.length === 0 || isUploading}
        >
          {isUploading ? "Uploading..." : "Add Documents"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddDocuments;
