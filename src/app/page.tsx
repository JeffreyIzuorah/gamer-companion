import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Gaming Companion</h1>
          <p className="text-xl mb-8 text-slate-300">
            Track your gaming sessions, analyze your playtime, and share with friends.
          </p>
          
          <div className="space-x-4">
            <Link 
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/test-auth"
              className="border border-slate-300 hover:bg-slate-800 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Track Sessions</h3>
            <p className="text-slate-300">Log your gaming sessions with detailed tracking and notes.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">View Stats</h3>
            <p className="text-slate-300">Analyze your gaming patterns and see detailed statistics.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Share Progress</h3>
            <p className="text-slate-300">Compare your gaming activity with friends.</p>
          </div>
        </div>
      </div>
    </div>
  );
}