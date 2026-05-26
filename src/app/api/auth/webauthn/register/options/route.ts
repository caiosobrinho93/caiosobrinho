import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { authenticators: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const host = request.headers.get("host") || "localhost";
    const rpID = host.split(":")[0];

    const options = await generateRegistrationOptions({
      rpName: "Nexus Vault",
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.username,
      userDisplayName: user.username === "caio" ? "Caio" : "Giselle",
      attestationType: "none",
      excludeCredentials: user.authenticators.map(auth => ({
        id: auth.credentialID,
        type: "public-key"
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform" // Exige sensor nativo (Touch ID / Face ID / Digital)
      },
    });

    const response = NextResponse.json(options);
    const cookieStore = await cookies();
    
    // Armazena o challenge num cookie seguro temporário de 5 minutos
    cookieStore.set("reg_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("WebAuthn options error:", error);
    return NextResponse.json({ error: "Erro interno ao gerar opções de biometria" }, { status: 500 });
  }
}
