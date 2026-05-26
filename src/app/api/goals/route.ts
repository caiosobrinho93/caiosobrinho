import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { title, xpReward } = await request.json();
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Título inválido" }, { status: 400 });
    }

    const reward = typeof xpReward === "number" ? xpReward : 100;

    const goal = await db.goal.create({
      data: {
        title,
        xpReward: reward,
        userId: session.userId,
        isCompleted: false,
      },
      include: {
        user: {
          select: { username: true }
        }
      }
    });

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}
