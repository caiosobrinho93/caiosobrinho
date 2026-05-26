import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Nome de usuário é obrigatório" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        authenticators: {
          select: { id: true }
        }
      }
    });

    const hasPasskey = !!user && user.authenticators.length > 0;
    return NextResponse.json({ hasPasskey });
  } catch (error: any) {
    console.error("WebAuthn status error:", error);
    return NextResponse.json({ error: "Erro ao verificar status de biometria" }, { status: 500 });
  }
}
