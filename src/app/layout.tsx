import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: 'Nexus Vault | Personal Operating System',
  description: 'Secure, private cyberpunk dashboard to organize files, credentials, videos, notes, software, and torrents.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nexus Vault',
  },
  applicationName: 'Nexus Vault',
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  }
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-[100dvh] flex flex-col bg-black text-foreground selection:bg-primary/30 overscroll-none font-sans relative">
        <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 animate-gradient-bg pointer-events-none" />
        <ThemeProvider>{children}</ThemeProvider>
        
        {/* Script para PWA Service Worker e auto-recuperação de erros de carregamento (ChunkLoadError) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Intercepta erros de carregamento de scripts/links estáticos (ex: chunks antigos deletados no deploy)
              window.addEventListener('error', function(e) {
                const target = e.target;
                if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                  const url = target.src || target.href;
                  if (url && url.indexOf('/_next/static/') !== -1) {
                    console.warn('Next.js static asset failed to load. Clearing cache and reloading...', url);
                    
                    // Armazena no sessionStorage para evitar reloads infinitos se o problema persistir
                    const now = Date.now();
                    const lastReload = sessionStorage.getItem('last_auto_reload');
                    if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
                      sessionStorage.setItem('last_auto_reload', now.toString());
                      
                      // Desregistra Service Worker e limpa cache para recomeçar limpo
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                          for (let reg of registrations) {
                            reg.unregister();
                          }
                        });
                      }
                      if ('caches' in window) {
                        caches.keys().then(function(names) {
                          for (let name of names) caches.delete(name);
                        });
                      }
                      
                      setTimeout(function() {
                        window.location.reload();
                      }, 400);
                    }
                  }
                }
              }, true);

              // Intercepta erros não tratados (ChunkLoadError de Promises de importação dinâmica)
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (e.reason.name === 'ChunkLoadError' || (e.reason.message && e.reason.message.indexOf('Loading chunk') !== -1))) {
                  console.warn('ChunkLoadError detectado. Limpando cache e recarregando...');
                  
                  const now = Date.now();
                  const lastReload = sessionStorage.getItem('last_auto_reload');
                  if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
                    sessionStorage.setItem('last_auto_reload', now.toString());
                    
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for (let reg of registrations) {
                          reg.unregister();
                        }
                      });
                    }
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                      });
                    }
                    
                    setTimeout(function() {
                      window.location.reload();
                    }, 400);
                  }
                }
              });

              // Registro do Service Worker
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) {
                      console.log('Nexus Vault PWA ServiceWorker registrado com escopo: ', reg.scope);
                    },
                    function(err) {
                      console.log('Falha ao registrar ServiceWorker: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

