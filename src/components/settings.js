import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useEffect, useState } from "react";
import { DatabaseType, LLMProvider, PostgresMetric, MySQLMetric, } from "../types/settings";
function Settings() {
    const [isSaving, setIsSaving] = useState(false);
    const [localSettings, setLocalSettings] = useState(null);
    const loadSettings = async () => {
        console.log("COS");
        try {
            const response = await fetch("http://127.0.0.1:8000/load-settings", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            setLocalSettings(data.settings);
        }
        catch (error) {
            console.error("Error loading settings:", error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const saveSettings = async (newSettings) => {
        setIsSaving(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/update-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: newSettings }),
            });
            if (response.ok) {
                setLocalSettings(newSettings);
                console.log("Settings saved");
            }
            else {
                console.error("Failed to save settings");
            }
        }
        catch (error) {
            console.error("Error saving settings:", error);
        }
        finally {
            setIsSaving(false);
        }
    };
    useEffect(() => {
        loadSettings();
    }, []);
    return (_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: "shadow", children: "Settings" }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Application Settings" }), _jsx(DialogDescription, { children: "Configure your database, metrics and LLM provider preferences." })] }), localSettings === null ? (_jsx(_Fragment, { children: "Loading" })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Text encoder model" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Enter a model name from Hugging Face (e.g., sentence-transformers/all-MiniLM-L6-v2)" }), _jsx(Input, { value: localSettings.textEncoder, onChange: (e) => setLocalSettings({
                                                    ...localSettings,
                                                    textEncoder: e.target.value,
                                                }) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Database" }), _jsxs(RadioGroup, { value: localSettings.database, onValueChange: (value) => setLocalSettings({
                                                    ...localSettings,
                                                    database: value,
                                                    metric: value === DatabaseType.Postgres
                                                        ? PostgresMetric.Cosine
                                                        : MySQLMetric.Cosine,
                                                }), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: DatabaseType.Postgres, id: "postgres" }), _jsx(Label, { htmlFor: "postgres", children: "PostgreSQL" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: DatabaseType.MySQL, id: "mysql" }), _jsx(Label, { htmlFor: "mysql", children: "MySQL" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Metric" }), _jsx(RadioGroup, { value: localSettings.metric, onValueChange: (value) => {
                                                    if (localSettings.database === DatabaseType.Postgres) {
                                                        setLocalSettings({
                                                            ...localSettings,
                                                            metric: value,
                                                        });
                                                    }
                                                    else {
                                                        setLocalSettings({
                                                            ...localSettings,
                                                            metric: value,
                                                        });
                                                    }
                                                }, children: localSettings.database === DatabaseType.Postgres ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: PostgresMetric.Cosine, id: "cosine" }), _jsx(Label, { htmlFor: "cosine", children: "Cosine" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: PostgresMetric.L2, id: "l2" }), _jsx(Label, { htmlFor: "l2", children: "L2" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: MySQLMetric.Cosine, id: "cosine" }), _jsx(Label, { htmlFor: "cosine", children: "Cosine" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: MySQLMetric.L2, id: "l2" }), _jsx(Label, { htmlFor: "l2", children: "L2" })] })] })) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "LLM Provider" }), _jsxs(RadioGroup, { value: localSettings.llmProvider, onValueChange: (value) => setLocalSettings({
                                                    ...localSettings,
                                                    llmProvider: value,
                                                }), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: LLMProvider.Ollama, id: "ollama" }), _jsx(Label, { htmlFor: "ollama", children: "Ollama" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: LLMProvider.OpenAI, id: "openai" }), _jsx(Label, { htmlFor: "openai", children: "OpenAI" })] })] })] })] }), _jsx(DialogFooter, { className: "sm:justify-start", children: _jsx(Button, { type: "button", variant: "my", onClick: () => saveSettings(localSettings), disabled: isSaving, children: "Save Settings" }) })] }))] })] }));
}
export default Settings;
