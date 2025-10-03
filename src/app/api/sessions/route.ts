import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { gameTitle, notes, mood } = body;

        if (!gameTitle) {
            return NextResponse.json({ error: "Game title is required" }, { status: 400 });
        }

        const activeSession = await prisma.gameSession.findFirst({
            where: { userId: session.user.id, endedAt: null },
        });

        if (activeSession) {
            return NextResponse.json({ error: "You already have an active session. End it first." }, { status: 400 });
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

        const newSession = await prisma.gameSession.create({
            data: {
                userId: session.user.id,
                gameId: game.id,
                notes,
                mood: mood || null,
                startedAt: new Date(),
            },
            include: {
                game: true,
            },
        });

        return NextResponse.json(newSession);
    } catch (error) {
        console.error("Error creating game session:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sessions = await prisma.gameSession.findMany({
            where: { userId: session.user.id },
            include: { game: { select: { title: true, coverImage: true } } },
            orderBy: { startedAt: "desc" },
            take: 20,
        });

       const sessionsWithDuration = sessions.map((s) => ({
        ...s,
        duration: s.endedAt ? Math.floor((s.endedAt.getTime() - s.startedAt.getTime()) / 60000) : null,
       }));

       return NextResponse.json(sessionsWithDuration);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}