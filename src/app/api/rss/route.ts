import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "googlenews";

  const FEED_URLS: Record<string, string> = {
    g1: "https://g1.globo.com/rss/g1/",
    techtudo: "https://g1.globo.com/rss/g1/tecnologia/",
    googlenews: "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419",
    ign: "https://br.ign.com/feed.xml",
    ge: "https://globoesporte.globo.com/rss/ge/"
  };

  const url = FEED_URLS[source];
  if (!url) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}`);
    }

    const xmlText = await response.text();

    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    const clean = (str: string) => {
      return str
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Clean CDATA
        .replace(/<[^>]+>/g, "") // Strip HTML
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    };

    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 15) {
      const itemContent = match[1];

      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
      const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
      const descMatch = /<description>([\s\S]*?)<\/description>/.exec(itemContent);
      const dateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);
      const creatorMatch = /<(dc:creator|creator)>([\s\S]*?)<\/(dc:creator|creator)>/.exec(itemContent);

      const title = titleMatch ? clean(titleMatch[1]) : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const description = descMatch ? clean(descMatch[1]) : "";
      const pubDate = dateMatch ? clean(dateMatch[1]) : "";
      const creator = creatorMatch ? clean(creatorMatch[2]) : "";

      items.push({
        id: link || Math.random().toString(),
        title,
        description: description.substring(0, 180) + (description.length > 180 ? "..." : ""),
        url: link,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        user: { name: creator || (source === "g1" ? "G1" : source === "techtudo" ? "TechTudo" : source === "googlenews" ? "Google News" : source === "ign" ? "IGN" : "Esportes") }
      });
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("RSS parser API error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse feed" }, { status: 500 });
  }
}
