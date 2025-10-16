import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { type ChangeEvent } from "react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface AddDocumentsProps {
  files: File[] | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddDocuments: () => Promise<void>;
  isUploading?: boolean;
}

function AddDocuments({
  files,
  onFileChange,
  onAddDocuments,
  isUploading = false,
}: AddDocumentsProps) {
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
        <Input type="file" onChange={onFileChange} multiple accept=".txt,.md,.pdf" />
        <div className="flex items-stretch border-2 border-dashed w-full h-[150px] min-h-0">
          {files && files.length > 0 ? (
            // --- Opcja A: jeżeli masz gotowy komponent ScrollArea (Radix/shadcn)
            // ZAMIEN: <div className="scroll-area-wrapper"> na swój komponent ScrollArea
            // i jeżeli komponent ma props typu viewportClassName/viewportRef — przekaż tam
            // klasę "h-full min-h-0".

            <div className="w-full h-full min-h-0">
              {/* Zamień poniższy div na <ScrollArea className="w-full h-full min-h-0"> jeśli używasz biblioteki */}
              <div className="w-full h-full min-h-0 overflow-x-auto overflow-y-hidden">
                {/* wrapper z itemami — musi mieć `h-full` oraz `items-stretch` żeby dzieci mogły rozciągnąć się na wysokość */}
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
              {/* jeśli masz custom ScrollBar, wstaw go tutaj (zazwyczaj biblioteki wymagają umieszczenia scrollbar na zewnątrz viewporta) */}
            </div>
          ) : (
            <div className="h-full w-full flex justify-center items-center text-muted-foreground text-sm">No files uploaded</div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="my"
          onClick={onAddDocuments}
          disabled={!files || files.length === 0 || isUploading}
        >
          {isUploading ? "Uploading..." : "Add Documents"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddDocuments;
