import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXP } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retorna todas as contas de ambos os usuários, ordenadas pelo vencimento
    const bills = await db.bill.findMany({
      orderBy: { dueDate: "asc" },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(bills);
  } catch (error: any) {
    console.error("GET bills error:", error);
    return NextResponse.json({ error: "Erro ao buscar contas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, amount, dueDate, type, status } = await request.json();

    if (!title || amount === undefined || !dueDate || !type) {
      return NextResponse.json(
        { error: "Título, valor, data de vencimento e tipo são obrigatórios." },
        { status: 400 }
      );
    }

    const bill = await db.bill.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        type,
        status: status || "pendente",
        userId: session.userId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Award +30 XP for bill creation
    await awardXP(session.userId, 30);

    return NextResponse.json(bill);
  } catch (error: any) {
    console.error("POST bill error:", error);
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }
}
