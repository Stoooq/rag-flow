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
import { useState } from "react";
import { DatabaseType, LLMProvider, PostgresMetric, MySQLMetric, type SettingsType } from "../types/settings";

interface SettingsProps {
  settings: SettingsType;
  onSaveSettings: (settings: SettingsType) => Promise<void>;
  isSaving?: boolean;
}

function Settings({ settings, onSaveSettings, isSaving = false }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="shadow">Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>Configure your database, metrics and LLM provider preferences.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Database</Label>
            <RadioGroup 
              value={localSettings.database} 
              onValueChange={(value) => setLocalSettings({
                ...localSettings,
                database: value as DatabaseType,
                metric: value === DatabaseType.Postgres ? PostgresMetric.Cosine : MySQLMetric.Cosine
              })}
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
              onValueChange={(value) => setLocalSettings({
                ...localSettings,
                metric: value as any
              })}
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
              onValueChange={(value) => setLocalSettings({
                ...localSettings,
                llmProvider: value as LLMProvider
              })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={LLMProvider.Ollama} id="ollama" />
                <Label htmlFor="ollama">Ollama</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={LLMProvider.OpenAI} id="openai" />
                <Label htmlFor="openai">OpenAI</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="my"
            onClick={() => onSaveSettings(localSettings)}
            disabled={isSaving}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Settings;
