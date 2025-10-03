import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sessionId = await params.id;

        const gameSession = await prisma.gameSession.findFirst({
            where: { id: sessionId, userId: session.user.id, endedAt: null },
        });

        if (!gameSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const endedAt = new Date();

        const updatedSession = await prisma.gameSession.update({
            where: { id: sessionId },
            data: { endedAt },
            include: { game: true },
        });

        const durationMinutes = Math.floor((endedAt.getTime() - updatedSession.startedAt.getTime()) / 60000);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.dailyGameSummary.upsert({
            where: { userId_gameId_date: { userId: session.user.id, gameId: updatedSession.gameId, date: today } },
            update: { totalMinutes: { increment: durationMinutes }, sessionCount: { increment: 1 } },
            create: { userId: session.user.id, gameId: gameSession.gameId, date: today, totalMinutes: durationMinutes, sessionCount: 1 },
        });
        return NextResponse.json({
            ...updatedSession,
            duration: durationMinutes,
        });
    } catch (error) {
        console.error("Error ending session:", error);
        return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
    }

}