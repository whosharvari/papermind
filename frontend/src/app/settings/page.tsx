"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/settings-context";
import { SettingRow } from "@/features/settings/setting-row";
import { SettingsSection } from "@/features/settings/settings-section";
import { ThemeSelect } from "@/features/settings/theme-select";
import { useStats } from "@/hooks/use-stats";
import { shortModelName } from "@/lib/format";

function ComingSoonBadge() {
  return (
    <Badge variant="secondary" className="text-[10px] tracking-wide uppercase">
      Coming soon
    </Badge>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, isHydrated } = useSettings();
  const { data: stats } = useStats();
  const groqModel = stats?.status === "ready" ? shortModelName(stats.groq_model) : undefined;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tune how PaperMind retrieves and presents answers. Changes are saved automatically.
      </p>

      <div className="mt-10 flex flex-col gap-8" aria-busy={!isHydrated}>
        <SettingsSection
          title="Retrieval"
          description="Controls what gets pulled from the vector index for each question."
        >
          <SettingRow
            htmlFor="top-k"
            label="Top-K passages"
            description={`Retrieve the ${settings.topK} most similar chunks per question.`}
          >
            <div className="flex w-40 items-center gap-3">
              <Slider
                id="top-k"
                min={1}
                max={10}
                step={1}
                value={[settings.topK]}
                onValueChange={([value]) => updateSettings({ topK: value })}
              />
              <span className="w-4 text-right text-sm tabular-nums text-muted-foreground">
                {settings.topK}
              </span>
            </div>
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Model" description="Reflects the backend's fixed configuration for now.">
          <SettingRow
            htmlFor="temperature"
            label="Temperature"
            description="Not yet configurable -- the backend uses a fixed generation temperature."
            badge={<ComingSoonBadge />}
          >
            <div className="flex w-40 items-center gap-3">
              <Slider id="temperature" min={0} max={1} step={0.1} value={[settings.temperature]} disabled />
              <span className="w-6 text-right text-sm tabular-nums text-muted-foreground">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label="Language model"
            description="PaperMind will support switching models in a future release."
            badge={<ComingSoonBadge />}
          >
            <Select value={groqModel ?? ""} disabled>
              <SelectTrigger className="w-40" aria-label="Language model">
                <SelectValue placeholder={groqModel ? undefined : "Loading…"} />
              </SelectTrigger>
              <SelectContent>{groqModel && <SelectItem value={groqModel}>{groqModel}</SelectItem>}</SelectContent>
            </Select>
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingRow label="Theme" description="Switch between light and dark mode.">
            <ThemeSelect />
          </SettingRow>

          <SettingRow
            htmlFor="compact-mode"
            label="Compact mode"
            description="Tighter spacing in the chat view."
          >
            <Switch
              id="compact-mode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
            />
          </SettingRow>

          <SettingRow
            htmlFor="reduced-motion"
            label="Reduce motion"
            description="Turn off entrance animations, independent of your OS setting."
          >
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Developer">
          <SettingRow
            htmlFor="developer-mode"
            label="Developer mode"
            description="Show retrieval scores, timing, and model details alongside each answer."
          >
            <Switch
              id="developer-mode"
              checked={settings.developerMode}
              onCheckedChange={(checked) => updateSettings({ developerMode: checked })}
            />
          </SettingRow>
        </SettingsSection>

        <div className="flex justify-end border-t border-border pt-6">
          <Button variant="outline" size="sm" onClick={resetSettings}>
            Reset to defaults
          </Button>
        </div>
      </div>
    </main>
  );
}
