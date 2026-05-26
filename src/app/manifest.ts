import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?pwa=1", // Identificador único e estável para navegadores e SOs
    name: "Nexus Vault",
    short_name: "Nexus",
    description: "Seu dashboard pessoal de senhas, vídeos, torrents e arquivos",
    start_url: "/?pwa=1",
    display: "standalone",
    background_color: "#09090b", // Fundo do splash screen
    theme_color: "#a78bfa", // Violeta de destaque
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
