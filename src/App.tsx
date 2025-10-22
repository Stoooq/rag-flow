import { useState, type ChangeEvent } from "react";
import "./App.css";
import AddDocuments from "./components/add-documents";
import SearchDocuments from "./components/search-documents";
import Settings from "./components/settings";
import PromptModel from "./components/prompt-model";
import { DatabaseType, LLMProvider, PostgresMetric, type SettingsType } from "./types/settings";
import WebCrawler from "./components/web-crawler";

interface SearchResult {
  id: number;
  title: string;
  content: string;
  similarity_percent?: number;
}

function App() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [prompt, setPrompt] = useState<string | "">("");
  const [url, setUrl] = useState("");
  const [settings, setSettings] = useState<SettingsType>({
    database: DatabaseType.Postgres,
    metric: PostgresMetric.Cosine,
    llmProvider: LLMProvider.Ollama,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const saveSettings = async (newSettings: SettingsType) => {
    setIsSaving(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (response.ok) {
        setSettings(newSettings);
        console.log("Settings saved");
      } else {
        console.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addDocuments = async () => {
    if (!files) return;

    setIsUploading(true);
    try {
      const text = await Promise.all(files.map((file) => file.text()));

      const response = await fetch("http://127.0.0.1:8000/add", {
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

  const searchDocuments = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/search", {
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

  const promptModel = async () => {
    if (!prompt.trim()) return;

    setIsPrompting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt, provider: settings?.llmProvider, model: "", apiKey: null }),
      });
      const data = await res.json();
      console.log(data.answer);
      console.log(data.docs);
    } catch (error) {
      console.error("Error prompting model:", error);
    } finally {
      setIsPrompting(false);
    }
  };

  const crawlWebsite = async () => {
    if (!url.trim()) return;

    setIsCrawling(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: url }),
      });

      if (response.ok) {
        setUrl("");
        console.log("Website crawled successfully");
      } else {
        console.error("Failed to crawl website");
      }
    } catch (error) {
      console.error("Error crawling website:", error);
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div className="w-full flex flex-col p-12 gap-12">
      <Settings 
        settings={settings}
        onSaveSettings={saveSettings}
        isSaving={isSaving}
      />
      <WebCrawler 
        url={url}
        onUrlChange={handleUrlChange}
        onCrawl={crawlWebsite}
        isCrawling={isCrawling}
      />
      <div className="grid grid-cols-2 gap-8">
        <AddDocuments
          files={files}
          onFileChange={handleFileChange}
          onAddDocuments={addDocuments}
          isUploading={isUploading}
        />
        <SearchDocuments
          query={query}
          onQueryChange={handleQueryChange}
          onSearch={searchDocuments}
          results={results}
          isSearching={isSearching}
        />
        <PromptModel
          className="col-span-2"
          prompt={prompt}
          onPromptChange={handlePromptChange}
          onPrompt={promptModel}
          isPrompting={isPrompting}
        />
      </div>
    </div>
  );
}

export default App;
