import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "A senha de acesso é obrigatória." },
        { status: 400 }
      );
    }

    let username = "";
    if (password === "caio29382") {
      username = "caio";
    } else if (password === "esposa29382" || password === "giselle29382") {
      username = "giselle";
    } else {
      return NextResponse.json(
        { error: "Senha de acesso incorreta." },
        { status: 400 }
      );
    }

    // Auto-create user if missing
    let user = await db.user.findUnique({
      where: { username },
    });

    if (!user && username === "giselle") {
      // If looking for "giselle", check if "esposa" exists and rename it
      const oldEsposa = await db.user.findUnique({
        where: { username: "esposa" },
      });
      if (oldEsposa) {
        user = await db.user.update({
          where: { username: "esposa" },
          data: { username: "giselle" },
        });
        console.log("Migrated user 'esposa' to 'giselle'");
      }
    }

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await db.user.create({
        data: {
          username,
          passwordHash,
          xp: 0,
          level: 1,
        },
      });
    }

    // Create session
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
    });

    const response = NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
    
    // Set httpOnly cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor durante a autenticação." },
      { status: 500 }
    );
  }
}
