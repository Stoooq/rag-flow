import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
function PromptModel({ className, prompt, onPromptChange, onPrompt, isPrompting = false, }) {
    return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Assistant with RAG" }), _jsx(CardDescription, { children: "Ask questions about your documents. AI will search your knowledge base and provide contextual answers." })] }), _jsx(CardContent, { children: _jsx(Input, { value: prompt, onChange: onPromptChange, placeholder: "Ask a question about your documents..." }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "my", onClick: onPrompt, disabled: !prompt.trim() || isPrompting, children: isPrompting ? "Processing..." : "Ask AI" }) })] }));
}
export default PromptModel;
