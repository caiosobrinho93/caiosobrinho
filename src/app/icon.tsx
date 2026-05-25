import { ImageResponse } from "next/og";

// Ícone do Nexus Vault gerado dinamicamente via SVG (100% autônomo e offline)
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          border: "1.5px solid #a78bfa", // Violeta neon
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c084fc" // Ciano/Violeta neon
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
