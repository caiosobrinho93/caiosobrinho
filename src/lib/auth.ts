import { cookies } from "next/headers";
import { verifySessionToken, UserSessionPayload } from "./jwt";
import { db } from "./db";

export const SESSION_COOKIE_NAME = "nexus_vault_session";

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, createdAt: true },
    });
    return user;
  } catch (error) {
    return null;
  }
}
