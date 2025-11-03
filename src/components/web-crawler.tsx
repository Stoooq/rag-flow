import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { type ChangeEvent } from "react";

interface WebCrawlerProps {
  url: string;
  onUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCrawl: () => void;
  isCrawling?: boolean;
}

function WebCrawler({ url, onUrlChange, onCrawl, isCrawling = false }: WebCrawlerProps) {
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
            onChange={onUrlChange}
            placeholder="Enter website URL to crawl (e.g., https://example.com)"
            className="flex-1"
          />
          <Button variant="my" onClick={onCrawl} disabled={!url.trim() || isCrawling}>
            {isCrawling ? "Crawling..." : "Crawl"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WebCrawler;
