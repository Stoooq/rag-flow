import "./App.css";
import AddDocuments from "./components/add-documents";
import SearchDocuments from "./components/search-documents";
import Settings from "./components/settings";
import PromptModel from "./components/prompt-model";
import WebCrawler from "./components/web-crawler";

function App() {
  return (
    <div className="w-full flex flex-col p-12 gap-12">
      <Settings />
      <WebCrawler />
      <div className="grid grid-cols-2 gap-8">
        <AddDocuments />
        <SearchDocuments />
        <PromptModel />
      </div>
    </div>
  );
}

export default App;
