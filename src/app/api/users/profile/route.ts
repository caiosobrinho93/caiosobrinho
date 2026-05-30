import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToSupabase } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const profileImageFile = formData.get("profileImage") as File | null;
    const coverImageFile = formData.get("coverImage") as File | null;
    
    // Check if we also received direct string URLs instead of files
    const profileImageUrl = formData.get("profileImageUrl") as string | null;
    const coverImageUrl = formData.get("coverImageUrl") as string | null;

    let updatedProfileImage = profileImageUrl || undefined;
    let updatedCoverImage = coverImageUrl || undefined;

    if (profileImageFile && profileImageFile.size > 0) {
      updatedProfileImage = await uploadToSupabase(profileImageFile, "profiles");
    }

    if (coverImageFile && coverImageFile.size > 0) {
      updatedCoverImage = await uploadToSupabase(coverImageFile, "profiles");
    }

    const dataToUpdate: any = {};
    if (updatedProfileImage !== undefined) dataToUpdate.profileImage = updatedProfileImage;
    if (updatedCoverImage !== undefined) dataToUpdate.coverImage = updatedCoverImage;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No data provided to update" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        xp: true,
        level: true,
        profileImage: true,
        coverImage: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("POST profile upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
