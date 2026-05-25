# Nexus Vault 🌌 — Personal Operating System & Dashboard

O **Nexus Vault** é uma plataforma privada de gerenciamento pessoal e cofre digital avançado com uma interface cyberpunk premium, efeitos neon e design futurista responsivo. Projetado para centralizar e proteger seus dados confidenciais, mídias e ferramentas de uso diário de forma totalmente local e autônoma.

---

## 🚀 Funcionalidades Integradas

### 1. Painel Geral & Sincronização Financeira
- **Painel Analítico:** Monitoramento em tempo real do espaço em disco usado, atividades recentes e acesso a atalhos rápidos.
- **Sincronização Bancária Simulada:** Integração visual de saldos e feeds de transações com o **Santander** e **Mercado Pago** em conexões seguras.
- **Compactação Mobile:** Layout otimizado para dispositivos móveis, organizando widgets em abas inteligentes e poupando espaço útil.

### 2. Chaveiro AES (Credenciais Criptografadas)
- Organização limpa e segura de credenciais com visualização compacta.
- Os dados sensíveis (usuários, senhas, chaves) ficam protegidos e só se revelam dentro de uma gaveta (drawer) interativa ao clicar.
- Suporte a banners visuais/logotipos customizados para cada credencial.

### 3. Cine Vault (Catálogo de Mídias)
- Repositório de filmes, aulas e transmissões favoritas.
- Suporte a upload físico de vídeos (`/public/uploads`) ou inserção de URLs externas.
- Definição de thumbnails customizadas por upload.

### 4. Gerenciador de Torrents
- Adicione torrents à sua lista e realize o download.
- Suporte a magnet links diretos (disparando o uTorrent/BitTorrent local) e uploads físicos de arquivos `.torrent`.

### 5. Galeria UHD (Wallpapers do Sistema)
- Armazene e categorize papéis de parede em alta resolução.
- Upload de imagens diretamente no painel.
- Defina qualquer imagem da galeria como plano de fundo global do dashboard com um clique.

### 6. Cofre de Arquivos & Softwares
- **Softwares:** Catálogo de utilitários e instaladores locais com upload de executáveis e ícones personalizados.
- **Arquivos:** Explorador local para upload de documentos e mídias diversas sem limites de extensão.

### 7. Bloco de Notas Integrado
- Criação rápida de anotações com suporte a markdown e salvamento automático instantâneo com indicador de status no cabeçalho.

### 8. Metas & Gamificação (Leveling System)
- Acompanhamento de metas diárias ou de longo prazo.
- Ganho de XP e aumento de nível de acesso à medida que você cumpre suas metas.

### 9. Ecossistema Avançado de Temas
- **6 Presets Premium Pré-configurados:**
  - 🌌 *Synth Violet* (Synthwave clássico com glows roxos)
  - 🌐 *Cyber Cyan* (Preto absoluto com neon ciano brilhante)
  - 📟 *Matrix Green* (Terminal hacker verde digital com grade pontilhada)
  - 🌅 *Sunset Horizon* (Tons quentes em âmbar e rosa com glow suave)
  - 🗼 *Tokyo Neon* (Vibe noturna urbana com neon rosa)
  - 🎬 *Carbon Stealth* (Monocromático discreto e elegante com textura de carbono)
- **Editor Customizado Completo:** Ajuste fino de cor de realce, intensidade do glow neon (desativado a intenso), estilo do grid de fundo (fino, linhas, pontos, nenhum), velocidade de pulsação de animação e imagem de fundo customizada.

---

## 🛠️ Tecnologias Utilizadas

- **Core:** [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/) rodando no compilador **Turbopack**.
- **Estilização:** Vanilla CSS combinado com [Tailwind CSS v4](https://tailwindcss.com/) para glows neon, gradientes e ambientação cyberpunk.
- **Estado Global:** [Zustand](https://github.com/pmndrs/zustand) para persistência de preferências de temas e densidade do usuário.
- **Animações:** [Framer Motion](https://www.framer.com/motion/) para transições de páginas e micro-interações fluidas.
- **Banco de Dados:** [Prisma ORM](https://www.prisma.io/) com banco de dados relacional local **SQLite**.

---

## ⚙️ Instalação e Inicialização Local

Siga os passos abaixo para rodar o Nexus Vault na sua máquina de desenvolvimento:

### 1. Clonar o Repositório
```bash
git clone https://github.com/caiosobrinho93/caiosobrinho.git
cd caiosobrinho
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar o Banco de Dados (SQLite)
O Prisma criará o arquivo de banco de dados SQLite local automaticamente. Execute:
```bash
npx prisma db push
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o sistema rodando.

### 🔑 Senha de Acesso
O cofre é configurado para uso exclusivo. A senha configurada para descriptografar o sistema é:
👉 **`caio29382`**
*(O banco de dados se auto-inicializará com o perfil admin correto no primeiro login).*
