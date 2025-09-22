import { auth, signIn, signOut } from "@/lib/auth";

export default async function TestAuthPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not signed in</h1>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button 
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Signed in!</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Session Data:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="space-y-2 text-sm">
        <p><strong>User ID:</strong> {session.user.id}</p>
        <p><strong>Name:</strong> {session.user.name}</p>
        <p><strong>Email:</strong> {session.user.email}</p>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
        className="mt-4"
      >
        <button 
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}