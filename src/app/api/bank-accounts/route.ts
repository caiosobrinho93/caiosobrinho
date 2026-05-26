import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const accounts = await db.bankAccount.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Failed to fetch bank accounts:", error);
    return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { provider, balance, trend, accountNumber, apiKey, apiSecret, syncType } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    const newAccount = await db.bankAccount.create({
      data: {
        userId: session.userId,
        provider,
        balance: parseFloat(balance) || 0.0,
        trend: trend || "+0.0% este mês",
        accountNumber: accountNumber || null,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null,
        syncType: syncType || "manual",
        lastSync: new Date(),
      },
    });

    return NextResponse.json(newAccount);
  } catch (error) {
    console.error("Failed to create bank account:", error);
    return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 });
  }
}
