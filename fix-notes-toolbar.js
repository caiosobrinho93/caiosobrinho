const fs = require('fs');

// ── 1. Fix Notes page: move save status to inside toolbar row ────────────────
const notesPath = 'src/app/(dashboard)/dashboard/notes/page.tsx';
let notes = fs.readFileSync(notesPath, 'utf8');

// The issue: write/preview toggle + save status + fav + focus + delete are all in one 56px header row
// Solution: Put save status INSIDE the write/preview toggle div, and move fav/focus/delete to a separate compact row below
// Find the editor header pattern and replace it

const oldEditorHeader = `            {/* Cabeçalho do Editor */}
            <div className="h-14 border-b border-border px-4 md:px-5 flex items-center justify-between shrink-0 bg-muted/10 gap-5">
              <div className="flex items-center gap-4 min-w-0">
                {!isFocusMode && (
                  <button
                    type="button"
                    onClick={() => setShowSidebarOnMobile(true)}
                    className="md:hidden p-4 rounded-sm border border-border text-muted-foreground hover:text-white shrink-0 animate-pulse"
                    title="Voltar para lista"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Write/Preview toggle tab */}
                <div className="flex bg-muted/40 border border-border p-0.5 rounded-sm shrink-0">
                  <button
                    onClick={() => setActiveTab("write")}
                    className={\`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-4 cursor-pointer transition-colors \${
                      activeTab === "write" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                    }\`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={\`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-4 cursor-pointer transition-colors \${
                      activeTab === "preview" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                    }\`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </button>
                </div>
              </div>

              {/* Status e Ações */}
              <div className="flex items-center gap-5 shrink-0">
                <span className="text-sm text-muted-foreground font-medium flex items-center gap-2 bg-muted/40 border border-border/80 px-2 py-1 rounded-sm shrink-0">
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
                      <span className="hidden sm:inline">Salvando...</span>
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald shrink-0" />
                      <span className="hidden sm:inline">Salvo</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span className="hidden sm:inline">Não salvo</span>
                    </>
                  )}
                </span>

                <button
                  onClick={() => handleToggleFavorite(selectedNote)}
                  className={\`p-5 rounded-sm border cursor-pointer hover:bg-muted transition-colors \${
                    selectedNote.isFavorite
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-white"
                  }\`}
                >
                  <Star className={\`w-4 h-4 \${selectedNote.isFavorite ? "fill-current" : ""}\`} />
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={\`p-5 rounded-sm border cursor-pointer hover:bg-muted transition-colors \${isFocusMode ? "border-primary/20 bg-primary/10 text-primary shadow-[0_0_8px_rgba(197,254,0,0.2)]" : "border-border text-muted-foreground hover:text-white"}\`}
                  title={isFocusMode ? "Sair do Modo Foco" : "Modo Foco Fullscreen"}
                >
                  {isFocusMode ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="p-5 rounded-sm border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>`;

const newEditorHeader = `            {/* Cabeçalho do Editor — ROW 1: Nav + Write/Preview toggle */}
            <div className="h-11 border-b border-border px-3 flex items-center gap-2 shrink-0 bg-muted/10">
              {!isFocusMode && (
                <button
                  type="button"
                  onClick={() => setShowSidebarOnMobile(true)}
                  className="md:hidden p-1.5 rounded-sm border border-border text-muted-foreground hover:text-white shrink-0"
                  title="Voltar para lista"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Write/Preview toggle */}
              <div className="flex bg-muted/40 border border-border p-0.5 rounded-sm shrink-0">
                <button
                  onClick={() => setActiveTab("write")}
                  className={\`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors \${
                    activeTab === "write" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  }\`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={\`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors \${
                    activeTab === "preview" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  }\`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Prévia</span>
                </button>
              </div>

              {/* Save status — compact, no text label on mobile */}
              <span className="flex items-center gap-1.5 bg-muted/40 border border-border/80 px-2 py-1 rounded-sm shrink-0 ml-auto">
                {saveStatus === "saving" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : saveStatus === "saved" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {saveStatus === "saving" ? "Salvando..." : saveStatus === "saved" ? "Salvo" : "Não salvo"}
                </span>
              </span>
            </div>

            {/* Cabeçalho do Editor — ROW 2: Action buttons */}
            <div className="h-10 border-b border-border/60 px-3 flex items-center gap-1.5 shrink-0 bg-muted/5">
              <button
                onClick={() => handleToggleFavorite(selectedNote)}
                className={\`p-1.5 rounded-sm border cursor-pointer transition-colors \${
                  selectedNote.isFavorite
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-white hover:bg-muted"
                }\`}
                title="Favoritar"
              >
                <Star className={\`w-3.5 h-3.5 \${selectedNote.isFavorite ? "fill-current" : ""}\`} />
              </button>
              
              <button
                type="button"
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={\`p-1.5 rounded-sm border cursor-pointer transition-colors \${
                  isFocusMode
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-white hover:bg-muted"
                }\`}
                title={isFocusMode ? "Sair do Modo Foco" : "Modo Foco"}
              >
                {isFocusMode ? <Minimize className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleDelete(selectedNote.id)}
                className="p-1.5 rounded-sm border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 cursor-pointer transition-colors ml-auto"
                title="Deletar nota"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>`;

if (notes.includes('{/* Cabeçalho do Editor */}')) {
  notes = notes.replace(oldEditorHeader, newEditorHeader);
  fs.writeFileSync(notesPath, notes, 'utf8');
  console.log('✅ Notes editor header fixed');
} else {
  console.log('⚠️  Notes editor header pattern not found - manual fix needed');
}

// ── 2. Remove NeonParticles from DashboardShell ──────────────────────────────
const shellPath = 'src/components/DashboardShell.tsx';
let shell = fs.readFileSync(shellPath, 'utf8');
// Remove NeonParticles import if present
shell = shell.replace(/import NeonParticles from ['"]\.\/NeonParticles['"];\n?/g, '');
// Remove <NeonParticles /> usage
shell = shell.replace(/<NeonParticles\s*\/>\n?/g, '');
fs.writeFileSync(shellPath, shell, 'utf8');
console.log('✅ NeonParticles removed from DashboardShell');

// ── 3. Remove NeonParticles file ────────────────────────────────────────────
const particlesFile = 'src/components/NeonParticles.tsx';
if (fs.existsSync(particlesFile)) {
  fs.unlinkSync(particlesFile);
  console.log('✅ NeonParticles.tsx file deleted');
} else {
  console.log('ℹ️  NeonParticles.tsx already gone');
}

console.log('\nAll done!');
