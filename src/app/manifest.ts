import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexus Vault",
    short_name: "Nexus",
    description: "Seu dashboard pessoal de senhas, vídeos, torrents e arquivos",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b", // Fundo do splash screen correspondente ao dark mode
    theme_color: "#a78bfa", // Violeta de destaque
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
