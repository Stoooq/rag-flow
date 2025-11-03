import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "./App.css";
import AddDocuments from "./components/add-documents";
import SearchDocuments from "./components/search-documents";
import Settings from "./components/settings";
import PromptModel from "./components/prompt-model";
import WebCrawler from "./components/web-crawler";
function App() {
    const [files, setFiles] = useState(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [url, setUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isPrompting, setIsPrompting] = useState(false);
    const [isCrawling, setIsCrawling] = useState(false);
    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };
    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };
    const handleUrlChange = (e) => {
        setUrl(e.target.value);
    };
    const crawlWebsite = async () => {
        if (!url.trim())
            return;
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
            }
            else {
                console.error("Failed to crawl website");
            }
        }
        catch (error) {
            console.error("Error crawling website:", error);
        }
        finally {
            setIsCrawling(false);
        }
    };
    const addDocuments = async () => {
        if (!files)
            return;
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
            }
            else {
                console.error("Failed to upload documents");
            }
        }
        catch (error) {
            console.error("Error uploading documents:", error);
        }
        finally {
            setIsUploading(false);
        }
    };
    const searchDocuments = async () => {
        if (!query.trim())
            return;
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
        }
        catch (error) {
            console.error("Error searching documents:", error);
            setResults([]);
        }
        finally {
            setIsSearching(false);
        }
    };
    const promptModel = async () => {
        if (!prompt.trim())
            return;
        setIsPrompting(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: prompt, apiKey: null }),
            });
            const data = await res.json();
            console.log(data.answer);
            console.log(data.docs);
        }
        catch (error) {
            console.error("Error prompting model:", error);
        }
        finally {
            setIsPrompting(false);
        }
    };
    return (_jsxs("div", { className: "w-full flex flex-col p-12 gap-12", children: [_jsx(Settings, {}), _jsx(WebCrawler, { url: url, onUrlChange: handleUrlChange, onCrawl: crawlWebsite, isCrawling: isCrawling }), _jsxs("div", { className: "grid grid-cols-2 gap-8", children: [_jsx(AddDocuments, { files: files, onFileChange: handleFileChange, onAddDocuments: addDocuments, isUploading: isUploading }), _jsx(SearchDocuments, { query: query, onQueryChange: handleQueryChange, onSearch: searchDocuments, results: results, isSearching: isSearching }), _jsx(PromptModel, { className: "col-span-2", prompt: prompt, onPromptChange: handlePromptChange, onPrompt: promptModel, isPrompting: isPrompting })] })] }));
}
export default App;
