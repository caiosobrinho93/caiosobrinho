"use client";

import React, { useEffect, useState } from "react";
import { Newspaper, ExternalLink, RefreshCw, Star } from "lucide-react";
import { playClickSound, playHoverSound } from "./CyberAudio";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  id: number | string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  user: {
    name: string;
  };
}

const FEED_SOURCES = {
  googlenews: {
    label: "Google News BR",
    type: "api",
  },
  g1: {
    label: "G1 - Brasil",
    type: "api",
  },
  techtudo: {
    label: "TechTudo",
    type: "api",
  },
  ign: {
    label: "IGN Jogos",
    type: "api",
  },
  ge: {
    label: "GE Esportes",
    type: "api",
  },
};

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "Next.js 16 Released: Turbopack is Now Fully Stable",
    description: "The new compiler is up to 10x faster than Webpack, bringing instant hot module reloading and build optimizations.",
    url: "https://nextjs.org/blog",
    published_at: new Date().toISOString(),
    user: { name: "NextJS Team" }
  },
  {
    id: 2,
    title: "Web Audio API: The Future of Browser Synthesizers",
    description: "How developers are building low-latency sound synthesis and high-performance visualizers directly in the browser.",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API",
    published_at: new Date().toISOString(),
    user: { name: "MDN Web Docs" }
  }
];

interface RssTechWidgetProps {
  idx: number;
  renderHeader: (title: string, icon: React.ReactNode, idx: number, extraActions?: React.ReactNode) => React.ReactNode;
  itemVariants: any;
}

export default function RssTechWidget({ idx, renderHeader, itemVariants }: RssTechWidgetProps) {
  const [feedSource, setFeedSource] = useState<keyof typeof FEED_SOURCES>("googlenews");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subTab, setSubTab] = useState<"feed" | "favorites">("feed");
  const [favorites, setFavorites] = useState<Article[]>([]);

  // Load favorites from local storage
  useEffect(() => {
    const stored = localStorage.getItem("caiosobrinho-website:rss-favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading RSS favorites:", e);
      }
    }
  }, []);

  const fetchNews = async (currentSource: keyof typeof FEED_SOURCES) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rss?source=${currentSource}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setArticles(data.items);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch news feed, loading fallback:", e);
    }
    setArticles(FALLBACK_ARTICLES);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNews(feedSource);
  }, [feedSource]);

  const toggleFavorite = (art: Article) => {
    setFavorites((prev) => {
      let updated;
      if (prev.some((p) => p.url === art.url)) {
        updated = prev.filter((p) => p.url !== art.url);
      } else {
        updated = [...prev, art];
      }
      localStorage.setItem("caiosobrinho-website:rss-favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const displayedArticles = subTab === "feed" ? articles : favorites;

  return (
    <div className="glass-panel min-w-[280px] lg:col-span-1 block">
      {renderHeader("Feed de Notícias", <Newspaper className="w-3.5 h-3.5 text-primary" />, idx, (
        <div className="flex items-center gap-1.5">
          {subTab === "feed" ? (
            <>
              <select
                value={feedSource}
                onChange={(e) => {
                  playClickSound();
                  setFeedSource(e.target.value as keyof typeof FEED_SOURCES);
                }}
                onMouseEnter={playHoverSound}
                className="bg-black/40 border border-white/10 text-[10px] font-bold text-white rounded-lg px-2 py-1 outline-none focus:border-primary/50 cursor-pointer transition-colors max-w-[120px] truncate"
              >
                {Object.entries(FEED_SOURCES).map(([key, source]) => (
                  <option key={key} value={key} className="bg-card text-foreground">
                    {source.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => { playClickSound(); fetchNews(feedSource); }}
                onMouseEnter={playHoverSound}
                className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white/60 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                title="Recarregar Feed"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </>
          ) : (
            <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">
              {favorites.length} salvos
            </span>
          )}
        </div>
      ))}

      {/* Sub-abas de Navegação */}
      <div className="flex bg-black/40 border border-white/5 rounded-lg p-0.5 mb-3.5 mx-[15px]">
        <button
          onClick={() => { playClickSound(); setSubTab("feed"); }}
          onMouseEnter={playHoverSound}
          className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all text-center cursor-pointer ${
            subTab === "feed"
              ? "bg-white/[0.08] border border-white/10 text-primary shadow-[0_0_10px_rgba(255,255,255,0.02)]"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          Feed Global
        </button>
        <button
          onClick={() => { playClickSound(); setSubTab("favorites"); }}
          onMouseEnter={playHoverSound}
          className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
            subTab === "favorites"
              ? "bg-white/[0.08] border border-white/10 text-primary shadow-[0_0_10px_rgba(255,255,255,0.02)]"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Star className={`w-2.5 h-2.5 ${subTab === "favorites" ? "fill-primary" : ""}`} />
          Favoritos ({favorites.length})
        </button>
      </div>

      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 mt-2 px-[15px] pb-[15px]">
        {subTab === "feed" && isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-border/30 rounded-xl bg-card/20 animate-pulse space-y-2">
              <div className="h-3 w-1/4 bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-2 w-1/2 bg-white/5 rounded" />
            </div>
          ))
        ) : displayedArticles.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-white/5 rounded-xl bg-black/10">
            <Newspaper className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
              {subTab === "feed" ? "Nenhuma notícia encontrada." : "Sua lista de favoritos está vazia."}
            </p>
            {subTab === "favorites" && (
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Marque com uma estrela as notícias interessantes para lê-las depois.
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedArticles.map((art) => {
              const isFav = favorites.some((p) => p.url === art.url);
              return (
                <motion.div
                  key={art.url}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playClickSound}
                    onMouseEnter={playHoverSound}
                    className="block p-4 border border-white/10 rounded-xl bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04] transition-all group relative overflow-hidden shadow-lg"
                  >
                    {/* Efeito luminoso de fundo no hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />
                    
                    <div className="flex items-start justify-between gap-3 pr-8">
                      <span className="text-[13px] font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {art.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-white/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    </div>
                    
                    {art.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed font-sans">
                        {art.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[9px] text-white/40 font-mono mt-3 pt-2 border-t border-white/[0.04]">
                      <span className="font-extrabold uppercase text-[8px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                        {art.user?.name || "Feed"}
                      </span>
                      <span>
                        {new Date(art.published_at).toLocaleDateString("pt-BR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    {/* Botão de Favoritar Absolute */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playClickSound();
                        toggleFavorite(art);
                      }}
                      onMouseEnter={playHoverSound}
                      className={`absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 border transition-all z-20 ${
                        isFav 
                          ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/5 shadow-[0_0_10px_rgba(234,179,8,0.15)]" 
                          : "text-white/30 border-white/5 hover:text-yellow-400 hover:border-yellow-400/20 hover:bg-yellow-400/5"
                      }`}
                      title={isFav ? "Remover dos favoritos" : "Salvar nos favoritos"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? "fill-yellow-400" : ""}`} />
                    </button>
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
