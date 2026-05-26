import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomTheme {
  bgGradient: string; // ex: 'bg-preset-synth' ou gradiente customizado
  bgImage: string; // URL de imagem personalizada do cofre
  neonIntensity: "none" | "low" | "medium" | "high";
  animationSpeed: "disabled" | "slow" | "normal" | "fast";
  accentColor: "violet" | "cyan" | "emerald" | "rose" | "amber" | "carbon" | "limon";
  gridStyle: "none" | "fine" | "lines" | "dots";
}

export type ThemePreset = 
  | "synth-violet" 
  | "cyber-cyan" 
  | "matrix-green" 
  | "sunset-horizon" 
  | "tokyo-neon" 
  | "carbon-stealth" 
  | "cyber-limon"
  | "custom";

export interface SettingsState {
  accentColor: "violet" | "cyan" | "emerald" | "rose" | "amber" | "carbon" | "limon";
  density: "compact" | "normal" | "spacious";
  animationsEnabled: boolean;
  themePreset: ThemePreset;
  customTheme: CustomTheme;
  setAccentColor: (color: "violet" | "cyan" | "emerald" | "rose" | "amber" | "carbon" | "limon") => void;
  setDensity: (density: "compact" | "normal" | "spacious") => void;
  toggleAnimations: () => void;
  setThemePreset: (preset: ThemePreset) => void;
  updateCustomTheme: (theme: Partial<CustomTheme>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accentColor: "violet",
      density: "normal",
      animationsEnabled: true,
      themePreset: "synth-violet",
      customTheme: {
        bgGradient: "bg-preset-synth",
        bgImage: "",
        neonIntensity: "medium",
        animationSpeed: "normal",
        accentColor: "violet",
        gridStyle: "fine",
      },
      setAccentColor: (color) => set({ accentColor: color }),
      setDensity: (density) => set({ density: density }),
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      setThemePreset: (preset) => set((state) => {
        let newAccent: "violet" | "cyan" | "emerald" | "rose" | "amber" | "carbon" | "limon" = state.accentColor;
        if (preset === "synth-violet") newAccent = "violet";
        else if (preset === "cyber-cyan") newAccent = "cyan";
        else if (preset === "matrix-green") newAccent = "emerald";
        else if (preset === "sunset-horizon") newAccent = "amber";
        else if (preset === "tokyo-neon") newAccent = "rose";
        else if (preset === "carbon-stealth") newAccent = "carbon";
        else if (preset === "cyber-limon") newAccent = "limon";
        
        return { themePreset: preset, accentColor: newAccent };
      }),
      updateCustomTheme: (theme) => set((state) => {
        const updated = { ...state.customTheme, ...theme };
        return {
          customTheme: updated,
          ...(theme.accentColor ? { accentColor: theme.accentColor } : {})
        };
      }),
    }),
    {
      name: "nexus-settings-v2", // Nome alterado para evitar conflito com dados legados
    }
  )
);
