"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Mood } from "../../generated/prisma";

export async function startSessionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const gameTitle = String(formData.get("gameTitle") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;
  const rawMood = String(formData.get("mood") || "").trim().toUpperCase();
  const allowedMoods: readonly Mood[] = [
    "HAPPY",
    "NEUTRAL",
    "FRUSTRATED",
    "EXCITED",
    "FOCUSED",
    "TIRED",
  ];
  const mood: Mood | null = (allowedMoods as readonly string[]).includes(rawMood)
    ? (rawMood as Mood)
    : null;

  if (!gameTitle) {
    throw new Error("Game title is required");
  }

  const activeSession = await prisma.gameSession.findFirst({
    where: { userId: session.user.id, endedAt: null },
  });

  if (activeSession) {
    throw new Error("You already have an active session. End it first.");
  }

  let game = await prisma.game.findFirst({
    where: { title: { equals: gameTitle, mode: "insensitive" } },
  });

  if (!game) {
    game = await prisma.game.create({
      data: {
        title: gameTitle,
        developer: "Unknown",
        publisher: "Unknown",
      },
    });
  }

  await prisma.gameSession.create({
    data: {
      userId: session.user.id,
      gameId: game.id,
      notes,
      mood,
      startedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
}

export async function endSessionAction(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const gameSession = await prisma.gameSession.findFirst({
    where: { id: sessionId, userId: session.user.id, endedAt: null },
  });

  if (!gameSession) {
    throw new Error("Session not found");
  }

  const endedAt = new Date();

  const updatedSession = await prisma.gameSession.update({
    where: { id: sessionId },
    data: { endedAt },
    include: { game: true },
  });

  const durationMinutes = Math.floor(
    (endedAt.getTime() - updatedSession.startedAt.getTime()) / 60000
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyGameSummary.upsert({
    where: {
      userId_gameId_date: {
        userId: session.user.id,
        gameId: updatedSession.gameId,
        date: today,
      },
    },
    update: {
      totalMinutes: { increment: durationMinutes },
      sessionCount: { increment: 1 },
    },
    create: {
      userId: session.user.id,
      gameId: gameSession.gameId,
      date: today,
      totalMinutes: durationMinutes,
      sessionCount: 1,
    },
  });

  revalidatePath("/dashboard");
}

export async function listRecentSessions() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const sessions = await prisma.gameSession.findMany({
    where: { userId: session.user.id },
    include: { game: { select: { title: true, coverImage: true } } },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return sessions.map((s) => ({
    ...s,
    duration: s.endedAt
      ? Math.floor((s.endedAt.getTime() - s.startedAt.getTime()) / 60000)
      : null,
  }));
}


