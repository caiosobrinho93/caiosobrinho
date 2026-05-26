import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("reg_challenge")?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expirado ou inválido. Reinicie o processo." }, { status: 400 });
    }

    const host = request.headers.get("host") || "localhost";
    const rpID = host.split(":")[0];
    const origin = `${host.includes("localhost") ? "http" : "https"}://${host}`;

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error: any) {
      console.error("WebAuthn verification failed:", error);
      return NextResponse.json({ error: error.message || "Falha na verificação biométrica" }, { status: 400 });
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      return NextResponse.json({ error: "Falha na validação das credenciais" }, { status: 400 });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
    const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

    // Converter a chave pública (Uint8Array) para base64 para armazenar como String
    const publicKeyBase64 = Buffer.from(credentialPublicKey).toString("base64");

    // Salvar o novo autenticador para o usuário
    await db.authenticator.create({
      data: {
        userId: session.userId,
        credentialID,
        credentialPublicKey: publicKeyBase64,
        counter: BigInt(counter),
        credentialDeviceType,
        credentialBackedUp,
        transports: body.response.transports ? body.response.transports.join(",") : null
      }
    });

    // Limpar o challenge temporário
    cookieStore.delete("reg_challenge");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("WebAuthn register verify error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao registrar biometria" }, { status: 500 });
  }
}
