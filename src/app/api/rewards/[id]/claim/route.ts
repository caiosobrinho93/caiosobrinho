import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // 1. Obter a recompensa
    const reward = await db.reward.findUnique({
      where: { id }
    });

    if (!reward) {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 });
    }

    if (reward.status !== "disponivel") {
      return NextResponse.json({ error: "Esta recompensa já foi resgatada" }, { status: 400 });
    }

    // 2. Obter o usuário logado
    const user = await db.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 3. Validar se o usuário possui XP suficiente
    if (user.xp < reward.costXp) {
      return NextResponse.json({ 
        error: `XP insuficiente. Você possui ${user.xp} XP, mas esta recompensa custa ${reward.costXp} XP.` 
      }, { status: 400 });
    }

    // 4. Buscar o OUTRO usuário para criar a conta a pagar
    const otherUsername = user.username === "caio" ? "giselle" : "caio";
    let otherUser = await db.user.findFirst({
      where: { username: otherUsername }
    });

    // Se o outro usuário ainda não existe no banco, criar um dummy ou associar a ele próprio
    if (!otherUser) {
      try {
        otherUser = await db.user.create({
          data: {
            username: otherUsername,
            passwordHash: "dummy_pass_hash"
          }
        });
      } catch (err) {
        console.error("Failed to auto-create other user:", err);
      }
    }

    const billUserId = otherUser ? otherUser.id : user.id;
    const cleanUsername = user.username === "caio" ? "Caio" : "Giselle";

    // 5. Aplicar o resgate em uma transação do Prisma
    const newXp = Math.max(0, user.xp - reward.costXp);
    const newLevel = Math.floor(newXp / 1000) + 1;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 dias de vencimento para o Pix

    const [updatedReward, updatedUser, createdBill] = await db.$transaction([
      // Marcar recompensa como resgatada
      db.reward.update({
        where: { id },
        data: {
          status: "resgatado",
          claimedBy: user.username,
          claimedAt: new Date()
        }
      }),
      // Deduzir o XP e recalcular nível
      db.user.update({
        where: { id: user.id },
        data: {
          xp: newXp,
          level: newLevel
        }
      }),
      // Criar a conta a pagar para o parceiro
      db.bill.create({
        data: {
          title: `Pix Prêmio: ${reward.title} resgatado por ${cleanUsername}`,
          amount: reward.amount,
          dueDate: dueDate,
          type: "pagar",
          status: "pendente",
          userId: billUserId
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      reward: updatedReward,
      user: {
        xp: updatedUser.xp,
        level: updatedUser.level
      },
      bill: createdBill
    });

  } catch (error) {
    console.error("Failed to claim reward:", error);
    return NextResponse.json({ error: "Erro interno durante o resgate" }, { status: 500 });
  }
}
