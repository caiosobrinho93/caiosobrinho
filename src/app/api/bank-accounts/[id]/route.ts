import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { provider, balance, trend, accountNumber, apiKey, apiSecret, syncType } = await req.json();

    // Validar se pertence ao usuário
    const account = await db.bankAccount.findFirst({
      where: { id, userId: session.userId },
    });

    if (!account) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    const updated = await db.bankAccount.update({
      where: { id },
      data: {
        provider: provider !== undefined ? provider : account.provider,
        balance: balance !== undefined ? parseFloat(balance) : account.balance,
        trend: trend !== undefined ? trend : account.trend,
        accountNumber: accountNumber !== undefined ? accountNumber : account.accountNumber,
        apiKey: apiKey !== undefined ? apiKey : account.apiKey,
        apiSecret: apiSecret !== undefined ? apiSecret : account.apiSecret,
        syncType: syncType !== undefined ? syncType : account.syncType,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update bank account:", error);
    return NextResponse.json({ error: "Failed to update bank account" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const account = await db.bankAccount.findFirst({
      where: { id, userId: session.userId },
    });

    if (!account) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    await db.bankAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete bank account:", error);
    return NextResponse.json({ error: "Failed to delete bank account" }, { status: 500 });
  }
}
