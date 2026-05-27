"use client";

import React, { useEffect, useState } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { playClickSound, playHoverSound } from "./CyberAudio";

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
  tech: {
    label: "Tech",
    type: "devto",
    url: "https://dev.to/api/articles?tag=technology&per_page=3",
  },
  br_mundo: {
    label: "Brasil & Mundo",
    type: "rss",
    url: "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419",
  },
  esportes: {
    label: "Esportes",
    type: "rss",
    url: "https://globoesporte.globo.com/rss/ge/",
  },
  jogos: {
    label: "Jogos",
    type: "rss",
    url: "https://br.ign.com/feed.xml",
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
  const [feedSource, setFeedSource] = useState<keyof typeof FEED_SOURCES>("tech");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async (currentSource: keyof typeof FEED_SOURCES) => {
    setIsLoading(true);
    try {
      const source = FEED_SOURCES[currentSource];
      let url = source.url;

      if (source.type === "rss") {
        url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
      }

      const res = await fetch(url, {
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const data = await res.json();
        
        if (source.type === "devto" && Array.isArray(data) && data.length > 0) {
          setArticles(data.slice(0, 3).map((art: any) => ({
            id: art.id,
            title: art.title,
            description: art.description || "",
            url: art.url,
            published_at: art.published_at,
            user: { name: art.user?.name || source.label }
          })));
          setIsLoading(false);
          return;
        } else if (source.type === "rss" && data.items && data.items.length > 0) {
          setArticles(data.items.slice(0, 3).map((item: any, index: number) => ({
            id: item.guid || index.toString(),
            title: item.title,
            description: (item.description || "").replace(/<[^>]+>/g, '').substring(0, 150) + "...",
            url: item.link,
            published_at: item.pubDate,
            user: { name: item.author || source.label }
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
    fetchNews(feedSource);
  }, [feedSource]);

  return (
    <div className={`glass-panel lg:col-span-1 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}>
      {renderHeader("RSS Feed", <Newspaper className="w-3.5 h-3.5 text-[#8fe319]" />, idx, (
        <div className="flex items-center gap-1.5">
          <select
            value={feedSource}
            onChange={(e) => {
              playClickSound();
              setFeedSource(e.target.value as keyof typeof FEED_SOURCES);
            }}
            onMouseEnter={playHoverSound}
            className="bg-muted/15 border border-border/40 text-[9px] text-muted-foreground rounded p-0.5 outline-none hover:text-[#8fe319] hover:border-[#8fe319]/40 cursor-pointer transition-colors max-w-[100px] truncate"
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
            className="p-1 rounded bg-muted/15 border border-border/40 text-muted-foreground hover:text-[#8fe319] hover:border-[#8fe319]/40 transition-colors cursor-pointer"
            title="Recarregar Feed"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
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
              className="block p-5 border border-border/30 rounded bg-card/25 hover:border-[#8fe319]/40 hover:bg-[#8fe319]/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-bold text-white leading-tight group-hover:text-[#8fe319] transition-colors line-clamp-5">
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
