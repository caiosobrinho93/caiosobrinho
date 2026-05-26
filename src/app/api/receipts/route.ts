import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToSupabase } from "@/lib/storage";
import { awardXP } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retorna todos os comprovantes, ordenados por data de pagamento (mais recente primeiro)
    const receipts = await db.receipt.findMany({
      orderBy: { paymentDate: "desc" },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(receipts);
  } catch (error: any) {
    console.error("GET receipts error:", error);
    return NextResponse.json({ error: "Erro ao buscar comprovantes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let description = "";
    let fileUrl = "";
    let amount: number | null = null;
    let paymentDate: string | null = null;
    let category = "Geral";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      description = formData.get("description") as string || "";
      const files = formData.getAll("file") as File[];
      const fileUrlText = formData.get("fileUrl") as string || "";
      const amountText = formData.get("amount") as string;
      amount = amountText ? parseFloat(amountText) : null;
      paymentDate = formData.get("paymentDate") as string || null;
      category = formData.get("category") as string || "Outros";

      const uploadedUrls: string[] = [];
      for (const file of files) {
        if (file && file.size > 0) {
          const url = await uploadToSupabase(file, "receipts");
          uploadedUrls.push(url);
        }
      }
      fileUrl = uploadedUrls.length > 0 ? uploadedUrls.join(",") : fileUrlText;
    } else {
      const body = await request.json();
      title = body.title;
      description = body.description || "";
      fileUrl = body.fileUrl || "";
      amount = body.amount ? parseFloat(body.amount) : null;
      paymentDate = body.paymentDate || null;
      category = body.category || "Outros";
    }

    if (!title) {
      return NextResponse.json(
        { error: "O título do comprovante é obrigatório." },
        { status: 400 }
      );
    }

    const receipt = await db.receipt.create({
      data: {
        title,
        description,
        fileUrl,
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        category,
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

    // Award +50 XP for receipt upload
    await awardXP(session.userId, 50);

    return NextResponse.json(receipt);
  } catch (error: any) {
    console.error("POST receipt error:", error);
    return NextResponse.json({ error: "Erro ao criar comprovante." }, { status: 500 });
  }
}
