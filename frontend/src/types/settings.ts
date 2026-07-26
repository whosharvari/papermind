export interface AppSettings {
  topK: number;
  temperature: number;
  developerMode: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  topK: 5,
  temperature: 0.3,
  developerMode: false,
  compactMode: false,
  reducedMotion: false,
};

export const SETTINGS_STORAGE_KEY = "papermind:settings";
