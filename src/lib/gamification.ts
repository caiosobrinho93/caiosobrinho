import { db } from "./db";

/**
 * Awards XP to a user and handles leveling up.
 * Cumulative XP model: Every 1000 XP increases the level by 1.
 */
export async function awardXP(userId: string, xpAmount: number) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });
    if (!user) return null;

    const newXp = Math.max(0, user.xp + xpAmount);
    const newLevel = Math.floor(newXp / 1000) + 1;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

    return {
      leveledUp: newLevel > user.level,
      oldLevel: user.level,
      newLevel,
      xp: newXp,
      xpNeeded: 1000,
    };
  } catch (err) {
    console.error("Error awarding XP:", err);
    return null;
  }
}
