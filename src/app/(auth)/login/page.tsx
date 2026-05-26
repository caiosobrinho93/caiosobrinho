"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Loader2, ChevronRight, ArrowLeft, Gamepad2, Fingerprint } from "lucide-react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<"caio" | "giselle" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [isAuthenticatingBiometric, setIsAuthenticatingBiometric] = useState(false);

  useEffect(() => {
    setIsBiometricSupported(!!window.PublicKeyCredential);
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setHasPasskey(false);
      return;
    }

    const checkPasskeyStatus = async () => {
      try {
        const response = await fetch(`/api/auth/webauthn/status?username=${selectedUser}`);
        if (response.ok) {
          const result = await response.json();
          setHasPasskey(!!result.hasPasskey);
        }
      } catch (err) {
        console.error("Erro ao verificar status de passkey:", err);
      }
    };

    checkPasskeyStatus();
  }, [selectedUser]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("A senha de acesso é obrigatória.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, username: selectedUser }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Senha incorreta.");
      }

      // Limpa os stores locais para evitar vazamento de estado entre sessões Caio/Giselle
      useStatsStore.setState({ data: null, hasLoaded: false, isLoading: false, error: null });
      useDataStore.setState({
        bills: { data: [], hasLoaded: false, isLoading: false },
        receipts: { data: [], hasLoaded: false, isLoading: false },
        notes: { data: [], hasLoaded: false, isLoading: false },
        passwords: { data: [], hasLoaded: false, isLoading: false },
        videos: { data: [], hasLoaded: false, isLoading: false, lastQuery: "" },
        wallpapers: { data: [], hasLoaded: false, isLoading: false },
        software: { data: [], hasLoaded: false, isLoading: false },
        torrents: { data: [], hasLoaded: false, isLoading: false },
        filesCache: {},
        dev: { data: [], hasLoaded: false, isLoading: false }
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!selectedUser) return;
    setIsAuthenticatingBiometric(true);
    setError(null);

    try {
      // 1. Obter opções de login (challenge) do backend
      const optionsRes = await fetch("/api/auth/webauthn/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUser }),
      });

      const options = await optionsRes.json();

      if (!optionsRes.ok) {
        throw new Error(options.error || "Erro ao obter desafio de biometria.");
      }

      // 2. Chamar o navegador/dispositivo para autenticação
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const assertion = await startAuthentication({ optionsJSON: options });

      // 3. Enviar a asserção resultante para verificação no backend
      const verifyRes = await fetch("/api/auth/webauthn/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });

      const verifyResult = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyResult.error || "Falha na verificação da biometria.");
      }

      // 4. Sucesso! Limpar stores locais para evitar vazamento de estado
      useStatsStore.setState({ data: null, hasLoaded: false, isLoading: false, error: null });
      useDataStore.setState({
        bills: { data: [], hasLoaded: false, isLoading: false },
        receipts: { data: [], hasLoaded: false, isLoading: false },
        notes: { data: [], hasLoaded: false, isLoading: false },
        passwords: { data: [], hasLoaded: false, isLoading: false },
        videos: { data: [], hasLoaded: false, isLoading: false, lastQuery: "" },
        wallpapers: { data: [], hasLoaded: false, isLoading: false },
        software: { data: [], hasLoaded: false, isLoading: false },
        torrents: { data: [], hasLoaded: false, isLoading: false },
        filesCache: {},
        dev: { data: [], hasLoaded: false, isLoading: false }
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Erro na biometria:", err);
      if (err.name === "NotAllowedError") {
        setError("Autenticação biométrica cancelada ou não autorizada.");
      } else {
        setError(err.message || "Erro na autenticação por biometria.");
      }
    } finally {
      setIsAuthenticatingBiometric(false);
    }
  };

  const handleSelectUser = (user: "caio" | "giselle") => {
    setSelectedUser(user);
    setPassword("");
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0b0d0f] px-4 font-sans">
      {/* Background Gamer effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c5ff1a]/5 blur-[120px] pointer-events-none animate-pulse duration-5000" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#14181c] border border-border mb-3 shadow-[0_0_15px_rgba(197,255,26,0.15)]"
          >
            <Gamepad2 className="w-7 h-7 text-[#c5ff1a]" />
          </motion.div>
          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-extrabold tracking-widest font-display text-white"
          >
            NEXUS <span className="text-[#c5ff1a]">VAULT</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5 font-bold"
          >
            SISTEMA OPERACIONAL CO-OP VAULT v2.0
          </motion.p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-[#12161a]/85 backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            {!selectedUser ? (
              <motion.div
                key="select-player"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h2 className="text-sm font-bold uppercase tracking-widest text-center text-white/90">
                  SELECIONE SEU PLAYER
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* Card Caio */}
                  <button
                    onClick={() => handleSelectUser("caio")}
                    className="flex flex-col items-center justify-center p-6 bg-[#161b22]/50 border border-cyan-500/20 hover:border-cyan-400 rounded-2xl transition-all duration-300 group hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-cyan-955/40 border border-cyan-400/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative shrink-0">
                      <img src="/avatar-caio.png" className="w-full h-full object-cover" alt="Caio" />
                      <span className="absolute -bottom-1 px-1.5 py-0.5 bg-cyan-500 text-[8px] font-black rounded uppercase text-black leading-none font-sans">
                        P1
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white mt-4 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
                      Caio
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-wide">
                      Admin / Dev
                    </span>
                  </button>

                  {/* Card Giselle */}
                  <button
                    onClick={() => handleSelectUser("giselle")}
                    className="flex flex-col items-center justify-center p-6 bg-[#161b22]/50 border border-fuchsia-500/20 hover:border-fuchsia-400 rounded-2xl transition-all duration-300 group hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-fuchsia-955/40 border border-fuchsia-400/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative shrink-0">
                      <img src="/avatar-giselle.png" className="w-full h-full object-cover" alt="Giselle" />
                      <span className="absolute -bottom-1 px-1.5 py-0.5 bg-fuchsia-500 text-[8px] font-black rounded uppercase text-black leading-none font-sans">
                        P2
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white mt-4 group-hover:text-fuchsia-400 transition-colors uppercase tracking-wider">
                      Giselle
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-wide">
                      Co-op Player
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="enter-password"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border shrink-0 ${
                      selectedUser === "caio" 
                        ? "border-cyan-400 bg-cyan-950/20" 
                        : "border-fuchsia-400 bg-fuchsia-950/20"
                    }`}>
                      <img 
                        src={selectedUser === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                        className="w-full h-full object-cover" 
                        alt={selectedUser === "caio" ? "Caio" : "Giselle"} 
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                        PLAYER: {selectedUser === "caio" ? "Caio" : "Giselle"}
                      </h3>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                        {selectedUser === "caio" ? "PLAYER 1" : "PLAYER 2"}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold animate-pulse">
                    {error}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Senha de Desbloqueio
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoFocus
                        placeholder="Digite sua senha de acesso"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-muted/40 border border-border/80 focus:border-primary text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isAuthenticatingBiometric}
                    className={`relative w-full py-2.5 rounded-lg text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                      selectedUser === "caio" 
                        ? "bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/10" 
                        : "bg-fuchsia-400 hover:bg-fuchsia-300 shadow-fuchsia-400/10"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Autenticando sessão...
                      </>
                    ) : (
                      <>
                        Entrar no Cofre
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {isBiometricSupported && hasPasskey && (
                    <>
                      <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-border/10"></div>
                        <span className="px-3 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">OU</span>
                        <div className="flex-1 border-t border-border/10"></div>
                      </div>

                      <button
                        type="button"
                        disabled={isLoading || isAuthenticatingBiometric}
                        onClick={handleBiometricLogin}
                        className={`relative w-full py-2.5 rounded-lg text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                          selectedUser === "caio" 
                            ? "bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20" 
                            : "bg-fuchsia-500 hover:bg-fuchsia-400 shadow-fuchsia-500/20"
                        }`}
                      >
                        {isAuthenticatingBiometric ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Iniciando sensor...
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-3.5 h-3.5" />
                            Acessar via Biometria
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
