import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { createSessionToken } from "@/lib/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    
    const expectedChallenge = cookieStore.get("login_challenge")?.value;
    const username = cookieStore.get("login_username")?.value;

    if (!expectedChallenge || !username) {
      return NextResponse.json({ error: "Sessão de autenticação expirada ou inválida. Tente novamente." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { username },
      include: { authenticators: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Encontra o autenticador correspondente
    const authenticator = user.authenticators.find(auth => auth.credentialID === body.id);
    if (!authenticator) {
      return NextResponse.json({ error: "Biometria não cadastrada ou não associada a este usuário" }, { status: 400 });
    }

    const host = request.headers.get("host") || "localhost";
    const rpID = host.split(":")[0];
    const origin = `${host.includes("localhost") ? "http" : "https"}://${host}`;

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: authenticator.credentialID,
          publicKey: new Uint8Array(Buffer.from(authenticator.credentialPublicKey, "base64")),
          counter: Number(authenticator.counter),
          transports: authenticator.transports ? authenticator.transports.split(",") as any : undefined
        }
      });
    } catch (err: any) {
      console.error("WebAuthn verify error:", err);
      return NextResponse.json({ error: err.message || "Falha na validação biométrica" }, { status: 400 });
    }

    const { verified, authenticationInfo } = verification;

    if (!verified || !authenticationInfo) {
      return NextResponse.json({ error: "Assinatura biométrica inválida" }, { status: 400 });
    }

    // Atualiza o contador no banco de dados para segurança replay
    await db.authenticator.update({
      where: { id: authenticator.id },
      data: { counter: BigInt(authenticationInfo.newCounter) }
    });

    // Cria token de sessão JWT idêntico ao login por senha
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
    });

    const response = NextResponse.json({ success: true, user: { id: user.id, username: user.username } });

    // Configura o cookie httpOnly
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    // Limpar cookies temporários
    cookieStore.delete("login_challenge");
    cookieStore.delete("login_username");

    return response;
  } catch (error: any) {
    console.error("WebAuthn login verify error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao autenticar biometria" }, { status: 500 });
  }
}
