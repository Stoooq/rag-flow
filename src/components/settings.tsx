import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useEffect, useState } from "react";
import {
  DatabaseType,
  LLMProvider,
  PostgresMetric,
  MySQLMetric,
  type SettingsType,
} from "../types/settings";

function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<SettingsType | null>(null);

  const APP_URL = import.meta.env.VITE_APP_URL || "http://ferrytworkshop.domdata.at:7998";

  const loadSettings = async () => {
    console.log("settings loaded");
    try {
      const response = await fetch(`${APP_URL}/load-settings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setLocalSettings(data.settings);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = async (newSettings: SettingsType) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${APP_URL}/update-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (response.ok) {
        setLocalSettings(newSettings);
        console.log("Settings saved");
        setIsOpen(false);
      } else {
        console.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="shadow">Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Configure your database, metrics and LLM provider preferences.
          </DialogDescription>
        </DialogHeader>
        {localSettings === null ? (
          <>Loading</>
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Text encoder model</Label>
                <p className="text-sm text-muted-foreground">
                  Enter a model name from Hugging Face (e.g.,
                  sentence-transformers/all-MiniLM-L6-v2)
                </p>
                <Input
                  value={localSettings.textEncoder}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      textEncoder: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-base font-medium">Database</Label>
                <RadioGroup
                  value={localSettings.database}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      database: value,
                      metric:
                        value === DatabaseType.Postgres
                          ? PostgresMetric.Cosine
                          : MySQLMetric.Cosine,
                    } as SettingsType)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={DatabaseType.Postgres} id="postgres" />
                    <Label htmlFor="postgres">PostgreSQL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={DatabaseType.MySQL} id="mysql" />
                    <Label htmlFor="mysql">MySQL</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Metric</Label>
                <RadioGroup
                  value={localSettings.metric}
                  onValueChange={(value) => {
                    if (localSettings.database === DatabaseType.Postgres) {
                      setLocalSettings({
                        ...localSettings,
                        metric: value as PostgresMetric,
                      });
                    } else {
                      setLocalSettings({
                        ...localSettings,
                        metric: value as MySQLMetric,
                      });
                    }
                  }}
                >
                  {localSettings.database === DatabaseType.Postgres ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={PostgresMetric.Cosine} id="cosine" />
                        <Label htmlFor="cosine">Cosine</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={PostgresMetric.L2} id="l2" />
                        <Label htmlFor="l2">L2</Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={MySQLMetric.Cosine} id="cosine" />
                        <Label htmlFor="cosine">Cosine</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={MySQLMetric.L2} id="l2" />
                        <Label htmlFor="l2">L2</Label>
                      </div>
                    </>
                  )}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">LLM Provider</Label>
                <RadioGroup
                  value={localSettings.llmProvider}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      llmProvider: value as LLMProvider,
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={LLMProvider.Ollama} id="ollama" />
                    <Label htmlFor="ollama">Ollama</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={LLMProvider.OpenAI} id="openai" />
                    <Label htmlFor="openai">OpenAI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={LLMProvider.Domdata} id="domdata" />
                    <Label htmlFor="domdata">Domdata</Label>
                  </div>
                </RadioGroup>
              </div>

              {localSettings.llmProvider === LLMProvider.OpenAI && (
                <div className="border-t pt-4">
                  <Label className="text-base font-medium">OpenAI API Key</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter your OpenAI API key (starts with sk-)
                  </p>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={localSettings.openAiApiKey || ""}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        openAiApiKey: e.target.value,
                      })
                    }
                  />
                  {localSettings.openAiApiKey && !localSettings.openAiApiKey.startsWith("sk-") && (
                    <p className="text-sm text-destructive mt-1">
                      OpenAI API keys typically start with "sk-"
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-start">
              <Button
                type="button"
                variant="my"
                onClick={() => saveSettings(localSettings)}
                disabled={isSaving}
              >
                Save Settings
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default Settings;
