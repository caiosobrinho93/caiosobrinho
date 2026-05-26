"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  Settings,
  Palette,
  Layout,
  Download,
  Upload,
  Trash2,
  Check,
  Loader2,
  Sparkles,
  Info,
  Database
} from "lucide-react";

export default function SettingsPage() {
  const {
    accentColor,
    density,
    animationsEnabled,
    themePreset,
    customTheme,
    setAccentColor,
    setDensity,
    toggleAnimations,
    setThemePreset,
    updateCustomTheme,
  } = useSettingsStore();

  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted/30 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-muted/20 rounded-lg mt-2 animate-pulse" />
        </div>
        <div className="bg-card/55 border border-border rounded-2xl p-5 h-64 animate-pulse" />
      </div>
    );
  }

  const colors: Array<"violet" | "cyan" | "emerald" | "rose" | "amber" | "carbon" | "limon"> = [
    "violet",
    "cyan",
    "emerald",
    "rose",
    "amber",
    "carbon",
    "limon",
  ];

  const colorLabels = {
    violet: "Synth Violet",
    cyan: "Cyber Cyan",
    emerald: "Matrix Green",
    rose: "Neon Rose",
    amber: "Amber Glow",
    carbon: "Carbon Stealth",
    limon: "Cyber Limon",
  };

  const colorHex = {
    violet: "bg-[#7c3aed]",
    cyan: "bg-[#06b6d4]",
    emerald: "bg-[#10b981]",
    rose: "bg-[#f43f5e]",
    amber: "bg-[#f59e0b]",
    carbon: "bg-[#52525b]",
    limon: "bg-[#a3e635]",
  };

  const themePresets = [
    {
      id: "synth-violet" as const,
      name: "Synth Violet",
      description: "Vibe Retrowave clássica em roxo vibrante e tons profundos.",
      bgPreview: "from-[#1e1145] to-[#0b0713]",
      accentHex: "bg-[#7c3aed]",
      glowColor: "shadow-[#7c3aed]/10 border-[#7c3aed]/30",
    },
    {
      id: "cyber-cyan" as const,
      name: "Cyber Cyan",
      description: "Estética cyber ciano e preto-profundo com brilhos intensos.",
      bgPreview: "from-[#031d26] to-[#03070b]",
      accentHex: "bg-[#06b6d4]",
      glowColor: "shadow-[#06b6d4]/10 border-[#06b6d4]/30",
    },
    {
      id: "matrix-green" as const,
      name: "Matrix Green",
      description: "Design clássico do terminal verde digital com grade pontilhada.",
      bgPreview: "from-[#021f10] to-[#020503]",
      accentHex: "bg-[#10b981]",
      glowColor: "shadow-[#10b981]/10 border-[#10b981]/30",
    },
    {
      id: "sunset-horizon" as const,
      name: "Sunset Horizon",
      description: "Tons de pôr do sol em âmbar e rosa neon com glow suave.",
      bgPreview: "from-[#2b160a] to-[#0a0604]",
      accentHex: "bg-[#f59e0b]",
      glowColor: "shadow-[#f59e0b]/10 border-[#f59e0b]/30",
    },
    {
      id: "tokyo-neon" as const,
      name: "Tokyo Neon",
      description: "Vibração noturna de Tóquio, rosa vibrante e roxo neon.",
      bgPreview: "from-[#280421] to-[#080308]",
      accentHex: "bg-[#f43f5e]",
      glowColor: "shadow-[#f43f5e]/10 border-[#f43f5e]/30",
    },
    {
      id: "carbon-stealth" as const,
      name: "Carbon Stealth",
      description: "Estilo minimalista e discreto em tons de cinza sem luzes neon.",
      bgPreview: "from-[#1c1c1e] to-[#070708]",
      accentHex: "bg-[#52525b]",
      glowColor: "shadow-[#52525b]/10 border-zinc-800",
    },
    {
      id: "cyber-limon" as const,
      name: "Cyber Limon",
      description: "Visual eSports de luxo em verde limão neon e roxo profundo.",
      bgPreview: "from-[#0a140a] via-[#050805] to-[#0b0713]",
      accentHex: "bg-[#a3e635]",
      glowColor: "shadow-[#a3e635]/15 border-[#a3e635]/40",
    },
    {
      id: "custom" as const,
      name: "Tema Customizado",
      description: "Ajuste e crie o seu próprio layout cyber dinâmico.",
      bgPreview: "from-[#09090b] via-[#1c1917] to-[#09090b]",
      accentHex: "bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]",
      glowColor: "shadow-primary/10 border-primary/30",
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/settings/backup");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nexus-vault-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Restaurar este backup irá SOBRESCREVER todos os dados atuais do cofre. Deseja continuar?")) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          
          if (!parsed.data) {
            alert("Estrutura do arquivo de backup inválida.");
            setIsImporting(false);
            return;
          }

          const res = await fetch("/api/settings/backup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: parsed.data }),
          });

          if (res.ok) {
            alert("Banco de dados restaurado com sucesso! Recarregando cofre...");
            window.location.reload();
          } else {
            alert("Falha na sincronização do banco de dados.");
          }
        } catch (err) {
          alert("Erro ao ler o arquivo JSON.");
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      setIsImporting(false);
    }
  };

  const handleWipeData = async () => {
    if (!confirm("AVISO CRÍTICO: Isso apagará PERMANENTEMENTE todas as credenciais, documentos, mídias e arquivos do seu cofre local! Tem certeza absoluta?")) return;

    setIsWiping(true);
    try {
      const res = await fetch("/api/settings/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: {
          notes: [], passwords: [], videos: [], wallpapers: [], software: [], torrents: [], folders: [], files: []
        } }),
      });

      if (res.ok) {
        alert("Nexus Vault redefinido com sucesso! Recarregando...");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-primary" />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure a aparência do painel, cores de realce e gerencie seus backups locais.
        </p>
      </div>

      {/* 1. Visual e Temas do Painel */}
      <div className="bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 space-y-6">
        <div className="border-b border-border/60 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Temas do Dashboard
          </h2>
          <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md font-bold uppercase">
            {themePreset === "custom" ? "Customizado" : "Preset Ativo"}
          </span>
        </div>

        {/* Grade de Presets Rápidos */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground block">Selecione um Preset de Luxo</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {themePresets.map((preset) => {
              const isSelected = themePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setThemePreset(preset.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2.5 transition-all cursor-pointer group relative overflow-hidden ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.01]"
                      : "border-border bg-muted/10 hover:bg-muted/20 hover:border-white/10"
                  }`}
                >
                  {/* Preview de gradiente e cor */}
                  <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${preset.bgPreview} border border-white/5 flex items-center justify-center shadow-inner relative`}>
                    <div className={`w-4.5 h-4.5 rounded-full ${preset.accentHex} border border-white/20 shadow-md ${preset.glowColor} shadow-lg`} />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white border border-white/10">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-primary transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 block">
                      {preset.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* EDITOR DE TEMA CUSTOMIZADO (Condicional) */}
        {themePreset === "custom" && (
          <div className="p-4 bg-muted/20 border border-border/80 rounded-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ajustes Finos do Tema Customizado</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Coluna 1: Cor Realce & Grid */}
              <div className="space-y-4">
                {/* Cor de Realce */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cor de Destaque (Accent)</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateCustomTheme({ accentColor: color })}
                        className={`w-8 h-8 rounded-full ${colorHex[color]} border-2 flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                          customTheme.accentColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80"
                        }`}
                      >
                        {customTheme.accentColor === color && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estilo do Grid */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Padrão da Grade Cyber</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "fine", name: "Grade Fina" },
                      { id: "lines", name: "Linhas Horizontais" },
                      { id: "dots", name: "Pontos Cyber" },
                      { id: "none", name: "Sem Grade" }
                    ].map((grid) => (
                      <button
                        key={grid.id}
                        type="button"
                        onClick={() => updateCustomTheme({ gridStyle: grid.id as any })}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          customTheme.gridStyle === grid.id
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted/40 text-muted-foreground border-transparent hover:text-white"
                        }`}
                      >
                        {grid.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coluna 2: Neon & Animação */}
              <div className="space-y-4">
                {/* Intensidade Neon */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Intensidade do Brilho Neon</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "none", name: "Desativado" },
                      { id: "low", name: "Suave" },
                      { id: "medium", name: "Média" },
                      { id: "high", name: "Intensa" }
                    ].map((intensity) => (
                      <button
                        key={intensity.id}
                        type="button"
                        onClick={() => updateCustomTheme({ neonIntensity: intensity.id as any })}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          customTheme.neonIntensity === intensity.id
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted/40 text-muted-foreground border-transparent hover:text-white"
                        }`}
                      >
                        {intensity.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Velocidade de Animação */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Velocidade de Pulsar/Glow</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "disabled", name: "Estática" },
                      { id: "slow", name: "Lenta" },
                      { id: "normal", name: "Normal" },
                      { id: "fast", name: "Rápida" }
                    ].map((speed) => (
                      <button
                        key={speed.id}
                        type="button"
                        onClick={() => updateCustomTheme({ animationSpeed: speed.id as any })}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          customTheme.animationSpeed === speed.id
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted/40 text-muted-foreground border-transparent hover:text-white"
                        }`}
                      >
                        {speed.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Estilo do Fundo (Gradiente vs Imagem) */}
            <div className="space-y-3.5 pt-2 border-t border-border/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seletor de Gradiente */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Gradiente Cyber de Fundo</label>
                  <select
                    value={customTheme.bgGradient}
                    disabled={!!customTheme.bgImage}
                    onChange={(e) => updateCustomTheme({ bgGradient: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-white outline-none cursor-pointer focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="bg-preset-synth">Synthwave Gradient (Roxo/Rosa)</option>
                    <option value="bg-preset-cyber">Deep Ocean Grid (Ciano/Preto)</option>
                    <option value="bg-preset-matrix">Terminal Matrix (Verde/Preto)</option>
                    <option value="bg-preset-sunset">Amber Sunset (Laranja/Rosa)</option>
                    <option value="bg-preset-tokyo">Tokyo Neon Night (Rosa/Violeta)</option>
                    <option value="bg-preset-carbon">Carbon Stealth (Cinza Carbono)</option>
                    <option value="bg-preset-limon">Cyber Limon (Preto/Limon)</option>
                  </select>
                </div>

                {/* Imagem de Fundo (Wallpaper) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Papel de Parede Físico (URL)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: /uploads/meu-wallpaper.png ou URL"
                      value={customTheme.bgImage}
                      onChange={(e) => updateCustomTheme({ bgImage: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-white outline-none placeholder:text-muted-foreground/60 pr-10"
                    />
                    {customTheme.bgImage && (
                      <button
                        type="button"
                        onClick={() => updateCustomTheme({ bgImage: "" })}
                        className="absolute inset-y-0 right-0 px-2.5 flex items-center text-muted-foreground hover:text-white text-xs"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {customTheme.bgImage && (
                <p className="text-[10px] text-amber/80 bg-amber/5 border border-amber/15 p-2 rounded-xl">
                  Nota: Um papel de parede físico ativo substituirá o gradiente de fundo padrão do dashboard.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Densidade e Outros Ajustes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-border/60">
          {/* Densidade de Espaçamento */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-muted-foreground block">Densidade do Layout</label>
            <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
              {(["compact", "normal", "spacious"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    density === d ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {d === "compact" ? "Compacto" : d === "normal" ? "Padrão" : "Espaçoso"}
                </button>
              ))}
            </div>
          </div>

          {/* Micro-interações Switch */}
          <div className="space-y-2.5 flex flex-col justify-between">
            <label className="text-xs font-semibold text-muted-foreground">Animações Gerais</label>
            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border rounded-xl h-10">
              <span className="text-xs font-semibold text-white/95">Transições e micro-interações</span>
              <button
                onClick={toggleAnimations}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  animationsEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    animationsEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Backup e Banco de Dados */}
      <div className="bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-3">
          <Database className="w-4 h-4 text-primary" />
          Operações de Banco de Dados
        </h2>

        <div className="p-3.5 bg-muted/20 border border-border/80 rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-normal">
            O banco de dados do Nexus Vault reside inteiramente no seu sistema local SQLite. Exporte backups periodicamente para garantir a segurança dos seus dados em migrações ou reconfigurações do sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Exportar */}
          <div className="p-4 bg-muted/10 border border-border rounded-xl flex flex-col justify-between h-36">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Exportar Dados</h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal">Baixe um arquivo JSON descriptografado contendo todos os registros de senhas, notas, torrents, softwares e dados cadastrados.</p>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 w-full py-2 bg-muted hover:bg-muted/70 text-white text-xs font-semibold rounded-lg border border-border transition-colors cursor-pointer font-bold"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Salvar Backup JSON
            </button>
          </div>

          {/* Importar */}
          <div className="p-4 bg-muted/10 border border-border rounded-xl flex flex-col justify-between h-36">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Restaurar Banco</h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal">Selecione um arquivo de backup do Nexus (.json) previamente baixado para restaurar todas as tabelas locais do banco.</p>
            </div>
            <label className="flex items-center justify-center gap-2 w-full py-2 bg-muted hover:bg-muted/70 text-white text-xs font-semibold rounded-lg border border-border transition-colors cursor-pointer font-bold">
              {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Selecionar Backup
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Zona de Perigo */}
      <div className="bg-card/55 backdrop-blur-xl border border-destructive/20 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-destructive uppercase tracking-wider flex items-center gap-2 border-b border-destructive/10 pb-3">
          <Trash2 className="w-4 h-4 text-destructive" />
          Zona de Perigo
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Destruir Dados do Cofre</h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
              Limpe permanentemente todas as senhas, notas textuais, catálogos de softwares e índices locais do banco. Esta ação é irreversível.
            </p>
          </div>
          <button
            onClick={handleWipeData}
            disabled={isWiping}
            className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-lg shadow-destructive/10"
          >
            {isWiping ? "Limpando Banco..." : "Apagar Tudo"}
          </button>
        </div>
      </div>
    </div>
  );
}
