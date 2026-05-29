import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import { awardXP } from "@/lib/gamification";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const passwords = await db.password.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        isFavorite: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const minimalPasswords = passwords.map((p) => ({
      ...p,
      password: "", // Omit password
      email: "",
      notes: "",
      url: "",
      createdBy: p.user.username,
    }));

    return NextResponse.json(minimalPasswords);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch passwords" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, username, email, password, url, imageUrl, notes, category, tags } = await request.json();

    if (!title || !password) {
      return NextResponse.json({ error: "Title and Password are required" }, { status: 400 });
    }

    // Encrypt password
    const encryptedPassword = encrypt(password);

    const newPasswordRecord = await db.password.create({
      data: {
        userId: session.userId,
        title,
        username: username || "",
        email: email || "",
        password: encryptedPassword,
        url: url || "",
        imageUrl: imageUrl || "",
        notes: notes || "",
        category: category || "General",
        tags: tags || "",
      },
    });

    // Award +30 XP for password creation
    await awardXP(session.userId, 30);

    return NextResponse.json({
      ...newPasswordRecord,
      password: password, // Return original decrypted password to client
    });
  } catch (error) {
    console.error("Create password error:", error);
    return NextResponse.json({ error: "Failed to create password" }, { status: 500 });
  }
}
