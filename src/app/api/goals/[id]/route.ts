import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { isCompleted } = await request.json();

    const goal = await db.goal.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    if (goal.isCompleted === isCompleted) {
      return NextResponse.json(goal);
    }

    // Calcular novo XP
    const xpChange = isCompleted ? goal.xpReward : -goal.xpReward;

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const newXp = Math.max(0, user.xp + xpChange);
    // Cada 1000 XP sobe um nível. Nível mínimo é 1.
    const newLevel = Math.floor(newXp / 1000) + 1;

    // Atualizar no banco de dados em uma transação
    const [updatedGoal, updatedUser] = await db.$transaction([
      db.goal.update({
        where: { id },
        data: { isCompleted },
      }),
      db.user.update({
        where: { id: session.userId },
        data: {
          xp: newXp,
          level: newLevel,
        },
      }),
    ]);

    return NextResponse.json({
      goal: updatedGoal,
      user: {
        xp: updatedUser.xp,
        level: updatedUser.level,
      },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json({ error: "Erro ao atualizar meta" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const goal = await db.goal.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    // Se a meta deletada estava concluída, deduzir o XP antes de deletar
    if (goal.isCompleted) {
      const user = await db.user.findUnique({
        where: { id: session.userId },
      });
      if (user) {
        const newXp = Math.max(0, user.xp - goal.xpReward);
        const newLevel = Math.floor(newXp / 1000) + 1;
        await db.user.update({
          where: { id: session.userId },
          data: { xp: newXp, level: newLevel },
        });
      }
    }

    await db.goal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar meta:", error);
    return NextResponse.json({ error: "Erro ao deletar meta" }, { status: 500 });
  }
}
