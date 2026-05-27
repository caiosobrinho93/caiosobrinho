"use client";

import React, { useEffect, useState } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { playClickSound, playHoverSound } from "./CyberAudio";
import { motion } from "framer-motion";

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
  activeMobileTab: string;
}

export default function RssTechWidget({ idx, renderHeader, itemVariants, activeMobileTab }: RssTechWidgetProps) {
  const [feedSource, setFeedSource] = useState<keyof typeof FEED_SOURCES>("googlenews");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className={`glass-panel lg:col-span-1 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}>
      {renderHeader("Feed de Notícias", <Newspaper className="w-3.5 h-3.5 text-primary" />, idx, (
        <div className="flex items-center gap-1.5">
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
        </div>
      ))}

      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 mt-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-border/30 rounded-xl bg-card/20 animate-pulse space-y-2">
              <div className="h-3 w-1/4 bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-2 w-1/2 bg-white/5 rounded" />
            </div>
          ))
        ) : articles.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma notícia encontrada.</p>
        ) : (
          articles.map((art) => (
            <motion.a
              key={art.id}
              href={art.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClickSound}
              onMouseEnter={playHoverSound}
              whileTap={{ scale: 0.98 }}
              className="block p-4 border border-white/5 rounded-2xl bg-black/10 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[13px] font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-3">
                  {art.title}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </div>
              
              {art.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-3 mt-1.5 leading-relaxed font-sans">
                  {art.description}
                </p>
              )}

              <div className="flex items-center justify-between text-[9px] text-white/40 font-mono mt-3 pt-2 border-t border-white/[0.04]">
                <span className="font-extrabold uppercase text-[8px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                  {art.user.name}
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
            </motion.a>
          ))
        )}
      </div>
    </div>
  );
}
