"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Plus,
  Search,
  Star,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
  Loader2,
  PlusCircle,
  X,
  RefreshCw,
  FolderKey,
  Image as ImageIcon,
  Lock
} from "lucide-react";

interface PasswordItem {
  id: string;
  title: string;
  username: string | null;
  email: string | null;
  password: string;
  url: string | null;
  imageUrl: string | null;
  notes: string | null;
  category: string | null;
  tags: string | null;
  isFavorite: boolean;
}

function PasswordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<PasswordItem | null>(null);
  
  // Visibilidade de senhas e cópias
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados do formulário
  const [formTitle, setFormTitle] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCategory, setFormCategory] = useState("Geral");
  const [formTags, setFormTags] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do gerador
  const [genLength, setGenLength] = useState(16);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Buscar senhas
  const fetchPasswords = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/passwords");
      if (res.ok) {
        const data = await res.json();
        setPasswords(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  // Monitorar triggers da barra de pesquisa rápida global
  useEffect(() => {
    if (searchParams.get("generate") === "true") {
      handleGenerate();
      setIsGeneratorOpen(true);
      router.replace("/dashboard/passwords");
    }
  }, [searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPassword) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/passwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          username: formUsername,
          email: formEmail,
          password: formPassword,
          url: formUrl,
          imageUrl: formImageUrl,
          category: formCategory,
          tags: formTags,
          notes: formNotes,
        }),
      });

      if (res.ok) {
        setFormTitle("");
        setFormUsername("");
        setFormEmail("");
        setFormPassword("");
        setFormUrl("");
        setFormImageUrl("");
        setFormCategory("Geral");
        setFormTags("");
        setFormNotes("");
        setIsModalOpen(false);
        fetchPasswords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (item: PasswordItem) => {
    try {
      const res = await fetch(`/api/passwords/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !item.isFavorite }),
      });
      if (res.ok) {
        setPasswords((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, isFavorite: !p.isFavorite } : p))
        );
        // Atualiza a visualização caso esteja aberta
        if (selectedPassword && selectedPassword.id === item.id) {
          setSelectedPassword({ ...selectedPassword, isFavorite: !selectedPassword.isFavorite });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta credencial? Esta ação é irreversível.")) return;

    try {
      const res = await fetch(`/api/passwords/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPasswords((prev) => prev.filter((p) => p.id !== id));
        setSelectedPassword(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleGenerate = () => {
    let charset = "";
    if (genUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (genLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (genNumbers) charset += "0123456789";
    if (genSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) {
      setGeneratedPassword("");
      return;
    }

    let password = "";
    for (let i = 0; i < genLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setGeneratedPassword(password);
  };

  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { label: "Nenhuma", color: "bg-muted", width: "0%" };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 14) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { label: "Fraca", color: "bg-destructive", width: "33%" };
    if (score <= 4) return { label: "Média", color: "bg-amber", width: "66%" };
    return { label: "Forte", color: "bg-emerald", width: "100%" };
  };

  const filteredPasswords = passwords.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.username && p.username.toLowerCase().includes(search.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory =
      activeCategory === "Todos" || p.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ["Todos", "Trabalho", "Pessoal", "Social", "Desenvolvimento", "Geral"];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Key className="w-6 h-6 text-primary" />
            Chaveiro AES
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Armazene, gere e organize suas credenciais com criptografia local AES-256 de grau militar.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              handleGenerate();
              setIsGeneratorOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border text-white text-sm font-semibold rounded-xl hover:bg-muted/70 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            Gerador de Senha
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            Adicionar Senha
          </button>
        </div>
      </div>

      {/* Barra de Ferramentas / Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                activeCategory === cat
                  ? "bg-primary border-primary/20 text-white"
                  : "bg-card/40 border-border/80 text-muted-foreground hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por título ou usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card/40 border border-border/85 rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Grade de Cards Minimalistas (Apenas Capa e Título) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-card/60 rounded-2xl border border-border/80" />
          ))}
        </div>
      ) : filteredPasswords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPasswords.map((item) => {
            return (
              <motion.div
                key={item.id}
                onClick={() => setSelectedPassword(item)}
                className="group cursor-pointer bg-card/55 backdrop-blur-xl border border-border hover:border-primary/45 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Imagem de Capa ou Gradiente */}
                {item.imageUrl ? (
                  <div className="h-24 w-full relative bg-muted overflow-hidden flex items-center justify-center border-b border-border/50">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Se falhar a imagem externa, substitui por um ícone de lock
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-24 w-full bg-gradient-to-br from-rose-500/10 to-primary/10 flex items-center justify-center border-b border-border/50 relative">
                    <Lock className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                )}

                {/* Conteúdo do Card */}
                <div className="p-4 flex items-center justify-between gap-3 bg-card/45">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[9px] text-muted-foreground mt-0.5 block">
                      {item.category || "Geral"}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border/60 flex items-center justify-center shrink-0">
                    <Key className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/15 border border-dashed border-border rounded-2xl">
          <FolderKey className="w-10 h-10 text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-white">Chaveiro de Credenciais Vazio</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Comece a armazenar detalhes criptografados de suas contas e logins.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
          >
            Adicionar Primeira Senha
          </button>
        </div>
      )}

      {/* MODAL DE DETALHES DA CREDENCIAL */}
      <AnimatePresence>
        {selectedPassword && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPassword(null)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Topo do Modal com Imagem/Capa */}
              {selectedPassword.imageUrl ? (
                <div className="h-32 w-full relative bg-muted overflow-hidden flex items-center justify-center border-b border-border">
                  <img
                    src={selectedPassword.imageUrl}
                    alt={selectedPassword.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              ) : (
                <div className="h-20 w-full bg-gradient-to-br from-rose-500/10 to-primary/10 border-b border-border flex items-center justify-center" />
              )}

              {/* Botão de Fechar */}
              <button
                onClick={() => setSelectedPassword(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-card/65 border border-border hover:bg-muted text-muted-foreground hover:text-white cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-white">{selectedPassword.title}</h2>
                    {selectedPassword.url && (
                      <a
                        href={selectedPassword.url.startsWith("http") ? selectedPassword.url : `https://${selectedPassword.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5 font-medium"
                      >
                        {selectedPassword.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-muted rounded border border-border/80 text-muted-foreground font-bold uppercase tracking-wider">
                    {selectedPassword.category || "Geral"}
                  </span>
                </div>

                {/* Campos Criptografados */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                  {/* Usuário */}
                  {selectedPassword.username && (
                    <div className="flex justify-between items-center text-xs p-2.5 bg-muted/20 border border-border/40 rounded-xl">
                      <span className="text-muted-foreground">Usuário:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{selectedPassword.username}</span>
                        <button
                          onClick={() => handleCopy(`${selectedPassword.id}-user`, selectedPassword.username || "")}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-white rounded cursor-pointer transition-colors"
                          title="Copiar Usuário"
                        >
                          {copiedId === `${selectedPassword.id}-user` ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {selectedPassword.email && (
                    <div className="flex justify-between items-center text-xs p-2.5 bg-muted/20 border border-border/40 rounded-xl">
                      <span className="text-muted-foreground">E-mail:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{selectedPassword.email}</span>
                        <button
                          onClick={() => handleCopy(`${selectedPassword.id}-email`, selectedPassword.email || "")}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-white rounded cursor-pointer transition-colors"
                          title="Copiar E-mail"
                        >
                          {copiedId === `${selectedPassword.id}-email` ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Senha */}
                  <div className="flex justify-between items-center text-xs p-2.5 bg-muted/20 border border-border/40 rounded-xl">
                    <span className="text-muted-foreground">Senha:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono font-bold tracking-wider text-sm">
                        {visiblePasswords[selectedPassword.id] ? selectedPassword.password : "••••••••••••"}
                      </span>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() =>
                            setVisiblePasswords((prev) => ({ ...prev, [selectedPassword.id]: !prev[selectedPassword.id] }))
                          }
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-white rounded cursor-pointer transition-colors"
                          title={visiblePasswords[selectedPassword.id] ? "Ocultar Senha" : "Mostrar Senha"}
                        >
                          {visiblePasswords[selectedPassword.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(`${selectedPassword.id}-pass`, selectedPassword.password)}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-white rounded cursor-pointer transition-colors"
                          title="Copiar Senha"
                        >
                          {copiedId === `${selectedPassword.id}-pass` ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Força da Senha (Entropia) */}
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Força da Senha:</span>
                    <span className={`font-bold uppercase text-[10px] ${
                      checkPasswordStrength(selectedPassword.password).label === "Forte"
                        ? "text-emerald"
                        : checkPasswordStrength(selectedPassword.password).label === "Média"
                        ? "text-amber"
                        : "text-destructive"
                    }`}>
                      {checkPasswordStrength(selectedPassword.password).label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${checkPasswordStrength(selectedPassword.password).color}`}
                      style={{ width: checkPasswordStrength(selectedPassword.password).width }}
                    />
                  </div>
                </div>

                {/* Anotações */}
                {selectedPassword.notes && (
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Anotações</span>
                    <p className="text-xs text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{selectedPassword.notes}</p>
                  </div>
                )}

                {/* Ações da Gaveta */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleDelete(selectedPassword.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Credencial
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFavorite(selectedPassword)}
                      className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        selectedPassword.isFavorite
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-border/80 text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${selectedPassword.isFavorite ? "fill-current" : ""}`} />
                      {selectedPassword.isFavorite ? "Favoritado" : "Favoritar"}
                    </button>
                    <button
                      onClick={() => setSelectedPassword(null)}
                      className="px-4 py-2 border border-border text-muted-foreground hover:text-white hover:bg-muted/40 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CRIAÇÃO DE SENHA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Nova Credencial
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Nome do Serviço / Site *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: GitHub Pessoal"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: caiosobrinho"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: caio@exemplo.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="••••••••"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
                        let pass = "";
                        for (let i = 0; i < 16; i++) {
                          pass += charset.charAt(Math.floor(Math.random() * charset.length));
                        }
                        setFormPassword(pass);
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      title="Gerar senha forte"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      URL do Site
                    </label>
                    <input
                      type="text"
                      placeholder="https://github.com"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      Categoria
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white text-xs focus:outline-none focus:ring-0 transition-all cursor-pointer"
                    >
                      {categories.slice(1).map((cat) => (
                        <option key={cat} value={cat} className="bg-card">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    URL da Imagem / Logo (Capa)
                  </label>
                  <input
                    type="text"
                    placeholder="https://exemplo.com/logo.png"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Anotações
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Anotações ou informações extras..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs border border-border text-muted-foreground hover:text-white cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs bg-primary hover:bg-primary/95 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Criptografando...
                      </>
                    ) : (
                      "Salvar Credencial"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GERADOR DE SENHA DETALHADO */}
      <AnimatePresence>
        {isGeneratorOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGeneratorOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Gerador de Chaves
                </h2>
                <button
                  onClick={() => setIsGeneratorOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between relative overflow-hidden">
                  <span className="font-mono text-xs text-white break-all pr-12 select-all">
                    {generatedPassword || "Carregando..."}
                  </span>
                  
                  <div className="flex gap-1 shrink-0 absolute right-2 bg-gradient-to-l from-card pl-4">
                    <button
                      onClick={handleGenerate}
                      className="p-1 hover:text-primary text-muted-foreground cursor-pointer transition-colors"
                      title="Gerar Novamente"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy("gen", generatedPassword)}
                      className="p-1 hover:text-primary text-muted-foreground cursor-pointer transition-colors"
                      title="Copiar Senha"
                    >
                      {copiedId === "gen" ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Força da Senha:</span>
                  <span className={`font-bold ${
                    checkPasswordStrength(generatedPassword).label === "Forte"
                      ? "text-emerald"
                      : checkPasswordStrength(generatedPassword).label === "Média"
                      ? "text-amber"
                      : "text-destructive"
                  }`}>
                    {checkPasswordStrength(generatedPassword).label}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>Comprimento</span>
                    <span className="text-white">{genLength} caracteres</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={genLength}
                    onChange={(e) => setGenLength(parseInt(e.target.value))}
                    className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer appearance-none"
                  />
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={genUppercase}
                      onChange={(e) => setGenUppercase(e.target.checked)}
                      className="rounded border-border bg-muted text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer accent-primary"
                    />
                    <span className="text-white/80">Maiúsculas (A-Z)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={genLowercase}
                      onChange={(e) => setGenLowercase(e.target.checked)}
                      className="rounded border-border bg-muted text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer accent-primary"
                    />
                    <span className="text-white/80">Minúsculas (a-z)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={genNumbers}
                      onChange={(e) => setGenNumbers(e.target.checked)}
                      className="rounded border-border bg-muted text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer accent-primary"
                    />
                    <span className="text-white/80">Números (0-9)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={genSymbols}
                      onChange={(e) => setGenSymbols(e.target.checked)}
                      className="rounded border-border bg-muted text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer accent-primary"
                    />
                    <span className="text-white/80">Símbolos (!@#$)</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      if (generatedPassword) {
                        setFormPassword(generatedPassword);
                        setIsModalOpen(true);
                      }
                      setIsGeneratorOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-center cursor-pointer shadow-lg shadow-primary/10"
                  >
                    Usar Senha no Cadastro
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PasswordsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Carregando chaveiro...</div>}>
      <PasswordsContent />
    </Suspense>
  );
}
