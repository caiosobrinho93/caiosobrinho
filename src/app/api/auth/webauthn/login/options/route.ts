import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ error: "Nome de usuário é obrigatório" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { authenticators: true }
    });

    if (!user || user.authenticators.length === 0) {
      return NextResponse.json({ error: "Nenhuma biometria cadastrada para este usuário" }, { status: 400 });
    }

    const host = request.headers.get("host") || "localhost";
    const rpID = host.split(":")[0];

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.authenticators.map(auth => ({
        id: auth.credentialID,
        type: "public-key",
        transports: auth.transports ? auth.transports.split(",") as any : undefined
      })),
      userVerification: "preferred",
    });

    const cookieStore = await cookies();
    
    // Salva o challenge e o username nos cookies temporários
    cookieStore.set("login_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5,
      path: "/",
    });
    
    cookieStore.set("login_username", user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5,
      path: "/",
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error("WebAuthn login options error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao gerar opções de login" }, { status: 500 });
  }
}
