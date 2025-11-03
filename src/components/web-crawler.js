import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
function WebCrawler({ url, onUrlChange, onCrawl, isCrawling = false }) {
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Web Content Crawler" }), _jsx(CardDescription, { children: "Enter website URLs to automatically crawl and extract content. The crawler will fetch web pages and convert them into documents for semantic search." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-4", children: [_jsx(Input, { value: url, onChange: onUrlChange, placeholder: "Enter website URL to crawl (e.g., https://example.com)", className: "flex-1" }), _jsx(Button, { variant: "my", onClick: onCrawl, disabled: !url.trim() || isCrawling, children: isCrawling ? "Crawling..." : "Crawl" })] }) })] }));
}
export default WebCrawler;
