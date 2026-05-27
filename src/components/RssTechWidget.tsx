"use client";

import React, { useEffect, useState } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { playClickSound, playHoverSound } from "./CyberAudio";

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  user: {
    name: string;
  };
}

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
  },
  {
    id: 3,
    title: "PWA Viewport Fit: Notch Optimization for Fullscreen APKs",
    description: "Designing edge-to-edge mobile web apps using env(safe-area-inset-top) and display: fullscreen configuration.",
    url: "https://web.dev",
    published_at: new Date().toISOString(),
    user: { name: "Chrome Devs" }
  }
];

interface RssTechWidgetProps {
  idx: number;
  renderHeader: (title: string, icon: React.ReactNode, idx: number, extraActions?: React.ReactNode) => React.ReactNode;
  itemVariants: any;
  activeMobileTab: string;
}

export default function RssTechWidget({ idx, renderHeader, itemVariants, activeMobileTab }: RssTechWidgetProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://dev.to/api/articles?tag=technology&per_page=3", {
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data.map((art: any) => ({
            id: art.id,
            title: art.title,
            description: art.description || "",
            url: art.url,
            published_at: art.published_at,
            user: { name: art.user?.name || "Tech Feed" }
          })));
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
    fetchNews();
  }, []);

  return (
    <div className={`glass-panel lg:col-span-1 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}>
      {renderHeader("RSS Tech Feed", <Newspaper className="w-3.5 h-3.5 text-primary" />, idx, (
        <button
          onClick={() => { playClickSound(); fetchNews(); }}
          onMouseEnter={playHoverSound}
          className="p-1 rounded bg-muted/15 border border-border/40 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          title="Recarregar Feed"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      ))}

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-5 border border-border/30 rounded bg-card/25 animate-pulse space-y-1">
              <div className="h-2 w-3/4 bg-muted rounded" />
              <div className="h-1.5 w-full bg-muted rounded" />
              <div className="h-1.5 w-1/2 bg-muted rounded" />
            </div>
          ))
        ) : (
          articles.map((art) => (
            <a
              key={art.id}
              href={art.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClickSound}
              onMouseEnter={playHoverSound}
              className="block p-5 border border-border/30 rounded bg-card/25 hover:border-primary/20 hover:bg-muted/15 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-bold text-white leading-tight group-hover:text-primary transition-colors line-clamp-5">
                  {art.title}
                </span>
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-5 mt-1 leading-snug">
                {art.description}
              </p>
              <div className="flex items-center justify-between text-[7px] text-muted-foreground font-mono mt-1 pt-1 border-t border-border/10">
                <span>By {art.user.name}</span>
                <span>
                  {new Date(art.published_at).toLocaleDateString("pt-BR", {
                    month: "short",
                    day: "numeric"
                  })}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
