import { ImageResponse } from "next/og";

// Ícone do Nexus Vault gerado dinamicamente
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
          fontSize: 20,
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          border: "1.5px solid #a78bfa", // Violeta neon suave
          color: "#c084fc", // Cor neon
          fontWeight: "bold",
        }}
      >
        ❖
      </div>
    ),
    {
      ...size,
    }
  );
}
