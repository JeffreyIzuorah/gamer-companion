"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StartSessionForm() {
    const [gameTitle, setGameTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [mood, setMood] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameTitle, notes, mood }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to start session");
            }

            setGameTitle("");
            setNotes("");
            setMood("");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="gameTitle" className="block text-sm font-medium mb-1">
                    Game Title *
                </label>
                <input
                    type="text"
                    id="gameTitle"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Valorant, League of Legends"
                    required
                />
            </div>

            <div>
                <label htmlFor="mood" className="block text-sm font-medium mb-1">
                    Mood (optional)
                </label>
                <select
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select mood...</option>
                    <option value="HAPPY">Happy</option>
                    <option value="EXCITED">Excited</option>
                    <option value="FOCUSED">Focused</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="FRUSTRATED">Frustrated</option>
                    <option value="TIRED">Tired</option>
                </select>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Notes (optional)
                </label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any thoughts about this session?"
                    rows={3}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
                {isLoading ? "Starting..." : "Start Gaming Session"}
            </button>
        </form>
    );
}