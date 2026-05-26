import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const components = await db.devComponent.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error("Error fetching dev components:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, htmlCode, cssCode, jsCode, category } = body;

    const component = await db.devComponent.create({
      data: {
        userId: session.userId,
        title: title || "Novo Componente",
        description: description || "",
        htmlCode: htmlCode || "",
        cssCode: cssCode || "",
        jsCode: jsCode || "",
        category: category || "Geral",
      },
    });

    return NextResponse.json(component);
  } catch (error) {
    console.error("Error creating dev component:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
