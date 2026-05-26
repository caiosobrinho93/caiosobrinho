import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let rewards = await db.reward.findMany({
      orderBy: { costXp: "asc" }
    });

    // Se a tabela estiver vazia, popular com as recompensas gamer padrão Pix
    if (rewards.length === 0) {
      try {
        const defaultRewards = [
          { title: "Pix Bronze 🔓", costXp: 500, amount: 10.00, status: "disponivel" },
          { title: "Pix Prata 🏆", costXp: 1500, amount: 50.00, status: "disponivel" },
          { title: "Pix Ouro 👑", costXp: 3000, amount: 100.00, status: "disponivel" }
        ];

        for (const item of defaultRewards) {
          await db.reward.create({ data: item });
        }

        rewards = await db.reward.findMany({
          orderBy: { costXp: "asc" }
        });
      } catch (err) {
        console.error("Erro ao criar recompensas padrão:", err);
      }
    }

    return NextResponse.json(rewards);
  } catch (error) {
    console.error("Failed to fetch rewards:", error);
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, costXp, amount } = await req.json();

    if (!title || !costXp || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReward = await db.reward.create({
      data: {
        title,
        costXp: parseInt(costXp),
        amount: parseFloat(amount),
        status: "disponivel"
      }
    });

    return NextResponse.json(newReward);
  } catch (error) {
    console.error("Failed to create reward:", error);
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 });
  }
}
