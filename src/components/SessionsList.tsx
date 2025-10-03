"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type GameSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  notes: string | null;
  mood: string | null;
  game: {
    title: string;
  };
};

export function SessionsList() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [endingSession, setEndingSession] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    setEndingSession(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
        fetchSessions();
      }
    } catch (error) {
      console.error("Failed to end session:", error);
    } finally {
      setEndingSession(null);
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return "Active";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No gaming sessions yet. Start your first session above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{session.game.title}</h4>
              <p className="text-sm text-gray-600">
                Started: {formatDate(session.startedAt)}
              </p>
              {session.endedAt && (
                <p className="text-sm text-gray-600">
                  Ended: {formatDate(session.endedAt)}
                </p>
              )}
              {session.mood && (
                <p className="text-sm text-gray-600">Mood: {session.mood}</p>
              )}
              {session.notes && (
                <p className="text-sm text-gray-700 mt-2">{session.notes}</p>
              )}
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  session.endedAt
                    ? "bg-gray-200 text-gray-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {formatDuration(session.duration)}
              </span>
              {!session.endedAt && (
                <button
                  onClick={() => handleEndSession(session.id)}
                  disabled={endingSession === session.id}
                  className="mt-2 block bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-1 rounded text-sm transition-colors"
                >
                  {endingSession === session.id ? "Ending..." : "End Session"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}