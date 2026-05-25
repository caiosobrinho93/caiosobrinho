import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "O registro de novos usuários está desativado neste cofre pessoal." },
    { status: 403 }
  );
}
