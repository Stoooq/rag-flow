import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { type ChangeEvent } from "react";
import { useState } from "react";

function WebCrawler() {
  const [isCrawling, setIsCrawling] = useState(false);
  const [url, setUrl] = useState("");

  const crawlWebsite = async () => {
    if (!url.trim()) return;

    const APP_URL = import.meta.env.VITE_APP_URL || "http://127.0.0.1:8000";

    setIsCrawling(true);
    try {
      const response = await fetch(`${APP_URL}/crawl`, {
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

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Web Content Crawler</CardTitle>
        <CardDescription>
          Enter website URLs to automatically crawl and extract content. The crawler will fetch web
          pages and convert them into documents for semantic search.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter website URL to crawl (e.g., https://example.com)"
            className="flex-1"
          />
          <Button variant="my" onClick={crawlWebsite} disabled={!url.trim() || isCrawling}>
            {isCrawling ? "Crawling..." : "Crawl"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WebCrawler;
