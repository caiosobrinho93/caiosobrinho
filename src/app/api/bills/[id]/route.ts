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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.amount !== undefined) data.amount = parseFloat(body.amount);
    if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);
    if (body.type !== undefined) data.type = body.type;
    if (body.status !== undefined) data.status = body.status;
    if (body.paymentDate !== undefined) {
      data.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null;
    }

    const bill = await db.bill.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(bill);
  } catch (error: any) {
    console.error("PATCH bill error:", error);
    return NextResponse.json({ error: "Erro ao atualizar conta." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.bill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE bill error:", error);
    return NextResponse.json({ error: "Erro ao excluir conta." }, { status: 500 });
  }
}
